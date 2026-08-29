const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  const uri = mongoUri || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri);
};

module.exports = connectDB;
