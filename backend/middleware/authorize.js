/**
 * Role-based authorization middleware
 * Takes spread of allowed roles and checks if req.user.role is included
 * Must be used after the protect middleware
 *
 * @param  {...string} roles - Allowed roles (e.g. 'student', 'client', 'admin')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'User role is not authorized to access this route',
      });
    }

    next();
  };
};

module.exports = { authorize };
