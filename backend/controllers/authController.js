const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Cek JWT_SECRET saat file di-load
if (!process.env.JWT_SECRET) {
  console.error('⚠️  WARNING: JWT_SECRET belum di-set! Token tidak akan bisa dibuat.');
}

// Generate JWT Token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d'
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Cek apakah user sudah ada
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Buat user baru
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user'
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Get Current User
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
