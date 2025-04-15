
# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for your Leave Management System.

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and click "Try Free".
2. Sign up with your email or use Google/GitHub authentication.
3. Complete the registration process.

## Step 2: Create a New Cluster

1. After logging in, click "Build a Database".
2. Choose the free tier (M0).
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure) and region closest to your users.
4. Name your cluster (e.g., "leave-management").
5. Click "Create Cluster". This may take a few minutes to provision.

## Step 3: Configure Database Access

1. In the left sidebar, click "Database Access" under Security.
2. Click "Add New Database User".
3. Create a username and a secure password (or use the "Autogenerate Secure Password" option).
4. Set User Privileges to "Read and write to any database".
5. Click "Add User".

## Step 4: Configure Network Access

1. In the left sidebar, click "Network Access" under Security.
2. Click "Add IP Address".
3. For development, you can choose "Allow Access from Anywhere" (0.0.0.0/0).
   (Note: For production, you should restrict this to specific IP addresses)
4. Click "Confirm".

## Step 5: Get Your Connection String

1. Go back to the Clusters view by clicking "Database" in the left sidebar.
2. Click "Connect" on your cluster.
3. Choose "Connect your application".
4. Select "Node.js" as the driver and your version.
5. Copy the connection string provided.
6. Replace `<password>` with your database user's password.

## Step 6: Set Up MongoDB Connection in Your Application

Create a `.env` file in your backend project root with:

```
MONGODB_URI=your_connection_string_here
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

## Step 7: Create Backend Directory Structure

```bash
mkdir -p backend/{controllers,models,routes,middleware,config,utils}
cd backend
npm init -y
npm install express mongoose dotenv bcryptjs jsonwebtoken cors express-validator
npm install --save-dev nodemon
```

## Step 8: Configure Package.json Scripts

Update your `package.json` to include:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

## Step 9: Create Server.js File

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leaves');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/users', userRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Step 10: Create Models

### User Model (models/User.js)

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  phone: String,
  joiningDate: Date,
  address: String,
  emergencyContact: String,
  bio: String,
  status: {
    type: String,
    enum: ['active', 'inactive', 'on leave'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### Leave Model (models/Leave.js)

```javascript
const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Bereavement', 'Other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedOn: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  comments: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
```

### Notification Model (models/Notification.js)

```javascript
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['leave_request', 'leave_approved', 'leave_rejected', 'profile_update', 'calendar_event'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Leave', 'User', 'Event'],
      default: null
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
```

## Step 11: Create Routes

### Auth Routes (routes/auth.js)

```javascript
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', [
  check('fullName', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('department', 'Department is required').not().isEmpty(),
  check('position', 'Position is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullName, email, password, role, department, position } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      role: role || 'employee',
      department,
      position
    });

    // Save user to database
    await user.save();

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // Sign and return JWT
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Get logged in user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
```

### Leave Routes (routes/leaves.js)

```javascript
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
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
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
```

### User Routes (routes/users.js)

```javascript
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
```

## Step 12: Create Middleware

### Authentication Middleware (middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
```

### Role Checking Middleware (middleware/roleCheck.js)

```javascript
// Check if user is a manager
exports.isManager = function(req, res, next) {
  if (req.user.role === 'manager' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Manager role required' });
  }
};

// Check if user is an admin
exports.isAdmin = function(req, res, next) {
  if (req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin role required' });
  }
};
```

## Step 13: Create the API Integration in the Frontend

In your frontend React application, create a services folder with API utility functions to connect to your backend.

This completes the initial MongoDB Atlas setup and backend implementation for your Leave Management System. You now have a fully functional backend with authentication, leave management, and user management capabilities.

To connect your React frontend to this backend, update your API service files to make requests to these endpoints.
