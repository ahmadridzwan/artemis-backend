const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Configure Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'block-icons', // Cloudinary folder
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`, // Unique filename
    transformation: [{ width: 300, height: 300, crop: 'limit' }], // Resize images
  },
});

const upload = multer({ storage });

module.exports = {
  upload: upload.single('icon'), // Export `single` function
  parseFormData: (req, res, next) => {
    upload.single('icon')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: 'File upload error' });
      }

      req.body = { ...req.body };
      console.log('Parsed Form Data:', req.body);

      next();
    });
  }
};
