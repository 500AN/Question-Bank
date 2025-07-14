@echo off
echo 🔍 Vercel Deployment Validation
echo ================================

echo 1. Checking project structure...

if exist "vercel.json" (
    echo ✅ vercel.json exists
) else (
    echo ⚠️  vercel.json not found - will use dashboard settings
)

if exist "server\server.js" (
    echo ✅ Server entry point exists
) else (
    echo ❌ server\server.js not found
    exit /b 1
)

if exist "client\package.json" (
    echo ✅ Client package.json exists
) else (
    echo ❌ client\package.json not found
    exit /b 1
)

echo.
echo 2. Checking environment variables...

if exist ".env.vercel.example" (
    echo ✅ Environment variable template exists
    echo    Required variables:
    echo    - MONGODB_URI
    echo    - JWT_SECRET
    echo    - NODE_ENV
) else (
    echo ⚠️  No environment variable template found
)

echo.
echo 3. Checking dependencies...

cd server
npm list --depth=0 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server dependencies are installed
) else (
    echo ❌ Server dependencies missing - run 'cd server && npm install'
)
cd ..

cd client
npm list --depth=0 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Client dependencies are installed
) else (
    echo ❌ Client dependencies missing - run 'cd client && npm install'
)
cd ..

echo.
echo 4. Checking build configuration...

findstr "build:vercel" client\package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Vercel build script exists
) else (
    echo ⚠️  No Vercel-specific build script found
)

findstr "vercel-build" package.json >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Root build script exists
) else (
    echo ⚠️  No root build script found
)

echo.
echo 5. Testing build process...

echo Building client...
cd client
npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Client builds successfully
    
    if exist "build" (
        echo ✅ Build directory created
        
        if exist "build\index.html" (
            echo ✅ Build output contains index.html
        ) else (
            echo ❌ Build output missing index.html
        )
    ) else (
        echo ❌ Build directory not created
    )
) else (
    echo ❌ Client build failed
    echo Run 'cd client && npm run build' to see detailed errors
)
cd ..

echo.
echo 6. Checking server configuration...

findstr "module.exports.*app" server\server.js >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server exports app for Vercel
) else (
    echo ⚠️  Server may not be configured for Vercel deployment
)

findstr "cors" server\server.js >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ CORS is configured
) else (
    echo ❌ CORS configuration missing
)

echo.
echo 7. Checking API routes...

if exist "api" (
    echo ✅ API directory exists for Vercel functions
    
    if exist "api\[...path].js" (
        echo ✅ Catch-all API route exists
    ) else (
        echo ⚠️  No catch-all API route found
    )
) else (
    echo ⚠️  No API directory found - using builds configuration
)

echo.
echo 8. Final recommendations...

echo Before deploying:
echo • Set environment variables in Vercel dashboard
echo • Test locally with 'npm run dev'
echo • Ensure MongoDB connection is working
echo • Check that all API endpoints return proper responses

echo.
echo Deploy commands:
echo • Preview: vercel
echo • Production: vercel --prod

echo.
echo 🚀 Validation complete!

pause