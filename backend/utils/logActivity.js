const Activity = require('../models/Activity');

// Small helper so controllers can log a timeline entry in one line
const logActivity = async ({ ticket, actor, action, detail = '' }) => {
  try {
    await Activity.create({ ticket, actor, action, detail });
  } catch (err) {
    // Activity logging should never break the main request
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;
