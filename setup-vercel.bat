@echo off

echo 🚀 Setting up Vercel deployment...

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

REM Install dependencies
echo 📦 Installing dependencies...
npm run install-all

REM Build the client
echo 🔨 Building client...
npm run build

echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Set up your environment variables in Vercel dashboard:
echo    - MONGODB_URI
echo    - JWT_SECRET
echo    - NODE_ENV=production
echo.
echo 2. Deploy to Vercel:
echo    vercel
echo.
echo 3. Or connect your GitHub repo to Vercel for automatic deployments
echo.
echo 📖 See DEPLOYMENT-VERCEL-FULLSTACK.md for detailed instructions

pause