require('dotenv').config();
const mongoose = require('mongoose');
const PredefinedBlock = require('../models/PredefinedBlock');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

// Predefined blocks data
const predefinedBlocks = [
  { name: 'Block A', description: 'Description for Block A' },
  { name: 'Block B', description: 'Description for Block B' },
  { name: 'Block C', description: 'Description for Block C' },
];

// Populate database
const populatePredefinedBlocks = async () => {
  try {
    await connectDB();

    // Clear existing data
    await PredefinedBlock.deleteMany();
    console.log('Cleared existing predefined blocks.');

    // Insert new blocks
    const insertedBlocks = await PredefinedBlock.insertMany(predefinedBlocks);
    console.log('Predefined blocks added:', insertedBlocks);

    mongoose.connection.close();
  } catch (err) {
    console.error('Error populating predefined blocks:', err.message);
    process.exit(1);
  }
};

populatePredefinedBlocks();
