# Deploying to Vercel - Multiple Approaches

This guide provides different approaches to deploy your full-stack application to Vercel without CORS issues.

## Approach 1: Simplified Configuration (Recommended)

### Step 1: Update vercel.json

Use this simplified configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/uploads/(.*)",
      "dest": "/server/server.js"
    },
    {
      "src": "/health",
      "dest": "/server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ]
}
```

### Step 2: Deploy
```bash
vercel --prod
```

## Approach 2: Using Project Settings (No vercel.json)

If you prefer to use Vercel's dashboard settings instead of vercel.json:

### Step 1: Remove or rename vercel.json
```bash
mv vercel.json vercel.json.backup
```

### Step 2: Configure in Vercel Dashboard
1. Go to your project settings in Vercel dashboard
2. Set **Framework Preset**: Other
3. Set **Root Directory**: Leave empty (uses root)
4. Set **Build Command**: `npm run vercel-build`
5. Set **Output Directory**: `client/build`
6. Set **Install Command**: `npm run install-all`

### Step 3: Create API routes using Vercel's file-based routing
Create `api/` folder in root and move server endpoints there.

## Approach 3: Separate Client and Server Deployments

### Deploy Server to Vercel
1. Create a new Vercel project for server only
2. Set root directory to `server`
3. Deploy server to get URL like `https://your-server.vercel.app`

### Deploy Client to Vercel
1. Create another Vercel project for client only
2. Set root directory to `client`
3. Set environment variable: `REACT_APP_API_URL=https://your-server.vercel.app/api`
4. Update server CORS to allow client domain

## Current Setup Instructions

Based on your current configuration, here's what to do:

### 1. Environment Variables
Set these in your Vercel dashboard:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=false
```

### 2. Deploy Commands

For production deployment:
```bash
vercel --prod
```

For preview deployment:
```bash
vercel
```

### 3. Troubleshooting Build Issues

If you encounter build issues, try these solutions:

#### Option A: Use the current setup
```bash
# Make sure dependencies are installed
npm run install-all

# Build client
npm run build

# Deploy
vercel --prod
```

#### Option B: Simplify the build process
Update your root `package.json`:

```json
{
  "scripts": {
    "build": "cd client && npm install && npm run build",
    "start": "node server/server.js"
  }
}
```

Then in Vercel dashboard:
- Build Command: `npm run build`
- Output Directory: `client/build`
- Install Command: `cd server && npm install`

### 4. Verify Deployment

After deployment, test these endpoints:
- `https://your-app.vercel.app/` (React app)
- `https://your-app.vercel.app/health` (Server health check)
- `https://your-app.vercel.app/api/auth/me` (API endpoint)

## Recommended Deployment Steps

1. **Quick Deploy** (using current setup):
   ```bash
   vercel --prod
   ```

2. **If build fails**, try manual build first:
   ```bash
   npm run install-all
   npm run build
   vercel --prod
   ```

3. **If still having issues**, use the simplified approach:
   - Remove complex build configurations
   - Use basic vercel.json (provided above)
   - Set environment variables in dashboard
   - Deploy again

## Benefits of Current Setup

✅ **No CORS Issues**: Same domain deployment  
✅ **Simplified API Calls**: Uses relative paths (`/api/...`)  
✅ **Single Deployment**: Both client and server together  
✅ **Cost Effective**: One Vercel project  
✅ **Easy Maintenance**: Single codebase deployment  

## Alternative: If You Want Separate Deployments

If you prefer separate deployments to avoid build complexity:

1. **Server**: Deploy to Railway/Render/Vercel Functions
2. **Client**: Deploy to Vercel/Netlify with `REACT_APP_API_URL` pointing to server
3. **CORS**: Configure server to allow client domain

Choose the approach that works best for your needs!