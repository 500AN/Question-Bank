@echo off
REM Quick Setup Script for Split Deployment (Windows)
REM This script helps you prepare for Render + Vercel deployment

echo 🚀 MCQ Test App - Split Deployment Setup
echo ========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "client" (
    echo ❌ Client directory not found. Please run from project root.
    pause
    exit /b 1
)

if not exist "server" (
    echo ❌ Server directory not found. Please run from project root.
    pause
    exit /b 1
)

echo.
echo 📋 Pre-deployment Checklist:
echo 1. ✅ MongoDB Atlas database created
echo 2. ✅ GitHub repository created and code pushed
echo 3. ✅ Render account created
echo 4. ✅ Vercel account created
echo.

REM Get user inputs
set /p MONGODB_URI="Enter your MongoDB URI: "
set /p JWT_SECRET="Enter your JWT Secret (min 32 chars): "
set /p RENDER_APP_NAME="Enter your Render app name (will be: https://[name].onrender.com): "
set /p VERCEL_APP_NAME="Enter your Vercel app name (will be: https://[name].vercel.app): "

echo.
echo 🔧 Generating environment variable files...

REM Create Render environment variables file
(
echo # Environment Variables for Render ^(Server Deployment^)
echo # Copy these to your Render Dashboard -^> Environment Variables
echo.
echo MONGODB_URI=%MONGODB_URI%
echo JWT_SECRET=%JWT_SECRET%
echo JWT_EXPIRE=7d
echo NODE_ENV=production
echo PORT=10000
echo CLIENT_URL=https://%VERCEL_APP_NAME%.vercel.app
echo CORS_ORIGIN=https://%VERCEL_APP_NAME%.vercel.app
) > .env.render.production

REM Create Vercel environment variables file
(
echo # Environment Variables for Vercel ^(Client Deployment^)
echo # Copy these to your Vercel Dashboard -^> Settings -^> Environment Variables
echo.
echo REACT_APP_API_URL=https://%RENDER_APP_NAME%.onrender.com/api
echo NODE_ENV=production
echo GENERATE_SOURCEMAP=false
echo CI=false
) > .env.vercel.production

echo ✅ Created .env.render.production
echo ✅ Created .env.vercel.production
echo.

echo 📝 Next Steps:
echo 1. Push your code to GitHub if not already done
echo 2. Deploy server to Render:
echo    - Use 'server' as root directory
echo    - Copy environment variables from .env.render.production
echo 3. Deploy client to Vercel:
echo    - Use 'client' as root directory
echo    - Copy environment variables from .env.vercel.production
echo 4. Test both deployments
echo.

echo 🔗 Useful URLs:
echo Render Dashboard: https://dashboard.render.com/
echo Vercel Dashboard: https://vercel.com/dashboard
echo Your API will be: https://%RENDER_APP_NAME%.onrender.com
echo Your App will be: https://%VERCEL_APP_NAME%.vercel.app
echo.

echo 📖 For detailed instructions, see: DEPLOYMENT-RENDER-VERCEL.md
echo.
pause