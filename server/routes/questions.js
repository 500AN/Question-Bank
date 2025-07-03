const express = require('express');
const { body } = require('express-validator');
const {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  importQuestionsFromExcel,
  downloadTemplate,
  upload
} = require('../controllers/questionController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const questionValidation = [
  body('questionText')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Question text must be between 10 and 1000 characters'),
  body('options')
    .isArray({ min: 4, max: 4 })
    .withMessage('Question must have exactly 4 options'),
  body('options.*.text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Option text must be between 1 and 500 characters'),
  body('options.*.label')
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Option label must be A, B, C, or D'),
  body('correctOption')
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Correct option must be A, B, C, or D'),
  body('subject')
    .isMongoId()
    .withMessage('Valid subject ID is required'),
  body('topic')
    .isMongoId()
    .withMessage('Valid topic ID is required'),
  body('difficultyLevel')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty level must be easy, medium, or hard'),
  body('explanation')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Explanation cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// All routes require authentication and teacher role
router.use(protect);
router.use(authorize('teacher', 'admin'));

// Routes
router.route('/')
  .get(getQuestions)
  .post(questionValidation, createQuestion);

// Bulk operations routes
router.route('/bulk')
  .post(bulkCreateQuestions);

router.route('/import')
  .post(upload.single('file'), importQuestionsFromExcel);

router.route('/template')
  .get(downloadTemplate);

router.route('/:id')
  .get(getQuestion)
  .put(questionValidation, updateQuestion)
  .delete(deleteQuestion);

module.exports = router;