// controllers/dietController.js
const DietPlan = require('../models/DietPlan');
const cloudinary = require('cloudinary').v2;
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { validationResult } = require('express-validator');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Handlebars to allow prototype access (fix for security warnings)
handlebars.registerHelper('allowProtoPropertiesByDefault', () => true);
handlebars.registerHelper('allowProtoMethodsByDefault', () => true);

// Set Handlebars runtime options to disable prototype access warnings
const handlebarsRuntime = {
  allowProtoPropertiesByDefault: true,
  allowProtoMethodsByDefault: true
};

// Generate signed URL for secure access - FIXED VERSION
const generateSignedURL = (publicId) => {
  try {
    console.log('Generating signed URL for public ID:', publicId);
    
    const timestamp = Math.round(new Date().getTime() / 1000) + 3600; // 1 hour from now
    
    // Use the correct method for raw file downloads
    const downloadUrl = cloudinary.utils.private_download_url(publicId, 'raw', {
      resource_type: 'raw',
      expires_at: timestamp,
      attachment: false,
      sign_url: true
    });
    
    console.log('Generated signed URL:', downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    
    // Fallback: create manual signed URL
    try {
      const params = {
        timestamp: Math.round(new Date().getTime() / 1000) + 3600,
        public_id: publicId,
        resource_type: 'raw'
      };
      
      const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
      
      const signedUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/v1/${publicId}?timestamp=${params.timestamp}&signature=${signature}&api_key=${process.env.CLOUDINARY_API_KEY}`;
      
      console.log('Fallback signed URL:', signedUrl);
      return signedUrl;
    } catch (fallbackError) {
      console.error('Fallback URL generation failed:', fallbackError);
      return null;
    }
  }
};

// Alternative: Generate transformation URL for PDFs
const generateTransformationURL = (publicId) => {
  try {
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      secure: true,
      sign_url: true,
      type: 'upload'
    });
  } catch (error) {
    console.error('Error generating transformation URL:', error);
    return null;
  }
};

// Test Cloudinary connection and settings
const testCloudinaryConnection = async () => {
  try {
    console.log('Testing Cloudinary connection and settings...');
    
    // Test basic connection
    const ping = await cloudinary.api.ping();
    console.log('Cloudinary ping successful:', ping);
    
    // Check account settings
    try {
      const usage = await cloudinary.api.usage();
      console.log('Account usage:', {
        resources: usage.resources,
        transformations: usage.transformations,
        bandwidth: usage.bandwidth
      });
    } catch (usageError) {
      console.log('Could not fetch usage (might require higher permissions)');
    }
    
    return true;
  } catch (error) {
    console.error('Cloudinary connection test failed:', error);
    return false;
  }
};

// HTML template for PDF generation - CLEAN VERSION
const dietPlanTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{title}} - Diet Plan</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            color: #333; 
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #4CAF50; 
            padding-bottom: 20px; 
        }
        .header h1 { 
            color: #4CAF50; 
            margin: 0; 
            font-size: 28px; 
        }
        .header p { 
            margin: 5px 0; 
            color: #666; 
        }
        .info-section { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px; 
            gap: 20px;
        }
        .info-box { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            flex: 1;
            min-width: 200px; 
        }
        .info-box h3 { 
            margin: 0 0 10px 0; 
            color: #4CAF50; 
        }
        .meals-section { 
            margin-bottom: 30px; 
        }
        .meal { 
            margin-bottom: 25px; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            overflow: hidden; 
            break-inside: avoid;
        }
        .meal-header { 
            background: #4CAF50; 
            color: white; 
            padding: 15px; 
        }
        .meal-header h3 { 
            margin: 0; 
            font-size: 18px; 
        }
        .meal-content { 
            padding: 15px; 
        }
        .food-items { 
            margin: 15px 0; 
        }
        .food-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 8px 0; 
            border-bottom: 1px solid #eee; 
        }
        .food-item:last-child { 
            border-bottom: none; 
        }
        .instructions { 
            background: #fff3cd; 
            border: 1px solid #ffeaa7; 
            border-radius: 4px; 
            padding: 10px; 
            margin-top: 10px; 
        }
        .notes { 
            background: #d1ecf1; 
            border: 1px solid #bee5eb; 
            border-radius: 4px; 
            padding: 15px; 
            margin-top: 20px; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666; 
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{title}}</h1>
        <p>Target Audience: {{targetAudience}}</p>
        <p>Duration: {{duration}}</p>
    </div>
    
    <div class="info-section">
        <div class="info-box">
            <h3>Total Calories</h3>
            <p>{{totalCalories}} kcal/day</p>
        </div>
        <div class="info-box">
            <h3>Plan Duration</h3>
            <p>{{duration}}</p>
        </div>
    </div>
    
    <div class="meals-section">
        <h2>Daily Meal Plan</h2>
        {{#each meals}}
        <div class="meal">
            <div class="meal-header">
                <h3>{{this.name}} - {{this.time}}</h3>
            </div>
            <div class="meal-content">
                <div class="food-items">
                    {{#each this.items}}
                    <div class="food-item">
                        <span><strong>{{this.food}}</strong></span>
                        <span>{{this.quantity}} ({{this.calories}} kcal)</span>
                    </div>
                    {{/each}}
                </div>
                {{#if this.instructions}}
                <div class="instructions">
                    <strong>Instructions:</strong> {{this.instructions}}
                </div>
                {{/if}}
            </div>
        </div>
        {{/each}}
    </div>
    
    {{#if notes}}
    <div class="notes">
        <h3>Additional Notes:</h3>
        <p>{{notes}}</p>
    </div>
    {{/if}}
    
    <div class="footer">
        <p>Generated by Gym Management System - {{generatedDate}}</p>
        <p>For any queries, contact your gym trainer.</p>
    </div>
</body>
</html>
`;

// Generate PDF with improved error handling
const generateDietPlanPDF = async (dietPlan) => {
  console.log('Starting PDF generation for diet plan:', dietPlan._id);
  
  const cloudinaryWorking = await testCloudinaryConnection();
  if (!cloudinaryWorking) {
    console.warn('Cloudinary connection issues, but proceeding...');
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions'
      ]
    });
    
    const page = await browser.newPage();
    console.log('Browser launched successfully');
    
    // Compile template with runtime options to fix Handlebars warnings
    const template = handlebars.compile(dietPlanTemplate, {
      noEscape: true,
      strict: false
    });
    
    // Convert Mongoose document to plain object to avoid prototype issues
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
    
    console.log('Template data prepared:', {
      title: templateData.title,
      mealsCount: templateData.meals.length,
      totalCalories: templateData.totalCalories
    });
    
    const html = template(templateData, handlebarsRuntime);
    console.log('HTML template compiled successfully without warnings');
    
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
    
    console.log('PDF generated successfully, buffer size:', pdfBuffer.length);
    
    // Upload to Cloudinary with corrected settings
    const publicId = `diet-plans/plan_${dietPlan._id}_${Date.now()}`;
    console.log('Uploading to Cloudinary with public_id:', publicId);
    
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw', // This is correct for PDFs
          public_id: publicId,
          format: 'pdf',
          type: 'upload',
          access_mode: 'public',
          use_filename: false,
          unique_filename: true,
          overwrite: false,
          tags: ['diet-plan', 'pdf'], // Add tags for organization
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload successful');
            console.log('Result:', {
              secure_url: result.secure_url,
              public_id: result.public_id,
              resource_type: result.resource_type,
              format: result.format
            });
            resolve(result);
          }
        }
      ).end(pdfBuffer);
    });
    
    return uploadResult;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Create diet plan with multiple URL generation strategies
const createDietPlan = async (req, res) => {
  try {
    console.log('Creating diet plan with data:', req.body);
    
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
    console.log('Diet plan saved to database:', dietPlan._id);

    // Generate PDF
    let pdfGenerationSuccess = false;
    let pdfUrls = {};
    
    try {
      console.log('Starting PDF generation...');
      const pdfResult = await generateDietPlanPDF(dietPlan);
      
      if (pdfResult && pdfResult.secure_url) {
        dietPlan.pdfUrl = pdfResult.secure_url;
        dietPlan.cloudinaryPublicId = pdfResult.public_id;
        await dietPlan.save();
        
        // Generate multiple URL access methods
        const signedUrl = generateSignedURL(pdfResult.public_id);
        const transformationUrl = generateTransformationURL(pdfResult.public_id);
        
        pdfUrls = {
          cloudinaryUrl: pdfResult.secure_url,
          signedUrl: signedUrl,
          transformationUrl: transformationUrl,
          directDownload: `/api/diet/${dietPlan._id}/download`,
          viewInBrowser: `/api/diet/${dietPlan._id}/view`
        };
        
        pdfGenerationSuccess = true;
        console.log('PDF URLs generated:', pdfUrls);
      }
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
    }

    const populatedDietPlan = await DietPlan.findById(dietPlan._id).populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: `Diet plan created successfully${pdfGenerationSuccess ? ' with PDF' : ' (PDF generation failed)'}`,
      dietPlan: populatedDietPlan,
      pdfGenerated: pdfGenerationSuccess,
      pdfUrls: pdfGenerationSuccess ? pdfUrls : null,
      cloudinarySettings: {
        pdfDeliveryEnabled: false, // Based on your settings screenshot
        suggestion: 'Enable "PDF and ZIP files delivery" in Cloudinary Security settings'
      }
    });

  } catch (error) {
    console.error('Create diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diet plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Direct download endpoint with better error handling
const downloadPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dietPlan = await DietPlan.findById(id);
    if (!dietPlan || !dietPlan.isActive || !dietPlan.cloudinaryPublicId) {
      return res.status(404).json({
        success: false,
        message: 'PDF not found'
      });
    }
    
    // Try multiple URL strategies
    const urls = [
      // Strategy 1: Direct Cloudinary URL
      dietPlan.pdfUrl,
      
      // Strategy 2: Signed URL
      generateSignedURL(dietPlan.cloudinaryPublicId),
      
      // Strategy 3: Transformation URL
      generateTransformationURL(dietPlan.cloudinaryPublicId)
    ].filter(Boolean); // Remove null/undefined URLs
    
    console.log('Available download URLs:', urls);
    
    if (urls.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid PDF URLs available'
      });
    }
    
    // Try each URL until one works
    for (const url of urls) {
      try {
        console.log('Trying URL:', url);
        res.redirect(url);
        return;
      } catch (error) {
        console.error('URL failed:', url, error.message);
        continue;
      }
    }
    
    // If all URLs fail, return error
    return res.status(500).json({
      success: false,
      message: 'All PDF access methods failed',
      availableUrls: urls
    });
    
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF'
    });
  }
};

// View PDF in browser (iframe-friendly)
const viewPDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dietPlan = await DietPlan.findById(id);
    if (!dietPlan || !dietPlan.isActive || !dietPlan.cloudinaryPublicId) {
      return res.status(404).send('PDF not found');
    }
    
    // Generate a viewer-friendly URL
    const viewUrl = generateTransformationURL(dietPlan.cloudinaryPublicId) || dietPlan.pdfUrl;
    
    const viewerHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Diet Plan - ${dietPlan.title}</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        iframe { width: 100%; height: 80vh; border: 1px solid #ddd; }
        .header { margin-bottom: 20px; }
        .error { color: red; padding: 20px; background: #fee; border: 1px solid red; }
        .links { margin: 10px 0; }
        .links a { margin-right: 10px; padding: 5px 10px; background: #4CAF50; color: white; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${dietPlan.title}</h1>
        <div class="links">
          <a href="${viewUrl}" target="_blank">Open in New Tab</a>
          <a href="/api/diet/${id}/download">Download</a>
        </div>
      </div>
      <iframe src="${viewUrl}" onerror="document.querySelector('.error').style.display='block'">
        <div class="error" style="display:none;">
          PDF cannot be displayed. <a href="${viewUrl}">Click here to download</a>
        </div>
      </iframe>
    </body>
    </html>
    `;
    
    res.send(viewerHtml);
    
  } catch (error) {
    console.error('View PDF error:', error);
    res.status(500).send('Error loading PDF viewer');
  }
};

// Keep existing functions (getDietPlans, getDietPlan, updateDietPlan, deleteDietPlan, etc.)
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

    const dietPlansWithUrls = dietPlans.map(plan => {
      const planObj = plan.toObject();
      if (planObj.cloudinaryPublicId) {
        planObj.pdfUrls = {
          directDownload: `/api/diet/${planObj._id}/download`,
          viewInBrowser: `/api/diet/${planObj._id}/view`,
          getPdfUrl: `/api/diet/${planObj._id}/pdf-url`
        };
      }
      return planObj;
    });

    res.status(200).json({
      success: true,
      dietPlans: dietPlansWithUrls,
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

    const dietPlanObj = dietPlan.toObject();
    
    if (dietPlanObj.cloudinaryPublicId) {
      dietPlanObj.pdfUrls = {
        directDownload: `/api/diet/${dietPlanObj._id}/download`,
        viewInBrowser: `/api/diet/${dietPlanObj._id}/view`,
        getPdfUrl: `/api/diet/${dietPlanObj._id}/pdf-url`
      };
    }

    res.status(200).json({
      success: true,
      dietPlan: dietPlanObj
    });
  } catch (error) {
    console.error('Get diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diet plan'
    });
  }
};

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

    let pdfRegenerationSuccess = false;
    if (updateData.meals || updateData.title || updateData.notes) {
      try {
        if (dietPlan.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(dietPlan.cloudinaryPublicId, { resource_type: 'raw' });
        }

        const pdfResult = await generateDietPlanPDF(dietPlan);
        if (pdfResult && pdfResult.secure_url) {
          dietPlan.pdfUrl = pdfResult.secure_url;
          dietPlan.cloudinaryPublicId = pdfResult.public_id;
          await dietPlan.save();
          pdfRegenerationSuccess = true;
        }
      } catch (pdfError) {
        console.error('PDF regeneration error:', pdfError);
      }
    }

    res.status(200).json({
      success: true,
      message: `Diet plan updated successfully${pdfRegenerationSuccess ? ' with new PDF' : ''}`,
      dietPlan,
      pdfRegenerated: pdfRegenerationSuccess
    });
  } catch (error) {
    console.error('Update diet plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diet plan'
    });
  }
};

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

    if (dietPlan.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(dietPlan.cloudinaryPublicId, { resource_type: 'raw' });
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

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

const getPDFUrl = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dietPlan = await DietPlan.findById(id);
    if (!dietPlan || !dietPlan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Diet plan not found'
      });
    }
    
    if (!dietPlan.cloudinaryPublicId) {
      return res.status(404).json({
        success: false,
        message: 'PDF not available'
      });
    }
    
    const signedUrl = generateSignedURL(dietPlan.cloudinaryPublicId);
    const transformationUrl = generateTransformationURL(dietPlan.cloudinaryPublicId);
    
    res.status(200).json({
      success: true,
      pdfUrls: {
        cloudinaryUrl: dietPlan.pdfUrl,
        signedUrl: signedUrl,
        transformationUrl: transformationUrl,
        directDownload: `/api/diet/${id}/download`,
        viewInBrowser: `/api/diet/${id}/view`
      }
    });
    
  } catch (error) {
    console.error('Get PDF URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF URL'
    });
  }
};

const testPDFGeneration = async (req, res) => {
  try {
    const testDietPlan = {
      _id: 'test_id',
      title: 'Test Diet Plan',
      targetAudience: 'weight_loss',
      duration: '1 week',
      totalCalories: 1500,
      meals: [
        {
          name: 'Breakfast',
          time: '8:00 AM',
          items: [
            { food: 'Oatmeal', quantity: '1 cup', calories: 300 },
            { food: 'Banana', quantity: '1 medium', calories: 100 }
          ],
          instructions: 'Eat slowly and drink water'
        }
      ],
      notes: 'This is a test diet plan'
    };

    const pdfResult = await generateDietPlanPDF(testDietPlan);
    
    const signedUrl = generateSignedURL(pdfResult.public_id);
    const transformationUrl = generateTransformationURL(pdfResult.public_id);
    
    res.status(200).json({
      success: true,
      message: 'Test PDF generated successfully',
      pdfUrls: {
        cloudinaryUrl: pdfResult.secure_url,
        signedUrl: signedUrl,
        transformationUrl: transformationUrl
      },
      note: 'Enable PDF delivery in Cloudinary settings for direct access'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test PDF generation failed',
      error: error.message
    });
  }
};

module.exports = {
  createDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan,
  testPDFGeneration,
  getPDFUrl,
  downloadPDF,
  viewPDF
};