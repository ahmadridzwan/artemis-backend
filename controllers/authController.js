const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { username, password, isAdmin } = req.body;
  try {
    const user = new User({ username, password, isAdmin });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const userRole = user.isAdmin ? 'admin' : 'user';
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        role: userRole
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    const responseData = { 
      user: { 
        username: user.username,
        role: userRole
      }, 
      token
    };
    res.status(200).json(responseData);
  } catch (err) {
    console.error('err', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
