const mongoose = require('mongoose');
const { Subject } = require('../models/Subject');
require('dotenv').config();

// MG University MCA Syllabus Subjects
const mgUniversityMCASubjects = [
  {
    name: "Programming in C",
    code: "MCA101",
    description: "Fundamentals of C programming language including data types, control structures, functions, arrays, pointers, and file handling.",
    topics: [
      "Introduction to C Programming",
      "Data Types and Variables",
      "Operators and Expressions",
      "Control Structures",
      "Functions",
      "Arrays and Strings",
      "Pointers",
      "Structures and Unions",
      "File Handling",
      "Dynamic Memory Allocation"
    ]
  },
  {
    name: "Computer Fundamentals and Office Automation",
    code: "MCA102",
    description: "Basic computer concepts, hardware, software, and office automation tools.",
    topics: [
      "Computer System Architecture",
      "Input/Output Devices",
      "Memory Systems",
      "Operating Systems Basics",
      "MS Office Suite",
      "Word Processing",
      "Spreadsheet Applications",
      "Presentation Software",
      "Database Basics",
      "Internet and Email"
    ]
  },
  {
    name: "Discrete Mathematics",
    code: "MCA103",
    description: "Mathematical foundations for computer science including logic, sets, relations, functions, and graph theory.",
    topics: [
      "Mathematical Logic",
      "Set Theory",
      "Relations and Functions",
      "Combinatorics",
      "Graph Theory",
      "Trees",
      "Boolean Algebra",
      "Number Theory",
      "Recurrence Relations",
      "Probability Theory"
    ]
  },
  {
    name: "Digital Electronics",
    code: "MCA104",
    description: "Digital logic design, Boolean algebra, combinational and sequential circuits.",
    topics: [
      "Number Systems",
      "Boolean Algebra",
      "Logic Gates",
      "Combinational Circuits",
      "Sequential Circuits",
      "Flip-Flops",
      "Counters",
      "Registers",
      "Memory Devices",
      "A/D and D/A Converters"
    ]
  },
  {
    name: "Data Structures",
    code: "MCA201",
    description: "Linear and non-linear data structures, algorithms for searching and sorting.",
    topics: [
      "Introduction to Data Structures",
      "Arrays",
      "Linked Lists",
      "Stacks",
      "Queues",
      "Trees",
      "Binary Search Trees",
      "Graphs",
      "Hashing",
      "Sorting Algorithms",
      "Searching Algorithms"
    ]
  },
  {
    name: "Object Oriented Programming using C++",
    code: "MCA202",
    description: "Object-oriented programming concepts using C++ including classes, objects, inheritance, and polymorphism.",
    topics: [
      "Introduction to OOP",
      "Classes and Objects",
      "Constructors and Destructors",
      "Operator Overloading",
      "Inheritance",
      "Polymorphism",
      "Virtual Functions",
      "Templates",
      "Exception Handling",
      "File I/O in C++",
      "STL Basics"
    ]
  },
  {
    name: "Computer Organization and Architecture",
    code: "MCA203",
    description: "Computer system organization, processor design, memory hierarchy, and I/O systems.",
    topics: [
      "Computer System Overview",
      "Instruction Set Architecture",
      "CPU Design",
      "Control Unit Design",
      "Memory Hierarchy",
      "Cache Memory",
      "Virtual Memory",
      "I/O Systems",
      "Interrupt Handling",
      "Pipeline Processing"
    ]
  },
  {
    name: "Database Management Systems",
    code: "MCA204",
    description: "Database concepts, relational model, SQL, normalization, and transaction management.",
    topics: [
      "Introduction to DBMS",
      "Database Models",
      "Relational Model",
      "SQL Fundamentals",
      "Advanced SQL",
      "Normalization",
      "Transaction Management",
      "Concurrency Control",
      "Database Security",
      "Backup and Recovery"
    ]
  },
  {
    name: "Operating Systems",
    code: "MCA301",
    description: "Operating system concepts including process management, memory management, and file systems.",
    topics: [
      "Introduction to OS",
      "Process Management",
      "CPU Scheduling",
      "Process Synchronization",
      "Deadlocks",
      "Memory Management",
      "Virtual Memory",
      "File Systems",
      "I/O Management",
      "Security and Protection"
    ]
  },
  {
    name: "Software Engineering",
    code: "MCA302",
    description: "Software development life cycle, project management, and software quality assurance.",
    topics: [
      "Software Engineering Fundamentals",
      "SDLC Models",
      "Requirements Engineering",
      "System Design",
      "Software Architecture",
      "Coding Standards",
      "Testing Methodologies",
      "Project Management",
      "Software Quality Assurance",
      "Software Maintenance"
    ]
  },
  {
    name: "Computer Networks",
    code: "MCA303",
    description: "Network protocols, OSI model, TCP/IP, and network security.",
    topics: [
      "Introduction to Networks",
      "OSI Reference Model",
      "TCP/IP Protocol Suite",
      "Data Link Layer",
      "Network Layer",
      "Transport Layer",
      "Application Layer",
      "Network Security",
      "Wireless Networks",
      "Network Management"
    ]
  },
  {
    name: "Web Programming",
    code: "MCA304",
    description: "Web technologies including HTML, CSS, JavaScript, and server-side programming.",
    topics: [
      "HTML Fundamentals",
      "CSS Styling",
      "JavaScript Programming",
      "DOM Manipulation",
      "AJAX and JSON",
      "Server-side Programming",
      "PHP Basics",
      "MySQL Integration",
      "Web Security",
      "Responsive Web Design"
    ]
  },
  {
    name: "Java Programming",
    code: "MCA305",
    description: "Java programming language including OOP concepts, GUI development, and web applications.",
    topics: [
      "Introduction to Java",
      "Java Syntax and Basics",
      "OOP in Java",
      "Exception Handling",
      "Multithreading",
      "Collections Framework",
      "GUI Programming with Swing",
      "JDBC",
      "Servlets",
      "JSP"
    ]
  },
  {
    name: "Design and Analysis of Algorithms",
    code: "MCA401",
    description: "Algorithm design techniques, complexity analysis, and advanced algorithms.",
    topics: [
      "Algorithm Analysis",
      "Asymptotic Notation",
      "Divide and Conquer",
      "Greedy Algorithms",
      "Dynamic Programming",
      "Backtracking",
      "Branch and Bound",
      "Graph Algorithms",
      "String Algorithms",
      "NP-Completeness"
    ]
  },
  {
    name: "Compiler Design",
    code: "MCA402",
    description: "Compiler construction including lexical analysis, parsing, and code generation.",
    topics: [
      "Introduction to Compilers",
      "Lexical Analysis",
      "Syntax Analysis",
      "Top-down Parsing",
      "Bottom-up Parsing",
      "Semantic Analysis",
      "Intermediate Code Generation",
      "Code Optimization",
      "Code Generation",
      "Error Handling"
    ]
  },
  {
    name: "Artificial Intelligence",
    code: "MCA403",
    description: "AI concepts including search algorithms, knowledge representation, and machine learning basics.",
    topics: [
      "Introduction to AI",
      "Problem Solving and Search",
      "Informed Search",
      "Game Playing",
      "Knowledge Representation",
      "Expert Systems",
      "Machine Learning Basics",
      "Neural Networks",
      "Natural Language Processing",
      "AI Applications"
    ]
  },
  {
    name: "Mobile Application Development",
    code: "MCA404",
    description: "Mobile app development for Android and iOS platforms.",
    topics: [
      "Mobile Development Overview",
      "Android Development",
      "Android Studio",
      "Activities and Intents",
      "User Interface Design",
      "Data Storage",
      "Networking",
      "Location Services",
      "Publishing Apps",
      "Cross-platform Development"
    ]
  },
  {
    name: "Cloud Computing",
    code: "MCA405",
    description: "Cloud computing concepts, services, and deployment models.",
    topics: [
      "Introduction to Cloud Computing",
      "Cloud Service Models",
      "Cloud Deployment Models",
      "Virtualization",
      "Amazon Web Services",
      "Microsoft Azure",
      "Google Cloud Platform",
      "Cloud Security",
      "Cloud Storage",
      "DevOps and Cloud"
    ]
  },
  {
    name: "Data Mining and Warehousing",
    code: "MCA406",
    description: "Data mining techniques, data warehousing concepts, and business intelligence.",
    topics: [
      "Introduction to Data Mining",
      "Data Preprocessing",
      "Classification Algorithms",
      "Clustering Techniques",
      "Association Rules",
      "Data Warehousing Concepts",
      "OLAP",
      "ETL Processes",
      "Business Intelligence",
      "Big Data Analytics"
    ]
  },
  {
    name: "Information Security",
    code: "MCA407",
    description: "Cybersecurity concepts, cryptography, and security protocols.",
    topics: [
      "Information Security Fundamentals",
      "Cryptography Basics",
      "Symmetric Encryption",
      "Asymmetric Encryption",
      "Digital Signatures",
      "Network Security",
      "Web Security",
      "Malware and Threats",
      "Security Policies",
      "Ethical Hacking"
    ]
  },
  {
    name: "Machine Learning",
    code: "MCA408",
    description: "Machine learning algorithms, supervised and unsupervised learning, and deep learning basics.",
    topics: [
      "Introduction to Machine Learning",
      "Supervised Learning",
      "Unsupervised Learning",
      "Linear Regression",
      "Logistic Regression",
      "Decision Trees",
      "Support Vector Machines",
      "Neural Networks",
      "Deep Learning Basics",
      "Model Evaluation"
    ]
  },
  {
    name: "Project Management",
    code: "MCA409",
    description: "Project management methodologies, planning, and execution in IT projects.",
    topics: [
      "Project Management Fundamentals",
      "Project Life Cycle",
      "Project Planning",
      "Risk Management",
      "Quality Management",
      "Team Management",
      "Agile Methodologies",
      "Scrum Framework",
      "Project Monitoring",
      "Project Closure"
    ]
  }
];

async function seedSubjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing subjects
    await Subject.deleteMany({});
    console.log('Cleared existing subjects');

    // Insert MG University MCA subjects
    const insertedSubjects = await Subject.insertMany(mgUniversityMCASubjects);
    console.log(`Inserted ${insertedSubjects.length} subjects from MG University MCA syllabus`);

    // Display inserted subjects
    console.log('\nInserted Subjects:');
    insertedSubjects.forEach((subject, index) => {
      console.log(`${index + 1}. ${subject.name} (${subject.code})`);
      console.log(`   Topics: ${subject.topics.length} topics`);
    });

    console.log('\nSubject seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding subjects:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedSubjects();
}

module.exports = { seedSubjects, mgUniversityMCASubjects };