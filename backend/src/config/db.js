const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set');

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });

  // eslint-disable-next-line no-console
  console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('Mongo error:', err.message);
  });
}

module.exports = connectDB;
