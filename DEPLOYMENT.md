# 🚀 Deployment Guide for MCQ Test Application

## Step-by-Step GitHub and Vercel Deployment

### 1. Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: MCQ Test Application with All Subjects and Semester fixes"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `mcq-test-application` (or your preferred name)
3. Don't initialize with README (we already have one)
4. Copy the repository URL

### 3. Connect Local Repository to GitHub

```bash
# Add remote origin (replace with your GitHub repo URL)
git remote add origin https://github.com/yourusername/mcq-test-application.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 5. Environment Variables in Vercel

Add these environment variables in Vercel Dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mcq-test-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://your-app-name.vercel.app
```

### 6. Update API Base URL

After deployment, update the API base URL in the client:

**File: `client/src/services/api.js`**
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.vercel.app/api'
  : 'http://localhost:5000/api';
```

### 7. MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create a cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for Vercel)
5. Get connection string
6. Add to Vercel environment variables

### 8. Final Steps

1. **Test the deployment**: Visit your Vercel URL
2. **Check API endpoints**: Visit `your-app.vercel.app/api/health`
3. **Test functionality**: Create account, login, create tests

## 🔧 Troubleshooting

### Common Issues:

1. **Build Fails**: Check if all dependencies are in package.json
2. **API Not Working**: Verify environment variables in Vercel
3. **Database Connection**: Check MongoDB Atlas IP whitelist
4. **CORS Errors**: Ensure CLIENT_URL is set correctly

### Debug Commands:

```bash
# Check build locally
npm run build

# Test production build locally
cd client && npm run build && serve -s build

# Check server locally
cd server && npm start
```

## 📱 Features Included

✅ All Subjects test creation
✅ Semester restriction fixes
✅ JWT Authentication
✅ Role-based access (Teacher/Student)
✅ Question management
✅ Test creation and taking
✅ Results and analytics
✅ Responsive design

## 🎯 Next Steps After Deployment

1. Test all functionality
2. Add custom domain (optional)
3. Set up monitoring
4. Configure analytics
5. Add SSL certificate (automatic with Vercel)

---

**Your app will be live at**: `https://your-app-name.vercel.app`