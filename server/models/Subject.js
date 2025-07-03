const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a subject name'],
    trim: true,
    unique: true,
    maxlength: [100, 'Subject name cannot be more than 100 characters']
  },
  code: {
    type: String,
    trim: true,
    unique: true,
    maxlength: [20, 'Subject code cannot be more than 20 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  topics: [{
    type: String,
    trim: true,
    maxlength: [100, 'Topic name cannot be more than 100 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a topic name'],
    trim: true,
    maxlength: [100, 'Topic name cannot be more than 100 characters']
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique topic names within a subject
topicSchema.index({ name: 1, subject: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
const Topic = mongoose.model('Topic', topicSchema);

module.exports = { Subject, Topic };