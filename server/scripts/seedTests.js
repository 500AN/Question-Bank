const mongoose = require('mongoose');
const MockTest = require('../models/MockTest');
const Question = require('../models/Question');
const { Subject } = require('../models/Subject');
const User = require('../models/User');
require('dotenv').config();

const seedTests = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a system user
    let systemUser = await User.findOne({ email: 'system@test.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System',
        email: 'system@test.com',
        password: 'password123',
        role: 'teacher'
      });
      console.log('Created system user');
    }

    // Get some subjects and questions
    const subjects = await Subject.find().limit(5);
    const questions = await Question.find().limit(10);

    if (subjects.length === 0 || questions.length === 0) {
      console.log('No subjects or questions found. Please run seedSubjects.js and seedQuestions.js first.');
      return;
    }

    // Clear existing tests
    await MockTest.deleteMany({});
    console.log('Cleared existing tests');

    // Create sample tests
    const sampleTests = [
      {
        title: 'Programming Fundamentals Test',
        description: 'A comprehensive test covering basic programming concepts',
        subject: subjects[0]._id,
        questions: questions.slice(0, 5).map(q => q._id),
        durationMinutes: 30,
        totalMarks: 5,
        marksPerQuestion: 1,
        instructions: 'Read each question carefully and select the best answer.',
        createdBy: systemUser._id,
        isActive: true,
        isPublic: true,
        maxAttempts: 3,
        shuffleQuestions: false,
        showResultsImmediately: true
      },
      {
        title: 'Data Structures Quiz',
        description: 'Test your knowledge of data structures and algorithms',
        subject: subjects[1]._id,
        questions: questions.slice(2, 7).map(q => q._id),
        durationMinutes: 45,
        totalMarks: 5,
        marksPerQuestion: 1,
        instructions: 'This test covers various data structures. Good luck!',
        createdBy: systemUser._id,
        isActive: true,
        isPublic: true,
        maxAttempts: 2,
        shuffleQuestions: true,
        showResultsImmediately: true
      },
      {
        title: 'Database Management Test',
        description: 'Comprehensive test on database concepts and SQL',
        subject: subjects[2]._id,
        questions: questions.slice(4, 9).map(q => q._id),
        durationMinutes: 60,
        totalMarks: 5,
        marksPerQuestion: 1,
        instructions: 'Focus on SQL queries and database normalization.',
        createdBy: systemUser._id,
        isActive: true,
        isPublic: true,
        maxAttempts: 1,
        shuffleQuestions: false,
        showResultsImmediately: true
      }
    ];

    // Insert tests
    const insertedTests = await MockTest.insertMany(sampleTests);
    console.log(`Inserted ${insertedTests.length} sample tests`);

    console.log('\nInserted Tests:');
    insertedTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.title}`);
      console.log(`   Subject: ${test.subject}`);
      console.log(`   Questions: ${test.questions.length}`);
      console.log(`   Duration: ${test.durationMinutes} minutes`);
      console.log(`   Max Attempts: ${test.maxAttempts}`);
      console.log('');
    });

    console.log('Test seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding tests:', error);
  } finally {
    console.log('Database connection closed');
    mongoose.connection.close();
  }
};

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedTests();
}

module.exports = { seedTests };