const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nisn: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nama: {
    type: String,
    required: true,
    trim: true
  },
  noAbsen: {
    type: Number,
    required: true
  },
  jenisKelamin: {
    type: String,
    enum: ['Laki-laki', 'Perempuan'],
    required: true
  },
  kelas: {
    type: String,
    required: true,
    trim: true
  },
  statusKeaktifan: {
    type: String,
    enum: ['Aktif', 'Lulus', 'Pindah', 'Keluar'],
    default: 'Aktif'
  },
  alamat: {
    type: String,
    required: true
  },
  tanggalLahir: {
    type: Date,
    required: true
  },
  noTelepon: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  namaOrangTua: {
    type: String,
    default: '-'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt sebelum save
studentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
