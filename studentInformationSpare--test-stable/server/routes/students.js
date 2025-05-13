import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

// Basic auth check function
const checkAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.status(401).json({ message: 'Please log in' });
  }
  next();
};

// Get all students (protected route)
router.get('/', checkAuth, async (req, res) => {
  try {
    const students = await Student.find().sort({ lastName: 1, firstName: 1 });
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching student records' });
  }
});

// Get student by ID (protected route)
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Error fetching student record' });
  }
});

// Create new student (protected route)
router.post('/', checkAuth, async (req, res) => {
  try {
    const { idNumber, firstName, lastName, middleName, course, year } = req.body;
    
    // Create new student
    const newStudent = new Student({
      idNumber,
      firstName,
      lastName,
      middleName,
      course,
      year
    });

    await newStudent.save();
    res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Error creating student record' });
  }
});

// Update student (protected route)
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { idNumber, firstName, lastName, middleName, course, year } = req.body;
    
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      {
        idNumber,
        firstName,
        lastName,
        middleName,
        course,
        year
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student record' });
  }
});

// Delete student (protected route)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    
    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student record' });
  }
});

// Search students (protected route)
router.get('/search/:query', checkAuth, async (req, res) => {
  try {
    const query = req.params.query;
    const students = await Student.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { studentId: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error searching students', error: error.message });
  }
});

export default router; 