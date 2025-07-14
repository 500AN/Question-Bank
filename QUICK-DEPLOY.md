# Quick Deployment Guide

## Option 1: Current Setup (with vercel.json)
```bash
vercel --prod
```

## Option 2: Without vercel.json (Recommended)

### Step 1: Backup current vercel.json
```bash
mv vercel.json vercel.json.backup
```

### Step 2: Configure in Vercel Dashboard
1. Go to your project settings
2. Set these build settings:
   - **Framework Preset**: Other
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`

### Step 3: Create API directory structure
```bash
mkdir -p api
```

### Step 4: Create API route files
Create `api/[...path].js` to handle all API routes:

```javascript
// api/[...path].js
const app = require('../server/server.js');

module.exports = app;
```

### Step 5: Deploy
```bash
vercel --prod
```

## Option 3: Separate Deployments

Deploy server and client separately to avoid build complexity.

Choose the option that works best for you!