const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = (requireAdmin = false) => {
  return async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded?.userId);

      if (!user) {
        return res.status(401).json({ error: 'User not found.' });
      }

      req.user = {
        id: user._id,
        isAdmin: user.isAdmin,
      };

      // If admin access is required, check for admin privileges
      if (requireAdmin && !user.isAdmin) {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
      }

      next(); // Proceed to the next middleware or controller
    } catch (err) {
      res.status(401).json({ error: 'Invalid token.' });
    }
  };
};

module.exports = authenticate;
