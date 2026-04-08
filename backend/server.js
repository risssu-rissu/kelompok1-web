const path = require('path');
// Load .env file jika ada (untuk development lokal).
// Di Docker, env vars sudah di-set langsung oleh docker-compose.yml.
// override: false memastikan env vars dari Docker tidak ditimpa oleh .env file.
require('dotenv').config({ path: path.join(__dirname, '.env'), override: false });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Log environment status saat startup
console.log('=== Environment Check ===');
console.log('PORT:', process.env.PORT || '(default)');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ MISSING');
console.log('=========================');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: err.message 
  });
});

const PORT = process.env.PORT || 5001;

// Start server: Tunggu MongoDB konek dulu, baru terima request
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('🔥 Gagal memulai server:', error.message);
    process.exit(1);
  }
};

startServer();
