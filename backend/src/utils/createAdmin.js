/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#10b981'];

(async () => {
  const email = (process.env.NEW_ADMIN_EMAIL || '').toLowerCase().trim();
  const password = process.env.NEW_ADMIN_PASSWORD;
  const name = process.env.NEW_ADMIN_NAME || 'Admin';
  if (!email || !password) {
    console.error('NEW_ADMIN_EMAIL and NEW_ADMIN_PASSWORD env vars are required.');
    process.exit(1);
  }

  try {
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      existing.name = name;
      existing.role = 'admin';
      existing.password = password; // pre-save hook will hash
      await existing.save();
      console.log(`✅ Updated existing user → admin role: ${email}`);
    } else {
      const user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        avatarColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        title: 'Owner',
      });
      console.log(`✅ Created admin: ${user.email} (id ${user._id})`);
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
