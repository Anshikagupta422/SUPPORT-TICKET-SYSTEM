const mongoose = require('mongoose');

let mongoServer; // for in-memory server when used in development

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      if (process.env.NODE_ENV !== 'production') {
        const { seedDemoData } = require('../utils/seed');
        await seedDemoData();
      }
      return;
    }

    throw new Error('MONGO_URI not provided');
  } catch (err) {
    // In production we should fail fast
    if (process.env.NODE_ENV === 'production') {
      console.error(`MongoDB connection error: ${err.message}`);
      process.exit(1);
    }

    // Development fallback: start an in-memory MongoDB instance
    try {
      console.warn('Falling back to in-memory MongoDB for development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`Connected to in-memory MongoDB`);
      const { seedDemoData } = require('../utils/seed');
      await seedDemoData();
    } catch (memErr) {
      console.error(`In-memory MongoDB failed: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
