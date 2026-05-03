const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { logActivity } = require('../utils/activity');

const PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#10b981'];

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function sanitize(user) {
  const u = user.toJSON ? user.toJSON() : user;
  return {
    id: u._id || u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarColor: u.avatarColor,
    title: u.title,
    initials: u.initials,
    createdAt: u.createdAt,
  };
}

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email already in use');

  // First user becomes admin automatically; afterwards explicit role can be requested.
  const userCount = await User.estimatedDocumentCount();
  const finalRole = userCount === 0 ? 'admin' : role === 'admin' ? 'admin' : 'member';

  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
    avatarColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
  });

  const token = signToken(user);

  await logActivity({ actor: user._id, action: 'user.registered', meta: { name: user.name } });

  res.status(201).json({ success: true, token, user: sanitize(user) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const matches = await user.comparePassword(password);
  if (!matches) throw new ApiError(401, 'Invalid email or password');

  const token = signToken(user);
  res.json({ success: true, token, user: sanitize(user) });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
});

// PATCH /api/auth/me
const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['name', 'title', 'avatarColor'];
  const patch = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  });

  Object.assign(req.user, patch);
  await req.user.save();
  res.json({ success: true, user: sanitize(req.user) });
});

// POST /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  const ok = await user.comparePassword(currentPassword);
  if (!ok) throw new ApiError(400, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

module.exports = { register, login, me, updateMe, changePassword };
