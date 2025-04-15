const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { isManager, isAdmin } = require('../middleware/roleCheck');

// Get all leaves (admin only)
router.get('/all', [auth, isAdmin], async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('user', 'fullName email department')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get leaves for a manager's team
router.get('/team', [auth, isManager], async (req, res) => {
  try {
    // Get all employees who have this manager
    const employees = await User.find({ manager: req.user.id });
    const employeeIds = employees.map(emp => emp._id);
    
    // Get leaves for these employees
    const leaves = await Leave.find({ user: { $in: employeeIds } })
      .populate('user', 'fullName email department')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get pending leaves for a manager's team
router.get('/pending', [auth, isManager], async (req, res) => {
  try {
    // Get all employees who have this manager
    const employees = await User.find({ manager: req.user.id });
    const employeeIds = employees.map(emp => emp._id);
    
    // Get pending leaves for these employees
    const leaves = await Leave.find({ 
      user: { $in: employeeIds },
      status: 'Pending'
    })
      .populate('user', 'fullName email department')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get user's own leaves
router.get('/me', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id })
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });
    
    // Always return an array, even if empty
    res.json(leaves || []);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific leave by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'fullName email department')
      .populate('approvedBy', 'fullName');
    
    if (!leave) {
      return res.status(404).json({ msg: 'Leave request not found' });
    }

    // Check if user is authorized to view this leave
    const user = await User.findById(req.user.id);
    
    if (
      leave.user._id.toString() !== req.user.id && 
      !user.role === 'admin' && 
      !(user.role === 'manager' && await User.findOne({ _id: leave.user._id, manager: req.user.id }))
    ) {
      return res.status(403).json({ msg: 'Not authorized to view this leave request' });
    }
    
    res.json(leave);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Leave request not found' });
    }
    res.status(500).send('Server error');
  }
});

// Create a new leave request
router.post('/', [
  auth,
  [
    check('type', 'Leave type is required').not().isEmpty(),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty(),
    check('days', 'Number of days is required').isNumeric(),
    check('reason', 'Reason is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, startDate, endDate, days, reason } = req.body;

  try {
    // Create new leave request
    const leave = new Leave({
      user: req.user.id,
      type,
      startDate,
      endDate,
      days,
      reason
    });

    // Save to database
    await leave.save();

    // Get user's manager to notify them
    const user = await User.findById(req.user.id);
    if (user.manager) {
      // Create notification for manager
      const notification = new Notification({
        recipient: user.manager,
        type: 'leave_request',
        content: `New leave request from ${user.fullName}`,
        relatedTo: {
          model: 'Leave',
          id: leave._id
        },
        link: `/manager/approvals/${leave._id}`
      });
      
      await notification.save();
    }

    res.json(leave);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Approve or reject a leave request (manager or admin only)
router.put('/:id/status', [
  auth,
  [
    check('status', 'Status is required').isIn(['Approved', 'Rejected']),
    check('comments', 'Comments are required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status, comments } = req.body;

  try {
    // Find the leave request
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ msg: 'Leave request not found' });
    }

    // Check authorization
    const user = await User.findById(req.user.id);
    const leaveUser = await User.findById(leave.user);
    
    if (
      user.role !== 'admin' && 
      !(user.role === 'manager' && leaveUser.manager && leaveUser.manager.toString() === req.user.id)
    ) {
      return res.status(403).json({ msg: 'Not authorized to update this leave request' });
    }

    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedOn = Date.now();
    leave.comments = comments;
    
    if (status === 'Rejected') {
      leave.rejectionReason = comments;
    }

    // Save changes
    await leave.save();
    
    // Create notification for the employee
    const notification = new Notification({
      recipient: leave.user,
      type: status === 'Approved' ? 'leave_approved' : 'leave_rejected',
      content: `Your leave request has been ${status.toLowerCase()}`,
      relatedTo: {
        model: 'Leave',
        id: leave._id
      },
      link: `/employee/leaves/${leave._id}`
    });
    
    await notification.save();

    // If approved, update the user's status during the leave period
    if (status === 'Approved') {
      const today = new Date();
      const startDate = new Date(leave.startDate);
      
      if (startDate <= today) {
        await User.findByIdAndUpdate(leave.user, { status: 'on leave' });
      }
    }

    res.json(leave);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Leave request not found' });
    }
    res.status(500).send('Server error');
  }
});

// Cancel a leave request (only by the creator and if pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ msg: 'Leave request not found' });
    }

    // Check if user owns this leave request
    if (leave.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to cancel this leave request' });
    }

    // Check if the leave request is still pending
    if (leave.status !== 'Pending') {
      return res.status(400).json({ msg: 'Can only cancel pending leave requests' });
    }

    await leave.remove();

    res.json({ msg: 'Leave request cancelled' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Leave request not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
