const express = require('express');
const { body } = require('express-validator');
const {
  startTest,
  submitAnswer,
  saveAnswers,
  submitTest,
  getAttempt,
  getTestHistory,
  getMyResults,
  getAllResults,
  getAttemptReview,
  getTestAttempts,
  getImprovementAnalysis
} = require('../controllers/attemptController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const answerValidation = [
  body('questionId')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('selectedOption')
    .optional()
    .isIn(['A', 'B', 'C', 'D'])
    .withMessage('Selected option must be A, B, C, or D'),
  body('timeSpent')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Time spent must be a positive number')
];

// All routes require authentication
router.use(protect);

// Routes accessible by students only
router.post('/start/:testId', authorize('student'), startTest);
router.put('/:attemptId/answer', authorize('student'), answerValidation, submitAnswer);
router.put('/:attemptId/answers', authorize('student'), saveAnswers);
router.post('/:attemptId/submit', authorize('student'), submitTest);
router.get('/history', authorize('student'), getTestHistory);
router.get('/results/my', authorize('student'), getMyResults);

// Routes accessible by teachers and admins
router.get('/results', authorize('teacher', 'admin'), getAllResults);

// Routes accessible by both students (own attempts) and teachers (all attempts)
router.get('/:attemptId', getAttempt);
router.get('/:attemptId/review', getAttemptReview);

// Route for getting all attempts for a specific test (teachers only)
router.get('/test/:testId', authorize('teacher', 'admin'), getTestAttempts);

// Route for improvement analysis (students only)
router.get('/:testId/improvement', authorize('student'), getImprovementAnalysis);

module.exports = router;