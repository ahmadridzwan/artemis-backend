const upload = require('../utils/multer'); // Multer setup for Cloudinary

const uploadImage = async (req, res, next) => {
  try {
    // Ensure a file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Ensure the field name is "icon".' });
    }

    // Store the Cloudinary URL in `req.imageUrl`
    req.imageUrl = req.file.path; // Cloudinary public URL

    next(); // Proceed to the next function (predefinedBlockController)
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

module.exports = { uploadImage };
