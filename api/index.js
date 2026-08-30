require('dotenv').config();

let app;
if (process.env.MONGO_URI) {
  app = require('../backend/server');
} else {
  app = require('../backend/demoServer');
}

module.exports = app;
