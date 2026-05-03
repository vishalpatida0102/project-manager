const Activity = require('../models/Activity');

async function logActivity(payload) {
  try {
    await Activity.create(payload);
  } catch (err) {
    // Activity logging is non-critical — never fail a request because of it.
    // eslint-disable-next-line no-console
    console.warn('Activity log failed:', err.message);
  }
}

module.exports = { logActivity };
