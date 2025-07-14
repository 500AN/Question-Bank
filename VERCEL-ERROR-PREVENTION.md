# Vercel Deployment Error Prevention Guide

This guide helps you avoid common Vercel errors when deploying your full-stack application.

## Common Function Errors and Solutions

### 1. FUNCTION_INVOCATION_TIMEOUT (504)
**Cause**: Function takes longer than 30 seconds to respond
**Solutions**:
- Optimize database queries
- Add connection pooling
- Implement caching
- Break down large operations

**Prevention in our app**:
```javascript
// Already implemented in server/server.js
app.use(express.json({ limit: '10mb' })); // Reasonable payload limit
```

### 2. FUNCTION_PAYLOAD_TOO_LARGE (413)
**Cause**: Request body exceeds size limits
**Solutions**:
- Limit file upload sizes
- Implement chunked uploads for large files
- Compress data before sending

**Prevention**:
```javascript
// In server/server.js - already set
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

### 3. NO_RESPONSE_FROM_FUNCTION (502)
**Cause**: Function doesn't return a response
**Solutions**:
- Always return a response in every route
- Add proper error handling
- Use try-catch blocks

**Prevention**:
```javascript
// Example from our routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' }); // Always return response
});
```

### 4. FUNCTION_INVOCATION_FAILED (500)
**Cause**: Function crashes or throws unhandled errors
**Solutions**:
- Add comprehensive error handling
- Validate environment variables
- Handle database connection errors

**Prevention**:
```javascript
// Already implemented in server/server.js
app.use(errorHandler); // Global error handler
```

## Deployment Best Practices

### 1. Environment Variables
Set these in Vercel dashboard to avoid runtime errors:

```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 2. Database Connection
Ensure MongoDB connection is stable:

```javascript
// In server/config/database.js
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};
```

### 3. Error Handling Middleware
```javascript
// In server/middleware/error.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
};
```

### 4. Route Validation
Always validate inputs and handle edge cases:

```javascript
// Example route with proper error handling
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Process login...
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});
```

## Monitoring and Debugging

### 1. Function Logs
Check Vercel function logs in the dashboard:
- Go to your project dashboard
- Click on "Functions" tab
- View logs for each function invocation

### 2. Health Check Endpoint
Test your deployment:
```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 3. API Testing
Test all endpoints:
```bash
# Test auth endpoint
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## Common Issues and Fixes

### Issue: CORS Errors
**Solution**: Already configured in server/server.js
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // Allow same-origin requests for Vercel deployment
    if (!origin || origin.includes('vercel.app')) {
      callback(null, true);
    }
  }
};
```

### Issue: Static File Serving
**Solution**: Configured in vercel.json
```json
{
  "routes": [
    {
      "src": "/uploads/(.*)",
      "dest": "/server/server.js"
    }
  ]
}
```

### Issue: Database Connection Timeout
**Solutions**:
1. Use MongoDB Atlas (recommended)
2. Implement connection pooling
3. Add retry logic

### Issue: Build Failures
**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set

## Deployment Checklist

Before deploying:

- [ ] Environment variables set in Vercel dashboard
- [ ] MongoDB connection string is valid
- [ ] All routes return proper responses
- [ ] Error handling middleware is in place
- [ ] Health check endpoint works
- [ ] CORS is properly configured
- [ ] File upload limits are reasonable
- [ ] Database queries are optimized

## Emergency Troubleshooting

If deployment fails:

1. **Check Vercel build logs**
2. **Verify environment variables**
3. **Test locally first**: `npm run dev`
4. **Check database connectivity**
5. **Review function logs in Vercel dashboard**
6. **Test API endpoints individually**

## Performance Optimization

To avoid timeout errors:

1. **Database Indexing**: Add indexes to frequently queried fields
2. **Connection Pooling**: Use mongoose connection pooling
3. **Caching**: Implement Redis or in-memory caching
4. **Pagination**: Limit query results
5. **Async Operations**: Use proper async/await patterns

## Support Resources

- [Vercel Error Documentation](https://vercel.com/docs/errors)
- [Function Logs](https://vercel.com/docs/functions/logs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Build Configuration](https://vercel.com/docs/build-step)