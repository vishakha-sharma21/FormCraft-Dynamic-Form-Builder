# 🔧 API Troubleshooting Guide

## 🚨 Current Issue: 405 Method Not Allowed + JSON Parsing Error

### 📊 What the Error Means:
- **405 Method Not Allowed**: The HTTP method (POST) is not supported by the endpoint
- **JSON Parsing Error**: The server is not returning valid JSON (likely returning HTML error page)

### 🔍 Debugging Steps Added:

1. **API Configuration Debug**: Check browser console for API URL being used
2. **Login Debug**: Check console for exact URL being called
3. **Network Tab**: Check the actual network request in browser dev tools

### 🎯 Most Likely Causes:

1. **Environment Variable Not Set**: `VITE_API_URL` not set on Vercel
2. **Wrong Backend URL**: Still calling frontend instead of backend
3. **CORS Issues**: Backend not properly configured
4. **Backend Not Running**: Render service not responding

### 🛠️ Immediate Actions:

1. **Check Browser Console**: Look for the debug logs I added:
   ```
   🔗 API Configuration: { ENV_URL: ..., FINAL_URL: ... }
   🔗 Using API URL: ...
   🌐 Full login URL: ...
   ```

2. **Check Network Tab**: Look at the actual failed request:
   - What URL is being called?
   - What's the response status?
   - What's the response body?

3. **Verify Environment Variables**:
   - Go to Vercel dashboard
   - Check if `VITE_API_URL` is set to `https://formcraft-dynamic-form-builder.onrender.com`

### 🚀 Quick Fix:

If environment variable is not set, add it to Vercel:
```
Key: VITE_API_URL
Value: https://formcraft-dynamic-form-builder.onrender.com
```

Then redeploy Vercel.

### 📋 Expected Behavior:

**Should see in console:**
```
🔗 API Configuration: { ENV_URL: "https://formcraft-dynamic-form-builder.onrender.com", FINAL_URL: "https://formcraft-dynamic-form-builder.onrender.com" }
🔗 Using API URL: https://formcraft-dynamic-form-builder.onrender.com
🌐 Full login URL: https://formcraft-dynamic-form-builder.onrender.com/api/auth/signin
```

**Network tab should show:**
- URL: `https://formcraft-dynamic-form-builder.onrender.com/api/auth/signin`
- Method: POST
- Status: 200 OK

### 🔧 If Still Failing:

1. **Test Backend Directly**: 
   ```
   curl -X POST https://formcraft-dynamic-form-builder.onrender.com/api/auth/signin
   ```

2. **Check Render Logs**: Look at your Render service logs

3. **Verify CORS**: Ensure your Vercel URL is in the CORS allowlist

**Let me know what you see in the console and network tab!** 🎯
