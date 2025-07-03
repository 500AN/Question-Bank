const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest',
    required: true
  },
  answers: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOption: {
      type: String,
      enum: ['A', 'B', 'C', 'D', null],
      default: null
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksAwarded: {
      type: Number,
      default: 0
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure unique attempts per test per student
testAttemptSchema.index({ student: 1, mockTest: 1, attemptNumber: 1 }, { unique: true });

// Calculate score and percentage before saving
testAttemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.score = this.answers.reduce((total, answer) => total + answer.marksAwarded, 0);
    this.percentage = (this.score / this.totalMarks) * 100;
  }
  
  if (this.startTime && this.endTime) {
    this.timeSpent = Math.round((this.endTime - this.startTime) / (1000 * 60)); // in minutes
  }
  
  next();
});

module.exports = mongoose.model('TestAttempt', testAttemptSchema);