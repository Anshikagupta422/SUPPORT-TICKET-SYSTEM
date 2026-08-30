const mongoose = require('mongoose');

// Activity/history timeline entries for a ticket (bonus feature)
const activitySchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'TICKET_CREATED',
        'STATUS_CHANGED',
        'PRIORITY_CHANGED',
        'CATEGORY_CHANGED',
        'COMMENT_ADDED',
        'TICKET_ASSIGNED',
      ],
      required: true,
    },
    detail: { type: String, default: '' }, // human-readable summary, e.g. "Open -> In Progress"
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
