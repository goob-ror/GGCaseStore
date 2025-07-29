// Authentication middleware for admin routes

const requireAdmin = (req, res, next) => {
  // Check if admin session exists
  if (!req.session || !req.session.admin) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required. Please log in first.',
      code: 'ADMIN_AUTH_REQUIRED'
    });
  }

  // Check if session has required admin properties
  if (!req.session.admin.id || !req.session.admin.username) {
    return res.status(401).json({
      success: false,
      error: 'Invalid admin session. Please log in again.',
      code: 'INVALID_ADMIN_SESSION'
    });
  }

  // Add admin info to request for use in route handlers
  req.admin = req.session.admin;
  next();
};

// Optional middleware to check admin but not require it
const optionalAdmin = (req, res, next) => {
  if (req.session && req.session.admin && req.session.admin.id) {
    req.admin = req.session.admin;
  }
  next();
};

module.exports = {
  requireAdmin,
  optionalAdmin
};
