#!/bin/bash

# Quick Setup Script for Split Deployment
# This script helps you prepare for Render + Vercel deployment

echo "🚀 MCQ Test App - Split Deployment Setup"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "client" ] || [ ! -d "server" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "1. ✅ MongoDB Atlas database created"
echo "2. ✅ GitHub repository created and code pushed"
echo "3. ✅ Render account created"
echo "4. ✅ Vercel account created"
echo ""

# Get user inputs
read -p "Enter your MongoDB URI: " MONGODB_URI
read -p "Enter your JWT Secret (min 32 chars): " JWT_SECRET
read -p "Enter your Render app name (will be: https://[name].onrender.com): " RENDER_APP_NAME
read -p "Enter your Vercel app name (will be: https://[name].vercel.app): " VERCEL_APP_NAME

echo ""
echo "🔧 Generating environment variable files..."

# Create Render environment variables file
cat > .env.render.production << EOF
# Environment Variables for Render (Server Deployment)
# Copy these to your Render Dashboard -> Environment Variables

MONGODB_URI=${MONGODB_URI}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d
NODE_ENV=production
PORT=10000
CLIENT_URL=https://${VERCEL_APP_NAME}.vercel.app
CORS_ORIGIN=https://${VERCEL_APP_NAME}.vercel.app
EOF

# Create Vercel environment variables file
cat > .env.vercel.production << EOF
# Environment Variables for Vercel (Client Deployment)
# Copy these to your Vercel Dashboard -> Settings -> Environment Variables

REACT_APP_API_URL=https://${RENDER_APP_NAME}.onrender.com/api
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=false
EOF

echo "✅ Created .env.render.production"
echo "✅ Created .env.vercel.production"
echo ""

echo "📝 Next Steps:"
echo "1. Push your code to GitHub if not already done"
echo "2. Deploy server to Render:"
echo "   - Use 'server' as root directory"
echo "   - Copy environment variables from .env.render.production"
echo "3. Deploy client to Vercel:"
echo "   - Use 'client' as root directory"
echo "   - Copy environment variables from .env.vercel.production"
echo "4. Test both deployments"
echo ""

echo "🔗 Useful URLs:"
echo "Render Dashboard: https://dashboard.render.com/"
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo "Your API will be: https://${RENDER_APP_NAME}.onrender.com"
echo "Your App will be: https://${VERCEL_APP_NAME}.vercel.app"
echo ""

echo "📖 For detailed instructions, see: DEPLOYMENT-RENDER-VERCEL.md"