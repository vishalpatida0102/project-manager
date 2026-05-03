const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

// GET /api/users — directory of teammates (any authenticated user can list).
const list = asyncHandler(async (req, res) => {
  const { search = '', role } = req.query;
  const filter = {};
  if (role && ['admin', 'member'].includes(role)) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .select('name email role avatarColor title createdAt')
    .sort({ name: 1 });

  res.json({ success: true, users });
});

// PATCH /api/users/:id/role — admin only
const setRole = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid user id');
  const { role } = req.body;
  if (!['admin', 'member'].includes(role)) throw new ApiError(400, 'Invalid role');
  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot change your own role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, user });
});

// DELETE /api/users/:id — admin only
const remove = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Invalid user id');
  if (String(req.params.id) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot delete yourself');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true });
});

module.exports = { list, setRole, remove };
