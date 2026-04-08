const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentsByClass,
  getAllClasses,
  bulkCreateStudents
} = require('../controllers/studentController');
const { auth, isAdmin } = require('../middleware/auth');

// @route   GET /api/students/classes
// @desc    Get all unique classes
// @access  Private (User & Admin)
router.get('/classes', auth, getAllClasses);

// @route   GET /api/students/class/:kelas
// @desc    Get students by class
// @access  Private (User & Admin)
router.get('/class/:kelas', auth, getStudentsByClass);

// @route   GET /api/students
// @desc    Get all students
// @access  Private (User & Admin)
router.get('/', auth, getAllStudents);

// @route   GET /api/students/search
// @desc    Search students
// @access  Private (User & Admin)
router.get('/search', auth, searchStudents);

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private (User & Admin)
router.get('/:id', auth, getStudent);

// @route   POST /api/students
// @desc    Create student
// @access  Private (Admin only)
router.post('/', auth, isAdmin, createStudent);

// @route   POST /api/students/bulk
// @desc    Import multiple students
// @access  Private (Admin only)
router.post('/bulk', auth, isAdmin, bulkCreateStudents);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin only)
router.put('/:id', auth, isAdmin, updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin only)
router.delete('/:id', auth, isAdmin, deleteStudent);

module.exports = router;
