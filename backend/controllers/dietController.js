// controllers/dietController.js
const DietPlan = require('../models/DietPlan');
const cloudinary = require('cloudinary').v2;
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const { validationResult } = require('express-validator');
const { dietPlanTemplate } = require('../utils/dietPlanTemplate');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Generate PDF for diet plan
const generateDietPlanPDF = async (dietPlan) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Compile template
    const template = handlebars.compile(dietPlanTemplate, {
      noEscape: true,
      strict: false
    });
    
    // Convert to plain object to avoid prototype issues
    const plainDietPlan = JSON.parse(JSON.stringify(dietPlan));
    
    const templateData = {
      title: plainDietPlan.title || 'Diet Plan',
      targetAudience: (plainDietPlan.targetAudience || 'general').replace('_', ' ').toUpperCase(),
      duration: plainDietPlan.duration || '1 week',
      totalCalories: plainDietPlan.totalCalories || 0,
      meals: plainDietPlan.meals || [],
      notes: plainDietPlan.notes || '',
      generatedDate: new Date().toLocaleDateString('en-IN')
    };
    
    const html = template(templateData);
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    // Upload to Cloudinary
    const publicId = `diet-plans/plan_${dietPlan._id}_${Date.now()}`;
    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: publicId,
          format: 'pdf',
          type: 'upload',
          access_mode: 'public'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(pdfBuffer);
    });
    
    return uploadResult;
    
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Create diet plan
const createDietPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const dietPlanData = {
      ...req.body,
      createdBy: req.admin.adminId
    };

    // Calculate total calories
    let totalCalories = 0;
    if (dietPlanData.meals) {
      dietPlanData.meals.forEach(meal => {
        if (meal.items) {
          meal.items.forEach(item => {
            totalCalories += item.calories || 0;
          });
        }
      });
    }
    dietPlanData.totalCalories = totalCalories;

    const dietPlan = new DietPlan(dietPlanData);
    await dietPlan.save();

    // Generate PDF
    let pdfGenerated = false;
    try {
      const pdfResult = await generateDietPlanPDF(dietPlan);
      
      if (pdfResult && pdfResult.secure_url) {
        dietPlan.pdfUrl = pdfResult.secure_url;
        dietPlan.cloudinaryPublicId = pdfResult.public_id;
        await dietPlan.save();
        pdfGenerated = true;
      }
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
    }

    const populatedDietPlan = await DietPlan.findById(dietPlan._id).populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: `Diet plan created successfully${pdfGenerated ? ' with PDF' : ''}`,
      dietPlan: populatedDietPlan
    });

  } catch (error) {
    console.error('Create diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diet plan'
    });
  }
};

// Get all diet plans
const getDietPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', targetAudience = '' } = req.query;

    const query = { isActive: true };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (targetAudience) {
      query.targetAudience = targetAudience;
    }

    const dietPlans = await DietPlan.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DietPlan.countDocuments(query);

    res.status(200).json({
      success: true,
      dietPlans,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: dietPlans.length,
        totalPlans: total
      }
    });
  } catch (error) {
    console.error('Get diet plans error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plans'
    });
  }
};

// Get single diet plan
const getDietPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const dietPlan = await DietPlan.findById(id)
      .populate('createdBy', 'name');

    if (!dietPlan || !dietPlan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    res.status(200).json({
      success: true,
      dietPlan
    });
  } catch (error) {
    console.error('Get diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plan'
    });
  }
};

// Update diet plan
const updateDietPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Calculate total calories if meals are updated
    if (updateData.meals) {
      let totalCalories = 0;
      updateData.meals.forEach(meal => {
        if (meal.items) {
          meal.items.forEach(item => {
            totalCalories += item.calories || 0;
          });
        }
      });
      updateData.totalCalories = totalCalories;
    }

    const dietPlan = await DietPlan.findByIdAndUpdate(id, updateData, { new: true });
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    // Regenerate PDF if content changed
    let pdfRegenerated = false;
    if (updateData.meals || updateData.title || updateData.notes) {
      try {
        // Delete old PDF
        if (dietPlan.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(dietPlan.cloudinaryPublicId, { resource_type: 'raw' });
        }

        // Generate new PDF
        const pdfResult = await generateDietPlanPDF(dietPlan);
        if (pdfResult && pdfResult.secure_url) {
          dietPlan.pdfUrl = pdfResult.secure_url;
          dietPlan.cloudinaryPublicId = pdfResult.public_id;
          await dietPlan.save();
          pdfRegenerated = true;
        }
      } catch (pdfError) {
        console.error('PDF regeneration error:', pdfError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Diet plan updated successfully${pdfRegenerated ? ' with new PDF' : ''}`,
      dietPlan
    });
  } catch (error) {
    console.error('Update diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diet plan'
    });
  }
};

// Delete diet plan
const deleteDietPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const dietPlan = await DietPlan.findById(id);
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }

    // Delete PDF from Cloudinary
    if (dietPlan.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(dietPlan.cloudinaryPublicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    // Soft delete
    dietPlan.isActive = false;
    await dietPlan.save();

    res.status(200).json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diet plan'
    });
  }
};

module.exports = {
  createDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan
};