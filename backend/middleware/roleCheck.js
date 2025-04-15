
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
