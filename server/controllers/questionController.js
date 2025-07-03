const { validationResult } = require('express-validator');
const Question = require('../models/Question');
const { Subject, Topic } = require('../models/Subject');
const XLSX = require('xlsx');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @desc    Get all questions for a teacher
// @route   GET /api/questions
// @access  Private (Teacher)
const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { createdBy: req.user.id };
    
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficultyLevel = req.query.difficulty;
    if (req.query.search) {
      filter.questionText = { $regex: req.query.search, $options: 'i' };
    }

    const questions = await Question.find(filter)
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: questions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private (Teacher)
const getQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    })
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('createdBy', 'name');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new question
// @route   POST /api/questions
// @access  Private (Teacher)
const createQuestion = async (req, res) => {
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

    const {
      questionText,
      options,
      correctOption,
      explanation,
      subject,
      topic,
      difficultyLevel,
      tags
    } = req.body;

    // Verify subject and topic exist
    const subjectExists = await Subject.findById(subject);
    const topicExists = await Topic.findById(topic);

    if (!subjectExists || !topicExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject or topic'
      });
    }

    // Create question
    const question = await Question.create({
      questionText,
      options,
      correctOption,
      explanation,
      subject,
      topic,
      difficultyLevel,
      tags,
      createdBy: req.user.id
    });

    const populatedQuestion = await Question.findById(question._id)
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: populatedQuestion
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private (Teacher)
const updateQuestion = async (req, res) => {
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

    let question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update question
    question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('subject', 'name')
      .populate('topic', 'name')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private (Teacher)
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create multiple questions at once
// @route   POST /api/questions/bulk
// @access  Private (Teacher)
const bulkCreateQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required and must not be empty'
      });
    }

    const createdQuestions = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      try {
        const questionData = questions[i];

        // Validate required fields
        if (!questionData.questionText || !questionData.options || !questionData.correctOption ||
            !questionData.subject || !questionData.topic) {
          errors.push({
            index: i + 1,
            message: 'Missing required fields: questionText, options, correctOption, subject, topic'
          });
          continue;
        }

        // Verify subject and topic exist
        const subjectExists = await Subject.findById(questionData.subject);
        const topicExists = await Topic.findById(questionData.topic);

        if (!subjectExists || !topicExists) {
          errors.push({
            index: i + 1,
            message: 'Invalid subject or topic ID'
          });
          continue;
        }

        // Create question
        const question = await Question.create({
          ...questionData,
          createdBy: req.user.id
        });

        const populatedQuestion = await Question.findById(question._id)
          .populate('subject', 'name')
          .populate('topic', 'name')
          .populate('createdBy', 'name');

        createdQuestions.push(populatedQuestion);
      } catch (error) {
        errors.push({
          index: i + 1,
          message: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      data: {
        created: createdQuestions,
        errors: errors,
        totalProcessed: questions.length,
        successCount: createdQuestions.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk create questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Import questions from Excel file
// @route   POST /api/questions/import
// @access  Private (Teacher)
const importQuestionsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is required'
      });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or has no valid data'
      });
    }

    const createdQuestions = [];
    const errors = [];

    // Get all subjects and topics for mapping
    const subjects = await Subject.find({});
    const topics = await Topic.find({});

    const subjectMap = {};
    const topicMap = {};

    subjects.forEach(subject => {
      subjectMap[subject.name.toLowerCase()] = subject._id;
      subjectMap[subject.code?.toLowerCase()] = subject._id;
    });

    topics.forEach(topic => {
      topicMap[topic.name.toLowerCase()] = topic._id;
    });

    for (let i = 0; i < data.length; i++) {
      try {
        const row = data[i];

        // Map Excel columns to question fields
        const questionText = row['Question'] || row['question'] || row['Question Text'] || row['questionText'];
        const optionA = row['Option A'] || row['optionA'] || row['A'];
        const optionB = row['Option B'] || row['optionB'] || row['B'];
        const optionC = row['Option C'] || row['optionC'] || row['C'];
        const optionD = row['Option D'] || row['optionD'] || row['D'];
        const correctOption = row['Correct Answer'] || row['correctAnswer'] || row['Correct'] || row['Answer'];
        const explanation = row['Explanation'] || row['explanation'] || '';
        const subjectName = row['Subject'] || row['subject'];
        const topicName = row['Topic'] || row['topic'];
        const difficulty = row['Difficulty'] || row['difficulty'] || 'medium';
        const tags = row['Tags'] || row['tags'] || '';

        // Validate required fields
        if (!questionText || !optionA || !optionB || !optionC || !optionD || !correctOption || !subjectName || !topicName) {
          errors.push({
            row: i + 2, // +2 because Excel rows start from 1 and we have header
            message: 'Missing required fields'
          });
          continue;
        }

        // Find subject and topic IDs
        const subjectId = subjectMap[subjectName.toLowerCase()];
        const topicId = topicMap[topicName.toLowerCase()];

        if (!subjectId || !topicId) {
          errors.push({
            row: i + 2,
            message: `Subject "${subjectName}" or Topic "${topicName}" not found`
          });
          continue;
        }

        // Validate correct option
        const validOptions = ['A', 'B', 'C', 'D'];
        if (!validOptions.includes(correctOption.toUpperCase())) {
          errors.push({
            row: i + 2,
            message: 'Correct answer must be A, B, C, or D'
          });
          continue;
        }

        // Create question object
        const questionData = {
          questionText,
          options: [
            { text: optionA, label: 'A' },
            { text: optionB, label: 'B' },
            { text: optionC, label: 'C' },
            { text: optionD, label: 'D' }
          ],
          correctOption: correctOption.toUpperCase(),
          explanation,
          subject: subjectId,
          topic: topicId,
          difficultyLevel: difficulty.toLowerCase(),
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          createdBy: req.user.id
        };

        // Create question
        const question = await Question.create(questionData);

        const populatedQuestion = await Question.findById(question._id)
          .populate('subject', 'name')
          .populate('topic', 'name')
          .populate('createdBy', 'name');

        createdQuestions.push(populatedQuestion);
      } catch (error) {
        errors.push({
          row: i + 2,
          message: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions imported successfully`,
      data: {
        imported: createdQuestions,
        errors: errors,
        totalProcessed: data.length,
        successCount: createdQuestions.length,
        errorCount: errors.length
      }
    });
  } catch (error) {
    console.error('Import questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Download Excel template for question import
// @route   GET /api/questions/template
// @access  Private (Teacher)
const downloadTemplate = async (req, res) => {
  try {
    // Create sample data for template
    const templateData = [
      {
        'Question': 'What is the capital of France?',
        'Option A': 'London',
        'Option B': 'Berlin',
        'Option C': 'Paris',
        'Option D': 'Madrid',
        'Correct Answer': 'C',
        'Explanation': 'Paris is the capital and largest city of France.',
        'Subject': 'Geography',
        'Topic': 'World Capitals',
        'Difficulty': 'easy',
        'Tags': 'geography, capitals, france'
      },
      {
        'Question': 'Which programming language is known for its use in web development?',
        'Option A': 'Python',
        'Option B': 'JavaScript',
        'Option C': 'C++',
        'Option D': 'Java',
        'Correct Answer': 'B',
        'Explanation': 'JavaScript is primarily used for web development.',
        'Subject': 'Computer Science',
        'Topic': 'Programming Languages',
        'Difficulty': 'medium',
        'Tags': 'programming, web development, javascript'
      }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=question_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  importQuestionsFromExcel,
  downloadTemplate,
  upload
};