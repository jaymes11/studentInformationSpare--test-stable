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
    console.error('Error fetching users:', error);
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
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Get user by ID (protected route)
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Create new user (protected route, admin only)
router.post('/', checkAuth, async (req, res) => {
  try {
    const { userId, firstName, lastName, middleName, email, password } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create new user
    const newUser = new User({
      userId,
      firstName,
      lastName,
      middleName,
      email,
      password
    });
    
    await newUser.save();
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user (protected route)
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { userId, firstName, lastName, middleName, email } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (userId !== undefined) user.userId = userId;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (middleName !== undefined) user.middleName = middleName;
    
    // If email is being changed, verify it's not already in use
    if (email !== undefined && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }
    
    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({ message: 'User updated successfully', user: userResponse });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Update user profile (protected route for current user)
router.put('/profile', checkAuth, async (req, res) => {
  try {
    const { userId, firstName, lastName, middleName } = req.body;
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.userId = userId || user.userId;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.middleName = middleName || user.middleName;

    await user.save();
    
    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({ message: 'Profile updated', user: userResponse });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Delete user (protected route)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    // Log the delete request for debugging
    console.log(`Delete request for user ID: ${req.params.id} by user: ${req.session.userId}`);
    
    // Prevent users from deleting their own account through this endpoint
    if (req.params.id === req.session.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account through this endpoint' });
    }
    
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log(`User deleted successfully: ${deletedUser._id}`);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

export default router;
