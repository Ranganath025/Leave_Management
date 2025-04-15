
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const { isManager, isAdmin } = require('../middleware/roleCheck');

// Get all users (admin only)
router.get('/', [auth, isAdmin], async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('manager', 'fullName email');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get team members (manager only)
router.get('/team', [auth, isManager], async (req, res) => {
  try {
    const users = await User.find({ manager: req.user.id })
      .select('-password')
      .sort({ fullName: 1 });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'fullName email');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Only admin, the user themselves, or their manager can view
    if (
      req.user.id !== user._id.toString() && 
      req.user.role !== 'admin' && 
      !(req.user.role === 'manager' && user.manager && user.manager.toString() === req.user.id)
    ) {
      return res.status(403).json({ msg: 'Not authorized to view this user' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  const {
    fullName,
    phone,
    address,
    bio,
    emergencyContact
  } = req.body;

  // Build user profile object
  const profileFields = {};
  if (fullName) profileFields.fullName = fullName;
  if (phone) profileFields.phone = phone;
  if (address) profileFields.address = address;
  if (bio) profileFields.bio = bio;
  if (emergencyContact) profileFields.emergencyContact = emergencyContact;
  
  try {
    let user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: profileFields }, 
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update user (admin only)
router.put('/:id', [auth, isAdmin], async (req, res) => {
  const {
    fullName,
    email,
    role,
    department,
    position,
    manager,
    status
  } = req.body;

  // Build update object
  const updateFields = {};
  if (fullName) updateFields.fullName = fullName;
  if (email) updateFields.email = email;
  if (role) updateFields.role = role;
  if (department) updateFields.department = department;
  if (position) updateFields.position = position;
  if (manager) updateFields.manager = manager;
  if (status) updateFields.status = status;
  
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Prevent assigning a user as their own manager
    if (manager && manager === req.params.id) {
      return res.status(400).json({ msg: 'User cannot be their own manager' });
    }
    
    user = await User.findByIdAndUpdate(
      req.params.id, 
      { $set: updateFields }, 
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// Change password
router.put('/change-password', [
  auth,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete user (admin only)
router.delete('/:id', [auth, isAdmin], async (req, res) => {
  try {
    // Remove user's leaves
    await Leave.deleteMany({ user: req.params.id });
    
    // Remove user
    await User.findByIdAndRemove(req.params.id);
    
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
