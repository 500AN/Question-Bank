const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a test title'],
    trim: true,
    maxlength: [200, 'Test title cannot be more than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  }],
  durationMinutes: {
    type: Number,
    required: [true, 'Please specify test duration'],
    min: [1, 'Test duration must be at least 1 minute'],
    max: [300, 'Test duration cannot exceed 300 minutes']
  },
  totalMarks: {
    type: Number,
    required: true,
    min: [1, 'Total marks must be at least 1']
  },
  marksPerQuestion: {
    type: Number,
    default: 1,
    min: [0.25, 'Marks per question must be at least 0.25']
  },
  negativeMarking: {
    enabled: {
      type: Boolean,
      default: false
    },
    marksDeducted: {
      type: Number,
      default: 0,
      min: [0, 'Negative marks cannot be less than 0']
    }
  },
  instructions: {
    type: String,
    maxlength: [2000, 'Instructions cannot be more than 2000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: [1, 'Maximum attempts must be at least 1']
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  showResultsImmediately: {
    type: Boolean,
    default: true
  },
  allowReview: {
    type: Boolean,
    default: true
  },
  allowRepeatAttempts: {
    type: Boolean,
    default: false
  },
  showImprovementAnalysis: {
    type: Boolean,
    default: false
  },
  includeAllSubjects: {
    type: Boolean,
    default: false
  },
  passingMarks: {
    type: Number,
    min: [0, 'Passing marks cannot be negative']
  },
  restrictToClass: {
    type: String,
    trim: true
  },
  restrictToSemester: {
    type: String,
    trim: true
  },
  restrictToBatch: {
    type: String,
    trim: true
  },
  restrictToDepartment: {
    type: String,
    trim: true
  },
  trackAttendance: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validate that end date is after start date
mockTestSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Clean up restriction fields - convert empty strings to null
mockTestSchema.pre('save', function(next) {
  // Clean up restriction fields
  if (this.restrictToClass === '') this.restrictToClass = null;
  if (this.restrictToSemester === '') this.restrictToSemester = null;
  if (this.restrictToBatch === '') this.restrictToBatch = null;
  if (this.restrictToDepartment === '') this.restrictToDepartment = null;
  next();
});

// Calculate total marks based on questions
mockTestSchema.pre('save', function(next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.length * this.marksPerQuestion;
  }
  next();
});

module.exports = mongoose.model('MockTest', mockTestSchema);