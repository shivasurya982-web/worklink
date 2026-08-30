const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
const uploadImage = async (filePath, folder = 'worklink-ai') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    // Fallback: return a placeholder URL if Cloudinary is not configured
    return {
      url: `https://placehold.co/400x400?text=Upload+Failed`,
      publicId: null,
    };
  }
};

// Upload multiple images
const uploadMultipleImages = async (filePaths, folder = 'worklink-ai') => {
  const uploadPromises = filePaths.map((filePath) => uploadImage(filePath, folder));
  return Promise.all(uploadPromises);
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
  }
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
};
