#!/bin/bash

# MCQ Test Application - Quick Setup Script

echo "🚀 Setting up MCQ Test Application for deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "🔧 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "⚛️ Installing client dependencies..."
cd client && npm install && cd ..

# Build client for production
echo "🏗️ Building client for production..."
cd client && npm run build && cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create a GitHub repository"
echo "2. Add your files: git add ."
echo "3. Commit: git commit -m 'Initial commit'"
echo "4. Add remote: git remote add origin YOUR_GITHUB_URL"
echo "5. Push: git push -u origin main"
echo "6. Deploy to Vercel using the GitHub integration"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"