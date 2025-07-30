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

// Enhanced admin authentication with additional security checks
const requireAdminStrict = (req, res, next) => {
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

  // Check session age (expire after 24 hours)
  const sessionAge = Date.now() - (req.session.admin.loginTime || 0);
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  if (sessionAge > maxAge) {
    req.session.destroy();
    return res.status(401).json({
      success: false,
      error: 'Session expired. Please log in again.',
      code: 'SESSION_EXPIRED'
    });
  }

  // Check for suspicious activity (optional - can be expanded)
  const userAgent = req.get('User-Agent');
  if (req.session.admin.userAgent && req.session.admin.userAgent !== userAgent) {
    return res.status(401).json({
      success: false,
      error: 'Session security violation detected. Please log in again.',
      code: 'SECURITY_VIOLATION'
    });
  }

  // Add admin info to request for use in route handlers
  req.admin = req.session.admin;
  next();
};

// Safe method for admin-only GET routes with additional validation
const requireAdminSafe = (req, res, next) => {
  // First run the strict admin check
  requireAdminStrict(req, res, (err) => {
    if (err) return next(err);

    // Additional checks for GET requests (less strict for admin management)
    if (req.method === 'GET') {
      // Only check referer for non-admin management routes
      const isAdminManagement = req.path.includes('/api/admins');

      if (!isAdminManagement) {
        const referer = req.get('Referer');
        const host = req.get('Host');

        if (referer && !referer.includes(host)) {
          return res.status(403).json({
            success: false,
            error: 'Access denied. Invalid request origin.',
            code: 'INVALID_ORIGIN'
          });
        }
      }
    }

    next();
  });
};

module.exports = {
  requireAdmin,
  optionalAdmin,
  requireAdminStrict,
  requireAdminSafe
};
