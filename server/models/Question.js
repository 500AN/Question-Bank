const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Please provide question text'],
    trim: true,
    maxlength: [1000, 'Question text cannot be more than 1000 characters']
  },
  options: {
    type: [{
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Option text cannot be more than 500 characters']
      },
      label: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D']
      }
    }],
    validate: {
      validator: function(options) {
        return options.length === 4;
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctOption: {
    type: String,
    required: [true, 'Please specify the correct option'],
    enum: ['A', 'B', 'C', 'D']
  },
  explanation: {
    type: String,
    maxlength: [1000, 'Explanation cannot be more than 1000 characters']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  marks: {
    type: Number,
    default: 1,
    min: [0.25, 'Marks must be at least 0.25'],
    max: [10, 'Marks cannot exceed 10']
  },
  timesUsed: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient searching
questionSchema.index({ subject: 1, topic: 1, difficultyLevel: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ tags: 1 });

module.exports = mongoose.model('Question', questionSchema);