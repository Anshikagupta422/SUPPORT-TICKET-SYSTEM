const mongoose = require('mongoose');

const TICKET_CATEGORIES = ['Technical', 'Billing', 'Account', 'General', 'Feature Request'];
const TICKET_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 5000 },
    category: { type: String, enum: TICKET_CATEGORIES, required: [true, 'Category is required'] },
    priority: { type: String, enum: TICKET_PRIORITIES, default: 'Medium' },
    status: { type: String, enum: TICKET_STATUSES, default: 'Open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

ticketSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Ticket', ticketSchema);
module.exports.TICKET_CATEGORIES = TICKET_CATEGORIES;
module.exports.TICKET_PRIORITIES = TICKET_PRIORITIES;
module.exports.TICKET_STATUSES = TICKET_STATUSES;
