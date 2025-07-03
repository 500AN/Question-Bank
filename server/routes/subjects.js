const express = require('express');
const { body } = require('express-validator');
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectTopics
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const subjectValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Subject code cannot exceed 20 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array')
];

// All routes require authentication
router.use(protect);

// Routes accessible by all authenticated users
router.get('/', getSubjects);
router.get('/:id/topics', getSubjectTopics);

// Routes restricted to teachers and admins
router.post('/', authorize('teacher', 'admin'), subjectValidation, createSubject);
router.put('/:id', authorize('teacher', 'admin'), subjectValidation, updateSubject);
router.delete('/:id', authorize('teacher', 'admin'), deleteSubject);

module.exports = router;