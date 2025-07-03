const { validationResult } = require('express-validator');
const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');
const { Subject, Topic } = require('../models/Subject');
const User = require('../models/User');

// @desc    Get all mock tests
// @route   GET /api/tests
// @access  Private
const getTests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};

    // If teacher, show only their tests
    if (req.user.role === 'teacher') {
      filter.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // For students, show only public tests and active tests
      filter.isPublic = true;
      filter.isActive = true;

      // Check date constraints - both start and end date conditions
      const now = new Date();
      filter.$and = [
        {
          $or: [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: { $exists: false } },
            { endDate: { $gte: now } }
          ]
        }
      ];
    }

    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }

    const tests = await MockTest.find(filter)
      .populate('subject', 'name')
      .populate('topics', 'name')
      .populate('createdBy', 'name')
      .populate('questions', 'questionText difficultyLevel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MockTest.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: tests.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: tests
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single test
// @route   GET /api/tests/:id
// @access  Private
const getTest = async (req, res) => {
  try {
    let filter = { _id: req.params.id };

    // If teacher, they can see their own tests
    if (req.user.role === 'teacher') {
      filter.createdBy = req.user.id;
    } else if (req.user.role === 'student') {
      // Students can only see public and active tests
      filter.isPublic = true;
      filter.isActive = true;
    }

    const test = await MockTest.findOne(filter)
      .populate('subject', 'name')
      .populate('topics', 'name')
      .populate('createdBy', 'name')
      .populate({
        path: 'questions',
        select: 'questionText options difficultyLevel',
        populate: {
          path: 'subject topic',
          select: 'name'
        }
      });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // For students, check if they can still take the test
    if (req.user.role === 'student') {
      const attemptCount = await TestAttempt.countDocuments({
        student: req.user.id,
        mockTest: test._id
      });

      test._doc.canAttempt = attemptCount < test.maxAttempts;
      test._doc.attemptsLeft = test.maxAttempts - attemptCount;
    }

    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new test
// @route   POST /api/tests
// @access  Private (Teacher)
const createTest = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const testData = {
      ...req.body,
      createdBy: req.user.id
    };

    // Handle "include all subjects" option
    if (testData.includeAllSubjects) {
      // Get all subjects and their topics
      const subjects = await Subject.find({ isActive: true });
      const allTopics = await Topic.find({ isActive: true });

      // Get questions from all subjects
      const allQuestions = await Question.find({
        isActive: true,
        subject: { $in: subjects.map(s => s._id) }
      }).select('_id');

      testData.questions = allQuestions.map(q => q._id);
      testData.topics = allTopics.map(t => t._id);

      // Set subject to the first one (or create a mixed subject indicator)
      if (subjects.length > 0) {
        testData.subject = subjects[0]._id;
      }
    } else {
      // Verify all questions exist
      if (testData.questions && testData.questions.length > 0) {
        const questionCount = await Question.countDocuments({
          _id: { $in: testData.questions }
        });

        if (questionCount !== testData.questions.length) {
          return res.status(400).json({
            success: false,
            message: 'Some questions do not exist'
          });
        }
      }
    }

    const test = await MockTest.create(testData);

    const populatedTest = await MockTest.findById(test._id)
      .populate('subject', 'name')
      .populate('topics', 'name')
      .populate('createdBy', 'name')
      .populate('questions', 'questionText difficultyLevel');

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: populatedTest
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update test
// @route   PUT /api/tests/:id
// @access  Private (Teacher)
const updateTest = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let test = await MockTest.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    test = await MockTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('subject', 'name')
      .populate('topics', 'name')
      .populate('createdBy', 'name')
      .populate('questions', 'questionText difficultyLevel');

    res.status(200).json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete test
// @route   DELETE /api/tests/:id
// @access  Private (Teacher)
const deleteTest = async (req, res) => {
  try {
    const test = await MockTest.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    await MockTest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully'
    });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get student registration report
// @route   GET /api/tests/reports/students
// @access  Private (Teacher/Admin)
const getStudentReport = async (req, res) => {
  try {
    const { batch, semester, department, class: className } = req.query;

    let filter = { role: 'student', isActive: true };

    // Only add filters if they have values
    if (batch && batch.trim()) filter.batch = batch.trim();
    if (semester && semester.trim()) filter.semester = semester.trim();
    if (department && department.trim()) filter.department = department.trim();
    if (className && className.trim()) filter.class = className.trim();

    const students = await User.find(filter)
      .select('name email batch semester department class rollNumber createdAt')
      .sort({ createdAt: -1 });

    // Get test attempts for these students
    const studentIds = students.map(s => s._id);
    const attempts = await TestAttempt.find({
      student: { $in: studentIds }
    })
    .populate('mockTest', 'title')
    .populate('student', 'name rollNumber');

    // Group attempts by student
    const studentReports = students.map(student => {
      const studentAttempts = attempts.filter(
        attempt => attempt.student._id.toString() === student._id.toString()
      );

      return {
        ...student.toObject(),
        totalAttempts: studentAttempts.length,
        completedTests: studentAttempts.filter(a => a.status === 'completed').length,
        averageScore: studentAttempts.length > 0
          ? studentAttempts.reduce((sum, a) => sum + a.percentage, 0) / studentAttempts.length
          : 0,
        lastAttempt: studentAttempts.length > 0
          ? studentAttempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
          : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        students: studentReports,
        summary: {
          totalStudents: students.length,
          totalAttempts: attempts.length,
          averageScore: studentReports.reduce((sum, s) => sum + s.averageScore, 0) / students.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get student report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get test attendance report
// @route   GET /api/tests/:id/attendance
// @access  Private (Teacher/Admin)
const getTestAttendance = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Check if user is authorized to view this test
    if (req.user.role === 'teacher' && test.createdBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this test'
      });
    }

    // Get eligible students based on test restrictions
    let studentFilter = { role: 'student', isActive: true };

    if (test.restrictToBatch) studentFilter.batch = test.restrictToBatch;
    if (test.restrictToSemester) studentFilter.semester = test.restrictToSemester;
    if (test.restrictToDepartment) studentFilter.department = test.restrictToDepartment;
    if (test.restrictToClass) studentFilter.class = test.restrictToClass;

    const eligibleStudents = await User.find(studentFilter)
      .select('name email batch semester department class rollNumber');

    // Get attempts for this test
    const attempts = await TestAttempt.find({ mockTest: req.params.id })
      .populate('student', 'name email batch semester department class rollNumber')
      .sort({ createdAt: -1 });

    // Create attendance report
    const attendanceReport = eligibleStudents.map(student => {
      const studentAttempts = attempts.filter(
        attempt => attempt.student._id.toString() === student._id.toString()
      );

      const bestAttempt = studentAttempts.length > 0
        ? studentAttempts.reduce((best, current) =>
            current.percentage > best.percentage ? current : best
          )
        : null;

      return {
        student: student,
        attempted: studentAttempts.length > 0,
        totalAttempts: studentAttempts.length,
        bestScore: bestAttempt ? bestAttempt.percentage : 0,
        lastAttemptDate: studentAttempts.length > 0
          ? studentAttempts[0].createdAt
          : null,
        status: studentAttempts.length > 0 ? 'Attempted' : 'Not Attempted',
        attempts: studentAttempts.map(attempt => ({
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          percentage: attempt.percentage,
          status: attempt.status,
          submittedAt: attempt.submittedAt,
          timeSpent: attempt.timeSpent
        }))
      };
    });

    const summary = {
      totalEligible: eligibleStudents.length,
      totalAttempted: attendanceReport.filter(r => r.attempted).length,
      totalNotAttempted: attendanceReport.filter(r => !r.attempted).length,
      attendancePercentage: eligibleStudents.length > 0
        ? (attendanceReport.filter(r => r.attempted).length / eligibleStudents.length) * 100
        : 0,
      averageScore: attendanceReport.filter(r => r.attempted).length > 0
        ? attendanceReport.filter(r => r.attempted).reduce((sum, r) => sum + r.bestScore, 0) / attendanceReport.filter(r => r.attempted).length
        : 0
    };

    res.status(200).json({
      success: true,
      data: {
        test: {
          title: test.title,
          totalMarks: test.totalMarks,
          durationMinutes: test.durationMinutes,
          restrictions: {
            batch: test.restrictToBatch,
            semester: test.restrictToSemester,
            department: test.restrictToDepartment,
            class: test.restrictToClass
          }
        },
        attendance: attendanceReport,
        summary
      }
    });
  } catch (error) {
    console.error('Get test attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  getStudentReport,
  getTestAttendance
};