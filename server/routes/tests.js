const express = require('express');
const { body } = require('express-validator');
const {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  getStudentReport,
  getTestAttendance
} = require('../controllers/testController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const testValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Test title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('subject')
    .optional()
    .custom((value, { req }) => {
      // If includeAllSubjects is true, subject is not required
      if (req.body.includeAllSubjects) {
        return true;
      }
      // If subject is provided, it must be a valid MongoDB ID
      if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('Valid subject ID is required');
      }
      // If includeAllSubjects is false and no subject provided, it's an error
      if (!req.body.includeAllSubjects && !value) {
        throw new Error('Subject is required when not including all subjects');
      }
      return true;
    })
    .withMessage('Valid subject ID is required'),
  body('questions')
    .optional()
    .custom((value, { req }) => {
      // If includeAllSubjects is true, questions array can be empty or undefined
      if (req.body.includeAllSubjects) {
        return !value || Array.isArray(value);
      }
      // Otherwise, questions array must have at least 1 question
      if (!Array.isArray(value) || value.length < 1) {
        throw new Error('Test must have at least 1 question');
      }
      return true;
    })
    .withMessage('Test must have at least 1 question'),
  body('questions.*')
    .optional()
    .custom((value, { req }) => {
      // If includeAllSubjects is true, skip individual question validation
      if (req.body.includeAllSubjects) {
        return true;
      }
      // Otherwise, all question IDs must be valid MongoDB IDs
      if (value && !value.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error('All question IDs must be valid');
      }
      return true;
    })
    .withMessage('All question IDs must be valid'),
  body('durationMinutes')
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes'),
  body('marksPerQuestion')
    .optional()
    .isFloat({ min: 0.25 })
    .withMessage('Marks per question must be at least 0.25'),
  body('maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum attempts must be at least 1'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('instructions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Instructions cannot exceed 2000 characters'),
  body('restrictToClass')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Class restriction cannot exceed 50 characters'),
  body('restrictToSemester')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Semester restriction cannot exceed 50 characters'),
  body('restrictToBatch')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Batch restriction cannot exceed 50 characters')
];

// All routes require authentication
router.use(protect);

// Routes accessible by both teachers and students
router.get('/', getTests);
router.get('/:id', getTest);

// Routes restricted to teachers
router.post('/', authorize('teacher', 'admin'), testValidation, createTest);
router.put('/:id', authorize('teacher', 'admin'), testValidation, updateTest);
router.delete('/:id', authorize('teacher', 'admin'), deleteTest);

// Report routes
router.get('/reports/students', authorize('teacher', 'admin'), getStudentReport);
router.get('/:id/attendance', authorize('teacher', 'admin'), getTestAttendance);

module.exports = router;