const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
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

    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
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

    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        // Student fields
        class: user.class,
        semester: user.semester,
        batch: user.batch,
        rollNumber: user.rollNumber,
        // Teacher fields
        department: user.department,
        qualification: user.qualification,
        experience: user.experience,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      // Student fields
      class: className,
      semester,
      batch,
      rollNumber,
      // Teacher fields
      department,
      qualification,
      experience
    } = req.body;

    // Debug: Log the received data
    console.log('Profile update request body:', req.body);
    console.log('Profile update file:', req.file);

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle profile picture upload
    const profilePictureFile = req.files && req.files.find(file => file.fieldname === 'profilePicture');
    if (profilePictureFile) {
      // Delete old profile picture if it exists
      if (user.profilePicture) {
        const oldImagePath = path.join(__dirname, '../uploads/profiles', path.basename(user.profilePicture));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Set new profile picture URL
      user.profilePicture = `/uploads/profiles/${profilePictureFile.filename}`;
    }

    // Update common fields (allow empty strings to clear fields)
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    // Update role-specific fields
    if (user.role === 'student') {
      console.log('Updating student fields:', { className, semester, batch, rollNumber });
      if (className !== undefined) {
        console.log('Setting class to:', className);
        user.class = className;
      }
      if (semester !== undefined) {
        console.log('Setting semester to:', semester);
        user.semester = semester;
      }
      if (batch !== undefined) {
        console.log('Setting batch to:', batch);
        user.batch = batch;
      }
      if (rollNumber !== undefined) {
        console.log('Setting rollNumber to:', rollNumber);
        user.rollNumber = rollNumber;
      }
    } else if (user.role === 'teacher') {
      console.log('Updating teacher fields:', { department, qualification, experience });
      if (department !== undefined) {
        console.log('Setting department to:', department);
        user.department = department;
      }
      if (qualification !== undefined) {
        console.log('Setting qualification to:', qualification);
        user.qualification = qualification;
      }
      if (experience !== undefined) {
        console.log('Setting experience to:', experience);
        user.experience = experience;
      }
    }

    console.log('User before save:', {
      name: user.name,
      email: user.email,
      class: user.class,
      semester: user.semester,
      batch: user.batch,
      rollNumber: user.rollNumber,
      department: user.department,
      qualification: user.qualification,
      experience: user.experience
    });

    await user.save();

    console.log('User after save - fetching updated user...');
    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');

    console.log('Updated user from database:', {
      name: updatedUser.name,
      email: updatedUser.email,
      class: updatedUser.class,
      semester: updatedUser.semester,
      batch: updatedUser.batch,
      rollNumber: updatedUser.rollNumber,
      department: updatedUser.department,
      qualification: updatedUser.qualification,
      experience: updatedUser.experience
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  upload
};