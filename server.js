const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const predefinedBlockRoutes = require('./routes/predefinedBlockRoutes');
const userBlockRoutes = require('./routes/userBlockRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

dotenv.config();
const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/blocks', predefinedBlockRoutes);
app.use('/api/userblocks', userBlockRoutes);
app.use('/api/upload', uploadRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
