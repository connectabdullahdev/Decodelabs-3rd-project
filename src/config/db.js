// ============================================================
// db.js — MongoDB Connection via Mongoose ORM
// PDF: "Bridging the Gap Between Code and Storage"
//      ORM = translates JS objects ↔ MongoDB documents
// ============================================================

const mongoose = require('mongoose');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database        : ${conn.connection.name}`);

  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    console.error('');
    console.error('   Fix: Update MONGO_URI in your .env file');
    console.error('   See: README.md → Step 2: Setup MongoDB Atlas');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected',  () => console.log('🔄  MongoDB reconnected'));

module.exports = connectDB;
