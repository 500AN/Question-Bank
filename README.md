# MCQ Test Application - Deployment Guide

## 🚀 Live Demo
- **Frontend**: [Your Vercel App URL]
- **API**: [Your Vercel App URL]/api

## 📋 Environment Variables Required

### For Vercel Deployment:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
```

## 🛠️ Local Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mcq-test-app.git
   cd mcq-test-app
   ```



   

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   - Create `server/.env` file with your environment variables
   - Update MongoDB URI and JWT secret

5. **Run the application**
   
   **Development mode:**
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev
   
   # Terminal 2 - Start client
   cd client
   npm start
   ```

   **Production mode:**
   ```bash
   # Build client
   cd client
   npm run build
   
   # Start server
   cd ../server
   npm start
   ```

## 🌐 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Manual Deployment Steps

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

## 📁 Project Structure

```
mcq-test-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── services/
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── vercel.json            # Vercel configuration
└── README.md
```

## 🔧 Features

- **Authentication**: JWT-based login/signup
- **Role Management**: Teacher and Student roles
- **Question Management**: Create, edit, delete MCQ questions
- **Test Creation**: Create tests with various settings
- **Test Taking**: Timed tests with auto-save
- **Results & Analytics**: Performance tracking and improvement analysis
- **Responsive Design**: Works on all devices

## 🛡️ Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation
- CORS protection
- Role-based access control

## 📊 Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- React Router
- React Hook Form
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.