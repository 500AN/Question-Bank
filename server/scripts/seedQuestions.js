const mongoose = require('mongoose');
const Question = require('../models/Question');
const { Subject, Topic } = require('../models/Subject');
const User = require('../models/User');
require('dotenv').config();

// Sample questions for MG University MCA subjects
const sampleQuestions = [
  // Programming in C questions
  {
    subjectName: "Programming in C",
    topicName: "Data Types and Variables",
    questionText: "Which of the following is NOT a valid data type in C?",
    options: [
      { text: "int", label: "A" },
      { text: "float", label: "B" },
      { text: "string", label: "C" },
      { text: "char", label: "D" }
    ],
    correctOption: "C",
    difficultyLevel: "easy",
    explanation: "C does not have a built-in 'string' data type. Strings are represented as arrays of characters."
  },
  {
    subjectName: "Programming in C",
    topicName: "Pointers",
    questionText: "What does the following C code print?\nint x = 10;\nint *p = &x;\nprintf(\"%d\", *p);",
    options: [
      { text: "10", label: "A" },
      { text: "Address of x", label: "B" },
      { text: "Garbage value", label: "C" },
      { text: "Compilation error", label: "D" }
    ],
    correctOption: "A",
    difficultyLevel: "medium",
    explanation: "*p dereferences the pointer p, which points to x, so it prints the value of x which is 10."
  },
  
  // Data Structures questions
  {
    subjectName: "Data Structures",
    topicName: "Stacks",
    questionText: "Which of the following operations is NOT typically associated with a stack?",
    options: [
      { text: "Push", label: "A" },
      { text: "Pop", label: "B" },
      { text: "Peek", label: "C" },
      { text: "Dequeue", label: "D" }
    ],
    correctOption: "D",
    difficultyLevel: "easy",
    explanation: "Dequeue is an operation associated with queues, not stacks. Stacks use push, pop, and peek operations."
  },
  {
    subjectName: "Data Structures",
    topicName: "Binary Search Trees",
    questionText: "What is the time complexity of searching in a balanced binary search tree?",
    options: [
      { text: "O(1)", label: "A" },
      { text: "O(log n)", label: "B" },
      { text: "O(n)", label: "C" },
      { text: "O(n log n)", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "medium",
    explanation: "In a balanced BST, the height is log n, so searching takes O(log n) time."
  },
  
  // Database Management Systems questions
  {
    subjectName: "Database Management Systems",
    topicName: "SQL Fundamentals",
    questionText: "Which SQL command is used to retrieve data from a database?",
    options: [
      { text: "INSERT", label: "A" },
      { text: "UPDATE", label: "B" },
      { text: "SELECT", label: "C" },
      { text: "DELETE", label: "D" }
    ],
    correctOption: "C",
    difficultyLevel: "easy",
    explanation: "SELECT is the SQL command used to retrieve or query data from one or more tables in a database."
  },
  {
    subjectName: "Database Management Systems",
    topicName: "Normalization",
    questionText: "Which normal form eliminates transitive dependencies?",
    options: [
      { text: "1NF", label: "A" },
      { text: "2NF", label: "B" },
      { text: "3NF", label: "C" },
      { text: "BCNF", label: "D" }
    ],
    correctOption: "C",
    difficultyLevel: "medium",
    explanation: "Third Normal Form (3NF) eliminates transitive dependencies where non-key attributes depend on other non-key attributes."
  },
  
  // Operating Systems questions
  {
    subjectName: "Operating Systems",
    topicName: "Process Management",
    questionText: "What is a process in an operating system?",
    options: [
      { text: "A program in execution", label: "A" },
      { text: "A program stored on disk", label: "B" },
      { text: "A system call", label: "C" },
      { text: "A memory location", label: "D" }
    ],
    correctOption: "A",
    difficultyLevel: "easy",
    explanation: "A process is a program in execution, including the program code, current activity, and allocated resources."
  },
  {
    subjectName: "Operating Systems",
    topicName: "CPU Scheduling",
    questionText: "Which scheduling algorithm can cause starvation?",
    options: [
      { text: "FCFS", label: "A" },
      { text: "Round Robin", label: "B" },
      { text: "Priority Scheduling", label: "C" },
      { text: "SJF", label: "D" }
    ],
    correctOption: "C",
    difficultyLevel: "medium",
    explanation: "Priority scheduling can cause starvation when high-priority processes continuously arrive, preventing low-priority processes from executing."
  },
  
  // Computer Networks questions
  {
    subjectName: "Computer Networks",
    topicName: "OSI Reference Model",
    questionText: "How many layers are there in the OSI model?",
    options: [
      { text: "5", label: "A" },
      { text: "6", label: "B" },
      { text: "7", label: "C" },
      { text: "8", label: "D" }
    ],
    correctOption: "C",
    difficultyLevel: "easy",
    explanation: "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application."
  },
  {
    subjectName: "Computer Networks",
    topicName: "TCP/IP Protocol Suite",
    questionText: "Which protocol is used for reliable data transmission?",
    options: [
      { text: "UDP", label: "A" },
      { text: "TCP", label: "B" },
      { text: "IP", label: "C" },
      { text: "HTTP", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "easy",
    explanation: "TCP (Transmission Control Protocol) provides reliable, ordered, and error-checked delivery of data."
  },
  
  // Java Programming questions
  {
    subjectName: "Java Programming",
    topicName: "OOP in Java",
    questionText: "Which of the following is NOT a pillar of Object-Oriented Programming?",
    options: [
      { text: "Encapsulation", label: "A" },
      { text: "Inheritance", label: "B" },
      { text: "Polymorphism", label: "C" },
      { text: "Compilation", label: "D" }
    ],
    correctOption: "D",
    difficultyLevel: "easy",
    explanation: "The four pillars of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction. Compilation is not a pillar of OOP."
  },
  {
    subjectName: "Java Programming",
    topicName: "Exception Handling",
    questionText: "Which keyword is used to manually throw an exception in Java?",
    options: [
      { text: "throws", label: "A" },
      { text: "throw", label: "B" },
      { text: "try", label: "C" },
      { text: "catch", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "medium",
    explanation: "The 'throw' keyword is used to manually throw an exception, while 'throws' is used in method declarations."
  },
  
  // Web Programming questions
  {
    subjectName: "Web Programming",
    topicName: "HTML Fundamentals",
    questionText: "Which HTML tag is used to create a hyperlink?",
    options: [
      { text: "<link>", label: "A" },
      { text: "<a>", label: "B" },
      { text: "<href>", label: "C" },
      { text: "<url>", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "easy",
    explanation: "The <a> (anchor) tag is used to create hyperlinks in HTML, with the href attribute specifying the destination."
  },
  {
    subjectName: "Web Programming",
    topicName: "JavaScript Programming",
    questionText: "Which method is used to add an element to the end of an array in JavaScript?",
    options: [
      { text: "append()", label: "A" },
      { text: "push()", label: "B" },
      { text: "add()", label: "C" },
      { text: "insert()", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "easy",
    explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array."
  },
  
  // Artificial Intelligence questions
  {
    subjectName: "Artificial Intelligence",
    topicName: "Introduction to AI",
    questionText: "Who is considered the father of Artificial Intelligence?",
    options: [
      { text: "Alan Turing", label: "A" },
      { text: "John McCarthy", label: "B" },
      { text: "Marvin Minsky", label: "C" },
      { text: "Herbert Simon", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "medium",
    explanation: "John McCarthy coined the term 'Artificial Intelligence' and is considered the father of AI."
  },
  {
    subjectName: "Artificial Intelligence",
    topicName: "Machine Learning Basics",
    questionText: "Which type of learning uses labeled training data?",
    options: [
      { text: "Unsupervised Learning", label: "A" },
      { text: "Supervised Learning", label: "B" },
      { text: "Reinforcement Learning", label: "C" },
      { text: "Deep Learning", label: "D" }
    ],
    correctOption: "B",
    difficultyLevel: "easy",
    explanation: "Supervised learning uses labeled training data to learn a mapping from inputs to outputs."
  }
];

async function seedQuestions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or find system user
    let systemUser = await User.findOne({ email: 'system@mgquiz.com' });
    if (!systemUser) {
      systemUser = await User.create({
        name: 'System',
        email: 'system@mgquiz.com',
        password: 'systempassword123',
        role: 'teacher'
      });
      console.log('Created system user');
    }

    // Get all subjects
    const subjects = await Subject.find({});
    const subjectMap = {};
    subjects.forEach(subject => {
      subjectMap[subject.name] = subject._id;
    });

    // Create topics for each subject-topic combination in questions
    const topicMap = {};
    for (const question of sampleQuestions) {
      const subjectId = subjectMap[question.subjectName];
      if (subjectId) {
        const topicKey = `${question.subjectName}-${question.topicName}`;
        if (!topicMap[topicKey]) {
          let topic = await Topic.findOne({ 
            name: question.topicName, 
            subject: subjectId 
          });
          
          if (!topic) {
            topic = await Topic.create({
              name: question.topicName,
              subject: subjectId,
              createdBy: systemUser._id
            });
            console.log(`Created topic: ${question.topicName} for ${question.subjectName}`);
          }
          
          topicMap[topicKey] = topic._id;
        }
      }
    }

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Prepare questions with subject and topic IDs
    const questionsToInsert = sampleQuestions.map(q => {
      const subjectId = subjectMap[q.subjectName];
      const topicId = topicMap[`${q.subjectName}-${q.topicName}`];
      
      if (subjectId && topicId) {
        return {
          questionText: q.questionText,
          options: q.options,
          correctOption: q.correctOption,
          explanation: q.explanation,
          subject: subjectId,
          topic: topicId,
          difficultyLevel: q.difficultyLevel,
          createdBy: systemUser._id
        };
      }
      return null;
    }).filter(q => q !== null);

    // Insert sample questions
    const insertedQuestions = await Question.insertMany(questionsToInsert);
    console.log(`Inserted ${insertedQuestions.length} sample questions`);

    // Display inserted questions by subject
    const questionsBySubject = {};
    for (const question of insertedQuestions) {
      const subject = await Subject.findById(question.subject);
      const subjectName = subject.name;
      
      if (!questionsBySubject[subjectName]) {
        questionsBySubject[subjectName] = [];
      }
      questionsBySubject[subjectName].push(question);
    }

    console.log('\nInserted Questions by Subject:');
    Object.keys(questionsBySubject).forEach(subjectName => {
      console.log(`\n${subjectName}: ${questionsBySubject[subjectName].length} questions`);
      questionsBySubject[subjectName].forEach((question, index) => {
        console.log(`  ${index + 1}. ${question.questionText.substring(0, 60)}...`);
      });
    });

    console.log('\nQuestion seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding questions:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedQuestions();
}

module.exports = { seedQuestions, sampleQuestions };