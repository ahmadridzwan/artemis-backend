const PredefinedBlock = require('../models/PredefinedBlock');
const { uploadImage } = require('./uploadController'); // Import upload function

const getAllPredefinedBlocks = async (req, res) => {
  try {
    // Fetch all predefined blocks from MongoDB
    const blocks = await PredefinedBlock.find();

    res.status(200).json({ blocks });
  } catch (err) {
    console.error('Error fetching predefined blocks:', err);
    res.status(500).json({ error: 'Failed to fetch predefined blocks' });
  }
};

const createPredefinedBlock = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { name, description, type } = req.body;

    // Validate required fields before uploading
    if (!name || !description || !type) {
      return res.status(400).json({ error: 'Name, description, and type are required' });
    }

    // Ensure type is either "single" or "grouped"
    if (!['single', 'grouped'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be single or grouped.' });
    }

    // ✅ Call the uploadImage function manually **after** validation
    uploadImage(req, res, async () => {
      try {
        // Ensure image was uploaded successfully
        if (!req.imageUrl) {
          return res.status(500).json({ error: 'Image upload failed. Predefined block not created.' });
        }

        // ✅ Create a new predefined block in MongoDB
        const newBlock = new PredefinedBlock({
          name,
          description,
          type,
          icon: req.imageUrl, // Use the uploaded image URL
        });

        // Save to MongoDB
        await newBlock.save();

        res.status(201).json({
          message: 'Predefined block created successfully',
          block: newBlock,
        });
      } catch (dbError) {
        console.error('Database Error:', dbError);
        res.status(500).json({ error: 'Failed to save predefined block to database' });
      }
    });
  } catch (err) {
    console.error('Error creating predefined block:', err);
    res.status(500).json({ error: 'Failed to create predefined block' });
  }
};

module.exports = { getAllPredefinedBlocks, createPredefinedBlock };
