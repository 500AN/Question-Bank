const TestAttempt = require('../models/TestAttempt');
const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const User = require('../models/User');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'teacher') {
      // Teacher statistics
      const totalQuestions = await Question.countDocuments({ createdBy: userId, isActive: true });
      const activeTests = await MockTest.countDocuments({ createdBy: userId, isActive: true });
      const totalAttempts = await TestAttempt.countDocuments({
        mockTest: { $in: await MockTest.find({ createdBy: userId }).select('_id') }
      });
      
      // Get unique students who attempted tests
      const studentAttempts = await TestAttempt.aggregate([
        {
          $lookup: {
            from: 'mocktests',
            localField: 'mockTest',
            foreignField: '_id',
            as: 'test'
          }
        },
        {
          $match: {
            'test.createdBy': userId
          }
        },
        {
          $group: {
            _id: '$student'
          }
        }
      ]);

      stats = {
        totalQuestions,
        activeTests,
        studentsEnrolled: studentAttempts.length,
        totalAttempts
      };
    } else {
      // Student statistics
      const testsTaken = await TestAttempt.countDocuments({ 
        student: userId, 
        status: 'completed' 
      });
      
      const availableTests = await MockTest.countDocuments({ 
        isActive: true, 
        isPublic: true,
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: new Date() } }
        ],
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gte: new Date() } }
        ]
      });

      // Calculate average score
      const attempts = await TestAttempt.find({ 
        student: userId, 
        status: 'completed' 
      }).select('score totalMarks');
      
      let averageScore = 0;
      if (attempts.length > 0) {
        const totalPercentage = attempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.totalMarks) * 100;
        }, 0);
        averageScore = Math.round(totalPercentage / attempts.length);
      }

      const subjects = await Subject.countDocuments({ isActive: true });

      stats = {
        testsTaken,
        averageScore,
        availableTests,
        subjects
      };
    }

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let activities = [];

    if (userRole === 'teacher') {
      // Recent test attempts on teacher's tests
      const recentAttempts = await TestAttempt.find({
        mockTest: { $in: await MockTest.find({ createdBy: userId }).select('_id') }
      })
      .populate('student', 'name email')
      .populate('mockTest', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

      activities = recentAttempts.map(attempt => ({
        type: 'test_attempt',
        message: `${attempt.student.name} completed "${attempt.mockTest.title}"`,
        score: `${attempt.score}/${attempt.totalMarks}`,
        timestamp: attempt.createdAt
      }));
    } else {
      // Recent test attempts by student
      const recentAttempts = await TestAttempt.find({ student: userId })
        .populate('mockTest', 'title')
        .sort({ createdAt: -1 })
        .limit(10);

      activities = recentAttempts.map(attempt => ({
        type: 'my_attempt',
        message: `You completed "${attempt.mockTest.title}"`,
        score: `${attempt.score}/${attempt.totalMarks}`,
        timestamp: attempt.createdAt
      }));
    }

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity
};