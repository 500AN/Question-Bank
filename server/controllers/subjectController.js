const { validationResult } = require('express-validator');
const { Subject, Topic } = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Teacher/Admin)
const createSubject = async (req, res) => {
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

    const { name, code, description, topics } = req.body;

    const subject = await Subject.create({
      name,
      code,
      description,
      topics: topics || [],
      createdBy: req.user.id
    });

    const populatedSubject = await Subject.findById(subject._id)
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedSubject
    });
  } catch (error) {
    console.error('Create subject error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Subject ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Teacher/Admin)
const updateSubject = async (req, res) => {
  try {
    const { name, code, description, topics } = req.body;

    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if user is the creator or admin
    if (subject.createdBy && subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this subject'
      });
    }

    subject = await Subject.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        description,
        topics
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Update subject error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Subject ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Teacher/Admin)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Check if user is the creator or admin
    if (subject.createdBy && subject.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this subject'
      });
    }

    // Soft delete by setting isActive to false
    await Subject.findByIdAndUpdate(req.params.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get topics for a subject
// @route   GET /api/subjects/:id/topics
// @access  Private
const getSubjectTopics = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Get topics from the Topic model for this subject
    const topics = await Topic.find({ subject: req.params.id })
      .select('_id name description')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Get subject topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectTopics
};