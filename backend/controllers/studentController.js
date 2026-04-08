const Student = require('../models/Student');

// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get Single Student
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Create Student (Admin only)
exports.createStudent = async (req, res) => {
  try {
    const { nisn, nama, jenisKelamin, kelas, alamat, tanggalLahir, noTelepon, email, statusKeaktifan } = req.body;

    // Cek apakah NISN sudah ada
    const existingStudent = await Student.findOne({ nisn });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: 'NISN already exists' 
      });
    }

    // Generate nomor absen otomatis untuk kelas yang dipilih
    const studentsInClass = await Student.find({ kelas }).sort({ noAbsen: -1 });
    const nextAbsen = studentsInClass.length > 0 ? studentsInClass[0].noAbsen + 1 : 1;

    const student = await Student.create({
      nisn,
      nama,
      noAbsen: nextAbsen,
      jenisKelamin,
      kelas,
      alamat,
      tanggalLahir,
      noTelepon,
      email,
      statusKeaktifan
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update Student (Admin only)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Jika kelas berubah, generate nomor absen baru untuk kelas baru
    if (req.body.kelas && req.body.kelas !== student.kelas) {
      const studentsInNewClass = await Student.find({ kelas: req.body.kelas }).sort({ noAbsen: -1 });
      const nextAbsen = studentsInNewClass.length > 0 ? studentsInNewClass[0].noAbsen + 1 : 1;
      req.body.noAbsen = nextAbsen;
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete Student (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Search Students
exports.searchStudents = async (req, res) => {
  try {
    const { query } = req.query;
    
    const students = await Student.find({
      $or: [
        { nama: { $regex: query, $options: 'i' } },
        { nisn: { $regex: query, $options: 'i' } },
        { kelas: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get Students by Class
exports.getStudentsByClass = async (req, res) => {
  try {
    const { kelas } = req.params;
    
    const students = await Student.find({ kelas }).sort({ noAbsen: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get All Classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Student.distinct('kelas');
    
    res.json({
      success: true,
      count: classes.length,
      data: classes.sort()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Bulk Create Students (Admin only)
exports.bulkCreateStudents = async (req, res) => {
  try {
    const students = req.body;
    
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Data yang dikirim tidak valid' });
    }

    let imported = 0;
    let failed = 0;
    let errors = [];
    const maxAbsenCache = {};

    for (let i = 0; i < students.length; i++) {
        const stud = students[i];
        try {
            // Check required fields
            if (!stud.nisn || !stud.nama || !stud.kelas || !stud.jenisKelamin) {
                failed++;
                errors.push(`Baris ${i+1}: Kolom wajib (NISN, Nama, Kelas, Jenis Kelamin) belum lengkap`);
                continue;
            }

            const exists = await Student.findOne({ nisn: stud.nisn });
            if (exists) {
                failed++;
                errors.push(`Baris ${i+1}: NISN ${stud.nisn} sudah terdaftar`);
                continue;
            }

            // Generate noAbsen per class on the fly
            if (maxAbsenCache[stud.kelas] === undefined) {
                const highest = await Student.find({ kelas: stud.kelas }).sort({ noAbsen: -1 }).limit(1);
                maxAbsenCache[stud.kelas] = highest.length > 0 ? highest[0].noAbsen : 0;
            }
            maxAbsenCache[stud.kelas]++;
            stud.noAbsen = maxAbsenCache[stud.kelas];
            
            // Set defaults and sanitize
            stud.statusKeaktifan = stud.statusKeaktifan || 'Aktif';
            if (!stud.tanggalLahir) stud.tanggalLahir = new Date('2000-01-01'); // fallback
            if (!stud.alamat) stud.alamat = '-';
            if (!stud.noTelepon) stud.noTelepon = '-';

            await Student.create(stud);
            imported++;
        } catch (err) {
            failed++;
            errors.push(`Baris ${i+1}: ${err.message}`);
        }
    }

    res.status(201).json({
      success: true,
      message: `Import selesai. Berhasil: ${imported}, Gagal: ${failed}`,
      imported,
      failed,
      errors
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error bulk import', 
      error: error.message 
    });
  }
};
