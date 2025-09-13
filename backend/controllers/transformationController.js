// controllers/transformationController.js
const Transformation = require('../models/Transformation');
const cloudinary = require('cloudinary').v2;

// Cloudinary config is already done in dietController, but configure here as well for safety
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper to upload an image (base64 data URL or remote URL) to Cloudinary
async function uploadImageToCloudinary(src, folder = 'transformations') {
  if (!src) return null;
  const options = {
    folder,
    resource_type: 'image',
    access_mode: 'public',
    overwrite: true,
  };
  const result = await cloudinary.uploader.upload(src, options);
  return result.secure_url;
}

// GET /api/transformations/home
exports.getHomeTransformations = async (req, res) => {
  try {
    const doc = await Transformation.findOne({ key: 'home' });
    return res.json({
      success: true,
      transformations: doc?.transformations || [],
    });
  } catch (err) {
    console.error('getHomeTransformations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch transformations' });
  }
};

// POST /api/transformations/home
// Body: { transformations: [{ name, duration, weightLost, beforeImage, afterImage }] } (max 3)
exports.upsertHomeTransformations = async (req, res) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ success: false, message: 'Cloudinary not configured' });
    }

    let { transformations } = req.body;
    if (!Array.isArray(transformations)) transformations = [];
    if (transformations.length > 3) transformations = transformations.slice(0, 3);

    // Upload images and build payload
    const uploaded = [];
    for (let i = 0; i < transformations.length; i++) {
      const t = transformations[i] || {};
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadImageToCloudinary(t.beforeImage, 'transformations'),
        uploadImageToCloudinary(t.afterImage, 'transformations'),
      ]);
      uploaded.push({
        name: t.name || '',
        duration: t.duration || '',
        weightLost: t.weightLost || '',
        beforeImage: beforeUrl,
        afterImage: afterUrl,
      });
    }

    const updated = await Transformation.findOneAndUpdate(
      { key: 'home' },
      { $set: { transformations: uploaded } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, transformations: updated.transformations });
  } catch (err) {
    console.error('upsertHomeTransformations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save transformations' });
  }
};
