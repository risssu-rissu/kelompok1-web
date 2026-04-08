const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('======================================================');
    console.error('🔥 ERROR FATAL: MONGODB_URI BELUM DISETTING! 🔥');
    console.error('Harap masukkan URL MongoDB Atlas Anda di menu Environment Variables server (Render/Railway).');
    console.error('Server aplikasi dimatikan otomatis.');
    console.error('======================================================');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
