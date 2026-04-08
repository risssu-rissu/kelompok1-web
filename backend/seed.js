require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    console.log('Existing data cleared');

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create regular user
    const user = await User.create({
      username: 'user',
      email: 'user@example.com',
      password: 'user123',
      role: 'user'
    });
    console.log('Regular user created');

    // Create sample students
    const students = [
      {
        nisn: '1001234567',
        nama: 'Ahmad Fauzi',
        noAbsen: 1,
        jenisKelamin: 'Laki-laki',
        kelas: 'X IPA 1',
        alamat: 'Jl. Merdeka No. 123, Jakarta',
        tanggalLahir: new Date('2008-05-15'),
        noTelepon: '08123456789',
        email: 'ahmad.fauzi@student.com',
        namaOrangTua: 'Budi Santoso'
      },
      {
        nisn: '1001234568',
        nama: 'Siti Nurhaliza',
        noAbsen: 2,
        jenisKelamin: 'Perempuan',
        kelas: 'X IPA 1',
        alamat: 'Jl. Sudirman No. 45, Jakarta',
        tanggalLahir: new Date('2008-08-20'),
        noTelepon: '08234567890',
        email: 'siti.nurhaliza@student.com',
        namaOrangTua: 'Hasan Abdullah'
      },
      {
        nisn: '1001234569',
        nama: 'Budi Prasetyo',
        noAbsen: 1,
        jenisKelamin: 'Laki-laki',
        kelas: 'X IPA 2',
        alamat: 'Jl. Gatot Subroto No. 78, Jakarta',
        tanggalLahir: new Date('2008-03-10'),
        noTelepon: '08345678901',
        email: 'budi.prasetyo@student.com',
        namaOrangTua: 'Agus Wijaya'
      },
      {
        nisn: '1001234570',
        nama: 'Dewi Lestari',
        noAbsen: 1,
        jenisKelamin: 'Perempuan',
        kelas: 'X IPS 1',
        alamat: 'Jl. Thamrin No. 90, Jakarta',
        tanggalLahir: new Date('2008-12-05'),
        noTelepon: '08456789012',
        email: 'dewi.lestari@student.com',
        namaOrangTua: 'Eko Prasetyo'
      },
      {
        nisn: '1001234571',
        nama: 'Rizki Ramadhan',
        noAbsen: 2,
        jenisKelamin: 'Laki-laki',
        kelas: 'X IPS 1',
        alamat: 'Jl. Ahmad Yani No. 12, Jakarta',
        tanggalLahir: new Date('2008-07-25'),
        noTelepon: '08567890123',
        email: 'rizki.ramadhan@student.com',
        namaOrangTua: 'Bambang Susilo'
      },
      {
        nisn: '1001234572',
        nama: 'Ani Widiastuti',
        noAbsen: 1,
        jenisKelamin: 'Perempuan',
        kelas: 'XI IPA 1',
        alamat: 'Jl. Diponegoro No. 34, Jakarta',
        tanggalLahir: new Date('2007-02-14'),
        noTelepon: '08678901234',
        email: 'ani.widiastuti@student.com',
        namaOrangTua: 'Suharto Wibowo'
      },
      {
        nisn: '1001234573',
        nama: 'Doni Saputra',
        noAbsen: 1,
        jenisKelamin: 'Laki-laki',
        kelas: 'XI IPA 2',
        alamat: 'Jl. Pemuda No. 56, Jakarta',
        tanggalLahir: new Date('2007-09-30'),
        noTelepon: '08789012345',
        email: 'doni.saputra@student.com',
        namaOrangTua: 'Joko Purnomo'
      },
      {
        nisn: '1001234574',
        nama: 'Eka Putri',
        noAbsen: 1,
        jenisKelamin: 'Perempuan',
        kelas: 'XI IPS 1',
        alamat: 'Jl. Veteran No. 67, Jakarta',
        tanggalLahir: new Date('2007-11-18'),
        noTelepon: '08890123456',
        email: 'eka.putri@student.com',
        namaOrangTua: 'Wahyu Nugroho'
      },
      {
        nisn: '1001234575',
        nama: 'Farhan Maulana',
        noAbsen: 1,
        jenisKelamin: 'Laki-laki',
        kelas: 'XII IPA 1',
        alamat: 'Jl. Pahlawan No. 89, Jakarta',
        tanggalLahir: new Date('2006-04-22'),
        noTelepon: '08901234567',
        email: 'farhan.maulana@student.com',
        namaOrangTua: 'Hendro Sutrisno'
      },
      {
        nisn: '1001234576',
        nama: 'Gita Maharani',
        noAbsen: 2,
        jenisKelamin: 'Perempuan',
        kelas: 'XII IPA 1',
        alamat: 'Jl. Proklamasi No. 101, Jakarta',
        tanggalLahir: new Date('2006-06-08'),
        noTelepon: '08012345678',
        email: 'gita.maharani@student.com',
        namaOrangTua: 'Rudi Hartono'
      }
    ];

    await Student.insertMany(students);
    console.log('Sample students created');

    console.log('\n=== Seed Data Completed ===');
    console.log('\nLogin Credentials:');
    console.log('Admin:');
    console.log('  Email: admin@example.com');
    console.log('  Password: admin123');
    console.log('\nUser:');
    console.log('  Email: user@example.com');
    console.log('  Password: user123');
    console.log('\n10 sample students have been added to the database.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
