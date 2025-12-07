const DietPlan = require('../models/DietPlan');
const cloudinary = require('cloudinary').v2;
const handlebars = require('handlebars');
const { validationResult } = require('express-validator');
const { dietPlanTemplate } = require('../utils/dietPlanTemplate');
const { generatePDF, isPDFGenerationAvailable } = require('../utils/pdfGenerator');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Generate PDF for diet plan (works in both local and Lambda)
const generateDietPlanPDF = async (dietPlan) => {
  // Check if PDF generation is available
  if (!isPDFGenerationAvailable()) {
    console.log('⚠️ PDF generation not available in this environment');
    return null;
  }

  try {
    console.log('📋 Starting PDF generation for diet plan:', dietPlan._id);
    
    // Compile template
    const template = handlebars.compile(dietPlanTemplate, {
      noEscape: true,
      strict: false
    });
    
    // Convert to plain object to avoid prototype issues
    const plainDietPlan = JSON.parse(JSON.stringify(dietPlan));
    
    // Calculate totals with null checks
    let totalCalories = 0;
    let totalProtein = 0;
    
    if (plainDietPlan.meals && Array.isArray(plainDietPlan.meals)) {
      plainDietPlan.meals = plainDietPlan.meals.map(meal => {
        meal = meal || {};
        meal.name = meal.name || 'Meal';
        meal.time = meal.time || '';
        meal.items = meal.items || [];
        meal.instructions = meal.instructions || '';
        
        meal.items = meal.items.map(item => ({
          food: item.food || 'Food item',
          ingredients: item.ingredients || '',
          quantity: item.quantity || '',
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0
        }));
        
        meal.items.forEach(item => {
          totalCalories += item.calories || 0;
          totalProtein += item.protein || 0;
        });
        
        return meal;
      });
    }
    
    const templateData = {
      title: plainDietPlan.title || 'Diet Plan',
      targetAudience: (plainDietPlan.targetAudience || 'general').replace('_', ' ').toUpperCase(),
      duration: plainDietPlan.duration || '1 week',
      totalCalories: totalCalories,
      totalProtein: Math.round(totalProtein * 10) / 10,
      meals: plainDietPlan.meals || [],
      notes: plainDietPlan.notes || '',
      generatedDate: new Date().toLocaleDateString('en-IN')
    };
    
    const html = template(templateData);
    
    // Generate PDF using environment-aware function
    console.log('🖨️ Generating PDF...');
    const pdfBuffer = await generatePDF(html, {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15px',
        right: '15px',
        bottom: '15px',
        left: '15px'
      }
    });
    
    // Upload to Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration not set');
    }
    
    const publicId = `diet-plans/plan_${dietPlan._id}_${Date.now()}`;
    
    console.log('☁️ Uploading PDF to Cloudinary...');
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
            console.error('Cloudinary upload error:', error?.message || error);
            reject(error);
          } else {
            console.log('✅ PDF uploaded successfully');
            resolve(result);
          }
        }
      ).end(pdfBuffer);
    });
    
    return uploadResult;
    
  } catch (error) {
    console.error('❌ generateDietPlanPDF error:', error?.message || error);
    return null; // Return null instead of throwing to not break the flow
  }
};

// Helper function to process diet plan data
const processDietPlanData = (data) => {
  const meals = Array.isArray(data.meals) ? data.meals : [];
  
  const processedMeals = meals.map(meal => ({
    name: meal.name || 'Meal',
    time: meal.time || '',
    instructions: meal.instructions || '',
    items: Array.isArray(meal.items) ? meal.items.map(item => ({
      food: item.food || 'Food item',
      quantity: item.quantity || '',
      calories: Number(item.calories) || 0,
      protein: Number(item.protein) || 0,
      ingredients: item.ingredients || ''
    })) : []
  }));

  return {
    title: data.title || 'Untitled Diet Plan',
    targetAudience: data.targetAudience || 'general',
    duration: data.duration || '1 week',
    notes: data.notes || '',
    meals: processedMeals,
    createdBy: data.createdBy
  };
};

// Create diet plan
const createDietPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const processedData = processDietPlanData({
      ...req.body,
      createdBy: req.user.id
    });

    const dietPlan = new DietPlan(processedData);
    await dietPlan.save();

    // Generate PDF (works in both local and Lambda)
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
      console.error('PDF generation failed:', pdfError.message);
      // Continue without PDF - not critical
    }

    const populatedDietPlan = await DietPlan.findById(dietPlan._id).populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: pdfGenerated 
        ? 'Diet plan created successfully with PDF' 
        : 'Diet plan created successfully (PDF generation unavailable)',
      dietPlan: populatedDietPlan,
      pdfAvailable: pdfGenerated
    });

  } catch (error) {
    console.error('Create diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diet plan',
      error: error.message
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
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Calculate total calories and protein if meals are updated
    if (updateData.meals) {
      let totalCalories = 0;
      let totalProtein = 0;
      updateData.meals.forEach(meal => {
        if (meal.items) {
          meal.items.forEach(item => {
            totalCalories += item.calories || 0;
            totalProtein += item.protein || 0;
          });
        }
      });
      updateData.totalCalories = totalCalories;
      updateData.totalProtein = Math.round(totalProtein * 10) / 10;
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
        console.error('PDF regeneration error:', pdfError.message);
        // Continue without PDF - not critical
      }
    }

    res.status(200).json({
      success: true,
      message: pdfRegenerated 
        ? 'Diet plan updated successfully with new PDF' 
        : 'Diet plan updated successfully',
      dietPlan,
      pdfAvailable: pdfRegenerated
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
