// Optional: seed an admin and a demo user for quick testing.
// Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const admin = await User.findOne({ email: 'admin@example.com' });
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' });
    console.log('Created admin@example.com / admin123');
  } else {
    console.log('Admin already exists');
  }

  const user = await User.findOne({ email: 'user@example.com' });
  if (!user) {
    await User.create({ name: 'Demo User', email: 'user@example.com', password: 'user1234', role: 'user' });
    console.log('Created user@example.com / user1234');
  } else {
    console.log('Demo user already exists');
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
