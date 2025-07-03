const { validationResult } = require('express-validator');
const TestAttempt = require('../models/TestAttempt');
const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const User = require('../models/User');

// @desc    Start a test attempt
// @route   POST /api/attempts/start/:testId
// @access  Private (Student)
const startTest = async (req, res) => {
  try {
    const testId = req.params.testId;
    const studentId = req.user.id;

    // Find the test
    const test = await MockTest.findOne({
      _id: testId,
      isActive: true,
      isPublic: true
    }).populate('questions');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found or not available'
      });
    }

    // Check if test has questions
    if (!test.questions || test.questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This test has no questions available'
      });
    }

    // Check if test is within date range
    const now = new Date();

    if (test.startDate && now < test.startDate) {
      return res.status(400).json({
        success: false,
        message: 'Test has not started yet'
      });
    }

    if (test.endDate && now > test.endDate) {
      return res.status(400).json({
        success: false,
        message: 'Test has ended'
      });
    }

    // Get student information for profile validation
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check access restrictions based on student profile
    if (test.restrictToClass) {
      if (!student.class || test.restrictToClass.toLowerCase() !== student.class.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: `This test is restricted to ${test.restrictToClass} class students only`
        });
      }
    }

    if (test.restrictToSemester) {
      if (!student.semester || test.restrictToSemester.toLowerCase() !== student.semester.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: `This test is restricted to ${test.restrictToSemester} semester students only`
        });
      }
    }

    if (test.restrictToBatch) {
      if (!student.batch || test.restrictToBatch.toLowerCase() !== student.batch.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: `This test is restricted to ${test.restrictToBatch} batch students only`
        });
      }
    }

    if (test.restrictToDepartment) {
      if (!student.department || test.restrictToDepartment.toLowerCase() !== student.department.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: `This test is restricted to ${test.restrictToDepartment} department students only`
        });
      }
    }

    // Check existing attempts
    const existingAttempts = await TestAttempt.find({
      student: studentId,
      mockTest: testId
    });

    // Check maximum attempts (only if repeat attempts are not allowed)
    if (!test.allowRepeatAttempts && existingAttempts.length >= test.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached for this test'
      });
    }

    // If repeat attempts are allowed, check if max attempts per session is reached
    if (test.allowRepeatAttempts && existingAttempts.length >= test.maxAttempts) {
      // Allow unlimited attempts or reset after a certain period
      // For now, we'll allow unlimited attempts when repeat is enabled
    }

    // Check for ongoing attempt
    const ongoingAttempt = existingAttempts.find(attempt =>
      attempt.status === 'in-progress'
    );

    if (ongoingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have an ongoing attempt for this test',
        attemptId: ongoingAttempt._id
      });
    }

    // Shuffle questions if required
    let questions = test.questions;
    if (test.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    // Create new attempt
    const attempt = await TestAttempt.create({
      student: studentId,
      mockTest: testId,
      totalMarks: test.totalMarks,
      attemptNumber: existingAttempts.length + 1,
      answers: questions.map(question => ({
        question: question._id,
        selectedOption: null,
        isCorrect: false,
        marksAwarded: 0,
        timeSpent: 0
      })),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    console.log('Attempt created successfully:', attempt._id);

    // Return test data without correct answers
    const testData = {
      attemptId: attempt._id,
      testTitle: test.title,
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      instructions: test.instructions,
      questions: questions.map(q => ({
        id: q._id,
        questionText: q.questionText,
        options: q.options,
        difficultyLevel: q.difficultyLevel
      })),
      startTime: attempt.startTime
    };

    res.status(201).json({
      success: true,
      message: 'Test started successfully',
      data: testData
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit answer for a question
// @route   PUT /api/attempts/:attemptId/answer
// @access  Private (Student)
const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, timeSpent } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      student: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found or already completed'
      });
    }

    // Find the answer to update
    const answerIndex = attempt.answers.findIndex(
      answer => answer.question.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Question not found in this attempt'
      });
    }

    // Get the correct answer
    const question = await Question.findById(questionId);
    const isCorrect = selectedOption === question.correctOption;

    // Calculate marks
    const test = await MockTest.findById(attempt.mockTest);
    let marksAwarded = 0;
    
    if (isCorrect) {
      marksAwarded = test.marksPerQuestion;
    } else if (test.negativeMarking.enabled && selectedOption) {
      marksAwarded = -test.negativeMarking.marksDeducted;
    }

    // Update the answer
    attempt.answers[answerIndex] = {
      question: questionId,
      selectedOption,
      isCorrect,
      marksAwarded,
      timeSpent: timeSpent || 0
    };

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully'
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Save multiple answers (bulk save)
// @route   PUT /api/attempts/:attemptId/answers
// @access  Private (Student)
const saveAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Expected format: { questionId: optionIndex, ... }

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      student: req.user.id,
      status: 'in-progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found or already completed'
      });
    }

    // Get test details for marking
    const test = await MockTest.findById(attempt.mockTest);

    // Update answers
    for (const [questionId, optionIndex] of Object.entries(answers)) {
      const answerIndex = attempt.answers.findIndex(
        answer => answer.question.toString() === questionId
      );

      if (answerIndex !== -1) {
        // Convert option index to letter (0 -> 'A', 1 -> 'B', etc.)
        const selectedOption = String.fromCharCode(65 + parseInt(optionIndex));

        // Get the correct answer
        const question = await Question.findById(questionId);
        const isCorrect = selectedOption === question.correctOption;

        // Calculate marks
        let marksAwarded = 0;
        if (isCorrect) {
          marksAwarded = test.marksPerQuestion;
        } else if (test.negativeMarking.enabled && selectedOption) {
          marksAwarded = -test.negativeMarking.marksDeducted;
        }

        // Update the answer
        attempt.answers[answerIndex] = {
          question: questionId,
          selectedOption,
          isCorrect,
          marksAwarded,
          timeSpent: attempt.answers[answerIndex].timeSpent || 0
        };
      }
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Answers saved successfully'
    });
  } catch (error) {
    console.error('Save answers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Submit complete test
// @route   POST /api/attempts/:attemptId/submit
// @access  Private (Student)
const submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body; // Final answers from client

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      student: req.user.id,
      status: 'in-progress'
    }).populate('mockTest');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found or already completed'
      });
    }

    // Save final answers if provided
    if (answers && Object.keys(answers).length > 0) {
      const test = await MockTest.findById(attempt.mockTest);

      // Update answers
      for (const [questionId, optionIndex] of Object.entries(answers)) {
        const answerIndex = attempt.answers.findIndex(
          answer => answer.question.toString() === questionId
        );

        if (answerIndex !== -1) {
          // Convert option index to letter (0 -> 'A', 1 -> 'B', etc.)
          const selectedOption = String.fromCharCode(65 + parseInt(optionIndex));

          // Get the correct answer
          const question = await Question.findById(questionId);
          const isCorrect = selectedOption === question.correctOption;

          // Calculate marks
          let marksAwarded = 0;
          if (isCorrect) {
            marksAwarded = test.marksPerQuestion;
          } else if (test.negativeMarking.enabled && selectedOption) {
            marksAwarded = -test.negativeMarking.marksDeducted;
          }

          // Update the answer
          attempt.answers[answerIndex] = {
            question: questionId,
            selectedOption,
            isCorrect,
            marksAwarded,
            timeSpent: attempt.answers[answerIndex].timeSpent || 0
          };
        }
      }
    }

    // Update attempt status
    attempt.status = 'completed';
    attempt.isSubmitted = true;
    attempt.submittedAt = new Date();
    attempt.endTime = new Date();

    await attempt.save();

    // Prepare result data
    const result = {
      attemptId: attempt._id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      timeSpent: attempt.timeSpent,
      submittedAt: attempt.submittedAt
    };

    // If show results immediately is enabled, include detailed results
    if (attempt.mockTest.showResultsImmediately) {
      const detailedAnswers = await Promise.all(
        attempt.answers.map(async (answer) => {
          const question = await Question.findById(answer.question);
          return {
            questionId: answer.question,
            questionText: question.questionText,
            options: question.options,
            selectedOption: answer.selectedOption,
            correctOption: question.correctOption,
            isCorrect: answer.isCorrect,
            marksAwarded: answer.marksAwarded,
            explanation: question.explanation
          };
        })
      );

      result.detailedAnswers = detailedAnswers;
    }

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get test attempt details
// @route   GET /api/attempts/:attemptId
// @access  Private (Student)
const getAttempt = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      student: req.user.id
    })
      .populate({
        path: 'mockTest',
        select: 'title durationMinutes showResultsImmediately',
        populate: {
          path: 'questions',
          select: 'questionText options correctOption explanation difficulty'
        }
      })
      .populate({
        path: 'answers.question',
        select: 'questionText options correctOption explanation'
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's test history
// @route   GET /api/attempts/history
// @access  Private (Student)
const getTestHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const attempts = await TestAttempt.find({
      student: req.user.id,
      status: 'completed'
    })
      .populate('mockTest', 'title subject totalMarks')
      .populate({
        path: 'mockTest',
        populate: {
          path: 'subject',
          select: 'name'
        }
      })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TestAttempt.countDocuments({
      student: req.user.id,
      status: 'completed'
    });

    res.status(200).json({
      success: true,
      count: attempts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: attempts
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student's results (completed attempts)
// @route   GET /api/attempts/results/my
// @access  Private (Student)
const getMyResults = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({
      student: req.user.id,
      status: 'completed'
    })
      .populate('mockTest', 'title subject totalMarks allowReview showImprovementAnalysis passingMarks')
      .populate({
        path: 'mockTest',
        populate: {
          path: 'subject',
          select: 'name'
        }
      })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Get my results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all results (for teachers)
// @route   GET /api/attempts/results
// @access  Private (Teacher/Admin)
const getAllResults = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({
      status: 'completed'
    })
      .populate('student', 'name email')
      .populate('mockTest', 'title subject totalMarks allowReview showImprovementAnalysis passingMarks')
      .populate({
        path: 'mockTest',
        populate: {
          path: 'subject',
          select: 'name'
        }
      })
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get attempt review with detailed answers
// @route   GET /api/attempts/:id/review
// @access  Private (Student - own attempts, Teacher - all attempts)
const getAttemptReview = async (req, res) => {
  try {
    const attempt = await TestAttempt.findById(req.params.attemptId)
      .populate('student', 'name email')
      .populate({
        path: 'mockTest',
        select: 'title subject questions totalMarks',
        populate: [
          {
            path: 'subject',
            select: 'name'
          },
          {
            path: 'questions',
            select: 'questionText options correctAnswer explanation difficultyLevel'
          }
        ]
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    // Check if user can access this attempt
    if (req.user.role === 'student' && attempt.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get attempt review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};



// Get all attempts for a specific test (for teachers)
const getTestAttempts = async (req, res) => {
  try {
    const { testId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if the test exists and belongs to the teacher
    const test = await MockTest.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if the user is the creator of the test or an admin
    if (req.user.role !== 'admin' && test.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const attempts = await TestAttempt.find({ mockTest: testId })
      .populate('student', 'name email class semester batch rollNumber')
      .populate('mockTest', 'title totalMarks allowReview showImprovementAnalysis passingMarks')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalAttempts = await TestAttempt.countDocuments({ mockTest: testId });
    const totalPages = Math.ceil(totalAttempts / limit);

    res.status(200).json({
      success: true,
      data: {
        attempts,
        pagination: {
          currentPage: page,
          totalPages,
          totalAttempts,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get test attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get improvement analysis for repeat attempts
// @route   GET /api/attempts/:testId/improvement
// @access  Private (Student)
const getImprovementAnalysis = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user.id;

    // Get all attempts for this test by the student
    const attempts = await TestAttempt.find({
      student: studentId,
      mockTest: testId,
      status: 'completed'
    })
    .populate('mockTest', 'title totalMarks allowRepeatAttempts showImprovementAnalysis')
    .sort({ attemptNumber: 1 });

    if (attempts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No completed attempts found for this test'
      });
    }

    const test = attempts[0].mockTest;

    // Check if improvement analysis is enabled for this test
    if (!test.showImprovementAnalysis) {
      return res.status(403).json({
        success: false,
        message: 'Improvement analysis is not enabled for this test'
      });
    }

    // Calculate improvement metrics
    const improvementData = {
      testInfo: {
        title: test.title,
        totalMarks: test.totalMarks,
        totalAttempts: attempts.length
      },
      attempts: attempts.map((attempt, index) => ({
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        percentage: attempt.percentage,
        timeSpent: attempt.timeSpent,
        submittedAt: attempt.submittedAt,
        improvement: index > 0 ? {
          scoreChange: attempt.score - attempts[index - 1].score,
          percentageChange: attempt.percentage - attempts[index - 1].percentage,
          timeChange: attempt.timeSpent - attempts[index - 1].timeSpent
        } : null
      })),
      overallImprovement: {
        firstAttempt: {
          score: attempts[0].score,
          percentage: attempts[0].percentage
        },
        lastAttempt: {
          score: attempts[attempts.length - 1].score,
          percentage: attempts[attempts.length - 1].percentage
        },
        totalImprovement: {
          scoreChange: attempts[attempts.length - 1].score - attempts[0].score,
          percentageChange: attempts[attempts.length - 1].percentage - attempts[0].percentage
        },
        bestAttempt: attempts.reduce((best, current) =>
          current.percentage > best.percentage ? current : best
        ),
        averageScore: attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length
      },
      trends: {
        improving: attempts[attempts.length - 1].percentage > attempts[0].percentage,
        consistentImprovement: attempts.length > 2 ?
          attempts.slice(1).every((attempt, index) =>
            attempt.percentage >= attempts[index].percentage
          ) : null,
        bestStreak: calculateBestStreak(attempts)
      }
    };

    // Get detailed question-wise analysis if there are multiple attempts
    if (attempts.length > 1) {
      const questionAnalysis = await getQuestionWiseImprovement(attempts);
      improvementData.questionAnalysis = questionAnalysis;
    }

    res.status(200).json({
      success: true,
      data: improvementData
    });
  } catch (error) {
    console.error('Get improvement analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to calculate best improvement streak
const calculateBestStreak = (attempts) => {
  let currentStreak = 0;
  let bestStreak = 0;

  for (let i = 1; i < attempts.length; i++) {
    if (attempts[i].percentage > attempts[i - 1].percentage) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return bestStreak;
};

// Helper function to get question-wise improvement analysis
const getQuestionWiseImprovement = async (attempts) => {
  const questionStats = {};

  attempts.forEach(attempt => {
    attempt.answers.forEach(answer => {
      const questionId = answer.question.toString();

      if (!questionStats[questionId]) {
        questionStats[questionId] = {
          attempts: [],
          correctCount: 0,
          totalAttempts: 0
        };
      }

      questionStats[questionId].attempts.push({
        attemptNumber: attempt.attemptNumber,
        isCorrect: answer.isCorrect,
        selectedOption: answer.selectedOption,
        marksAwarded: answer.marksAwarded
      });

      questionStats[questionId].totalAttempts++;
      if (answer.isCorrect) {
        questionStats[questionId].correctCount++;
      }
    });
  });

  // Calculate improvement for each question
  const questionImprovement = Object.entries(questionStats).map(([questionId, stats]) => ({
    questionId,
    successRate: (stats.correctCount / stats.totalAttempts) * 100,
    attempts: stats.attempts,
    improved: stats.attempts.length > 1 &&
      stats.attempts[stats.attempts.length - 1].isCorrect &&
      !stats.attempts[0].isCorrect,
    consistentlyCorrect: stats.attempts.every(attempt => attempt.isCorrect),
    neverCorrect: stats.attempts.every(attempt => !attempt.isCorrect)
  }));

  return {
    totalQuestions: Object.keys(questionStats).length,
    improvedQuestions: questionImprovement.filter(q => q.improved).length,
    consistentQuestions: questionImprovement.filter(q => q.consistentlyCorrect).length,
    difficultQuestions: questionImprovement.filter(q => q.neverCorrect).length,
    questions: questionImprovement
  };
};

module.exports = {
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
};