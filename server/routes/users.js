const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all users (for assignment dropdown)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, { name: 1, _id: 1, email: 1, role: 1 });
    console.log('Fetched users:', users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
