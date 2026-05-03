const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : req.cookies?.token;
    if (!token) throw new ApiError(401, 'Not authenticated');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'User no longer exists');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission for this action'));
    }
    return next();
  };
}

module.exports = { protect, authorize };
