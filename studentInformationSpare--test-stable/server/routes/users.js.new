import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Basic auth check function
const checkAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Please log in' });
  }
  next();
};

// Get all users (protected route)
router.get('/', checkAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get current user's profile
router.get('/me', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile (protected route)
router.put('/profile', checkAuth, async (req, res) => {
  try {
    const { firstName, lastName, middleName } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.middleName = middleName || user.middleName;

    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router;
