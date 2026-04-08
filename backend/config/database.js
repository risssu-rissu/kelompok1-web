const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('======================================================');
    console.error('🔥 ERROR FATAL: MONGODB_URI BELUM DISETTING! 🔥');
    console.error('Server aplikasi dimatikan otomatis.');
    console.error('======================================================');
    process.exit(1);
  }

  const MAX_RETRIES = 10;
  const RETRY_DELAY_MS = 5000; // 5 detik

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🔄 Mencoba koneksi MongoDB... (percobaan ${attempt}/${MAX_RETRIES})`);
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB Connected Successfully');
      return; // sukses, keluar dari fungsi
    } catch (error) {
      console.error(`❌ Percobaan ${attempt} gagal: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log(`   Menunggu ${RETRY_DELAY_MS / 1000} detik sebelum mencoba lagi...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      } else {
        console.error('🔥 Semua percobaan koneksi MongoDB gagal. Server dimatikan.');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
