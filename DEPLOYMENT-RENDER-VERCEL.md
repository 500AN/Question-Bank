# 🚀 Split Deployment Guide: Render (Server) + Vercel (Client)

This guide covers deploying your MCQ Test Application with the backend on Render and frontend on Vercel.

## 📋 Prerequisites

- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- MongoDB Atlas account

## 🔧 Part 1: Deploy Server to Render

### 1.1 Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for split deployment: Render + Vercel"
git push origin main
```

### 1.2 Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `mcq-test-server` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### 1.3 Set Environment Variables in Render

In your Render service dashboard, go to "Environment" and add:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mcq-test-app?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

**Important**: Replace the placeholder values with your actual values.

### 1.4 Deploy Server

1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your Render URL: `https://your-app-name.onrender.com`
4. Test the API: Visit `https://your-app-name.onrender.com/health`

## 🎨 Part 2: Deploy Client to Vercel

### 2.1 Update Client Configuration

The client is already configured to use environment variables. You just need to set them in Vercel.

### 2.2 Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Deploy
vercel --prod
```

### 2.3 Set Environment Variables in Vercel

In your Vercel project dashboard, go to "Settings" → "Environment Variables" and add:

```
REACT_APP_API_URL=https://your-render-app-name.onrender.com/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=false
```

**Important**: Replace `your-render-app-name` with your actual Render service name.

### 2.4 Redeploy Client

After setting environment variables, trigger a new deployment:
1. Go to "Deployments" tab in Vercel
2. Click "Redeploy" on the latest deployment

## 🔄 Part 3: Update Cross-References

### 3.1 Update Render Environment Variables

Go back to your Render service and update:

```
CLIENT_URL=https://your-actual-vercel-url.vercel.app
CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
```

### 3.2 Redeploy Render Service

After updating environment variables, Render will automatically redeploy.

## 🧪 Part 4: Testing Your Deployment

### 4.1 Test Server (Render)

Visit these URLs:
- Health check: `https://your-render-app.onrender.com/health`
- API info: `https://your-render-app.onrender.com/`

### 4.2 Test Client (Vercel)

1. Visit your Vercel URL
2. Try to register/login
3. Create a test and verify functionality

### 4.3 Test Integration

1. Open browser developer tools
2. Check Network tab for API calls
3. Verify API calls are going to your Render URL
4. Check for CORS errors

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CLIENT_URL and CORS_ORIGIN in Render
   - Check that URLs match exactly (no trailing slashes)

2. **API Not Found (404)**
   - Verify REACT_APP_API_URL in Vercel
   - Check that Render service is running

3. **Database Connection Issues**
   - Verify MONGODB_URI in Render
   - Check MongoDB Atlas IP whitelist (use 0.0.0.0/0 for all IPs)

4. **Build Failures**
   - Check build logs in respective platforms
   - Verify all dependencies are in package.json

### Render-Specific Issues

- **Cold Starts**: Free tier services sleep after 15 minutes of inactivity
- **Build Timeouts**: Increase build timeout in service settings if needed

### Vercel-Specific Issues

- **Build Errors**: Check build logs and ensure all environment variables are set
- **Function Timeouts**: Vercel has execution time limits on free tier

## 📊 Monitoring

### Render Monitoring

- Check service logs in Render dashboard
- Monitor service health at `/health` endpoint
- Set up uptime monitoring (optional)

### Vercel Monitoring

- Check function logs in Vercel dashboard
- Monitor Core Web Vitals
- Use Vercel Analytics (optional)

## 🔄 Continuous Deployment

Both platforms support automatic deployment:

- **Render**: Auto-deploys on git push to main branch
- **Vercel**: Auto-deploys on git push to main branch

## 📝 Environment Variables Summary

### Render (Server) Environment Variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://your-vercel-app.vercel.app
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### Vercel (Client) Environment Variables:
```
REACT_APP_API_URL=https://your-render-app.onrender.com/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=false
```

## 🎉 Success!

Your MCQ Test Application is now deployed with:
- ✅ Backend API on Render
- ✅ Frontend on Vercel
- ✅ Proper CORS configuration
- ✅ Environment-specific configurations

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review platform-specific documentation
3. Check service logs for error details