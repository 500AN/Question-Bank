#!/bin/bash

echo "🔍 Vercel Deployment Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Validation checks
echo "1. Checking project structure..."

if [ -f "vercel.json" ]; then
    check_pass "vercel.json exists"
else
    check_warn "vercel.json not found - will use dashboard settings"
fi

if [ -f "server/server.js" ]; then
    check_pass "Server entry point exists"
else
    check_fail "server/server.js not found"
    exit 1
fi

if [ -f "client/package.json" ]; then
    check_pass "Client package.json exists"
else
    check_fail "client/package.json not found"
    exit 1
fi

echo ""
echo "2. Checking environment variables..."

if [ -f ".env.vercel.example" ]; then
    check_pass "Environment variable template exists"
    echo "   Required variables:"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
    echo "   - NODE_ENV"
else
    check_warn "No environment variable template found"
fi

echo ""
echo "3. Checking dependencies..."

cd server
if npm list --depth=0 > /dev/null 2>&1; then
    check_pass "Server dependencies are installed"
else
    check_fail "Server dependencies missing - run 'cd server && npm install'"
fi
cd ..

cd client
if npm list --depth=0 > /dev/null 2>&1; then
    check_pass "Client dependencies are installed"
else
    check_fail "Client dependencies missing - run 'cd client && npm install'"
fi
cd ..

echo ""
echo "4. Checking build configuration..."

if grep -q "build:vercel" client/package.json; then
    check_pass "Vercel build script exists"
else
    check_warn "No Vercel-specific build script found"
fi

if grep -q "vercel-build" package.json; then
    check_pass "Root build script exists"
else
    check_warn "No root build script found"
fi

echo ""
echo "5. Testing build process..."

echo "Building client..."
cd client
if npm run build > /dev/null 2>&1; then
    check_pass "Client builds successfully"
    
    if [ -d "build" ]; then
        check_pass "Build directory created"
        
        if [ -f "build/index.html" ]; then
            check_pass "Build output contains index.html"
        else
            check_fail "Build output missing index.html"
        fi
    else
        check_fail "Build directory not created"
    fi
else
    check_fail "Client build failed"
    echo "Run 'cd client && npm run build' to see detailed errors"
fi
cd ..

echo ""
echo "6. Checking server configuration..."

if grep -q "module.exports.*app" server/server.js; then
    check_pass "Server exports app for Vercel"
else
    check_warn "Server may not be configured for Vercel deployment"
fi

if grep -q "cors" server/server.js; then
    check_pass "CORS is configured"
else
    check_fail "CORS configuration missing"
fi

echo ""
echo "7. Checking API routes..."

if [ -d "api" ]; then
    check_pass "API directory exists for Vercel functions"
    
    if [ -f "api/[...path].js" ]; then
        check_pass "Catch-all API route exists"
    else
        check_warn "No catch-all API route found"
    fi
else
    check_warn "No API directory found - using builds configuration"
fi

echo ""
echo "8. Final recommendations..."

echo "Before deploying:"
echo "• Set environment variables in Vercel dashboard"
echo "• Test locally with 'npm run dev'"
echo "• Ensure MongoDB connection is working"
echo "• Check that all API endpoints return proper responses"

echo ""
echo "Deploy commands:"
echo "• Preview: vercel"
echo "• Production: vercel --prod"

echo ""
echo "🚀 Validation complete!"