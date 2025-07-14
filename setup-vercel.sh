#!/bin/bash

echo "🚀 Setting up Vercel deployment..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Build the client
echo "🔨 Building client..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - NODE_ENV=production"
echo ""
echo "2. Deploy to Vercel:"
echo "   vercel"
echo ""
echo "3. Or connect your GitHub repo to Vercel for automatic deployments"
echo ""
echo "📖 See DEPLOYMENT-VERCEL-FULLSTACK.md for detailed instructions"