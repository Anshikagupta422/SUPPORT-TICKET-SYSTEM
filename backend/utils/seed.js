// Optional: seed an admin and a demo user for quick testing.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Activity = require('../models/Activity');
const Comment = require('../models/Comment');

const seedDemoData = async () => {
  try {
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
      console.log('Created demo admin: admin@example.com / admin123');
    }

    let user = await User.findOne({ email: 'user@example.com' });
    if (!user) {
      user = await User.create({ name: 'Demo User', email: 'user@example.com', password: 'user1234', role: 'user' });
      console.log('Created demo user: user@example.com / user1234');
    }

    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      const ticket1 = await Ticket.create({
        title: 'Unable to update payment method',
        description: 'When trying to add a new credit card in the settings tab, the submit button is grayed out and shows a spinner indefinitely.',
        category: 'Billing',
        priority: 'High',
        status: 'In Progress',
        createdBy: user._id,
        assignedTo: admin._id,
      });

      await Activity.create({
        ticket: ticket1._id,
        actor: user._id,
        action: 'TICKET_CREATED',
        detail: 'Ticket created with priority "High" in category "Billing"',
      });

      await Comment.create({
        ticket: ticket1._id,
        author: user._id,
        message: 'I have tried using both Chrome and Edge, but the issue persists.',
      });

      await Comment.create({
        ticket: ticket1._id,
        author: admin._id,
        message: 'Hello! Thanks for reporting. We are looking into the payment gateway logs now.',
      });

      await Activity.create({
        ticket: ticket1._id,
        actor: admin._id,
        action: 'STATUS_CHANGED',
        detail: 'Open -> In Progress',
      });

      const ticket2 = await Ticket.create({
        title: 'Dashboard metrics not refreshing in real time',
        description: 'The real-time chart on the dashboard seems stuck on data from 30 minutes ago.',
        category: 'Technical',
        priority: 'Urgent',
        status: 'Open',
        createdBy: user._id,
      });

      await Activity.create({
        ticket: ticket2._id,
        actor: user._id,
        action: 'TICKET_CREATED',
        detail: 'Ticket created with priority "Urgent" in category "Technical"',
      });

      const ticket3 = await Ticket.create({
        title: 'Dark mode theme preference',
        description: 'Would love to have an option for dark mode to reduce eye strain during night shifts.',
        category: 'Feature Request',
        priority: 'Low',
        status: 'Resolved',
        createdBy: user._id,
        assignedTo: admin._id,
      });

      await Activity.create({
        ticket: ticket3._id,
        actor: user._id,
        action: 'TICKET_CREATED',
        detail: 'Ticket created with priority "Low" in category "Feature Request"',
      });

      await Comment.create({
        ticket: ticket3._id,
        author: admin._id,
        message: 'This feature has been implemented in the latest release. Enjoy!',
      });

      await Activity.create({
        ticket: ticket3._id,
        actor: admin._id,
        action: 'STATUS_CHANGED',
        detail: 'In Progress -> Resolved',
      });

      console.log('Seeded sample tickets and activity history');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

const run = async () => {
  const connectDB = require('../config/db');
  await connectDB();
  await seedDemoData();
  await mongoose.disconnect();
  process.exit(0);
};

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedDemoData };
