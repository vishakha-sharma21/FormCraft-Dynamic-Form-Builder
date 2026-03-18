# Deployment Guide

## Project Structure
```
dynamicforms/
├── frontend/     # React/Vite app → Deploy to Vercel
├── backend/      # Express.js API → Deploy to Railway/Render
└── DEPLOYMENT.md
```

## Frontend Deployment (Vercel)

### Step 1: Push to GitHub
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dynamicforms-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub repository
4. Select the `frontend` folder
5. Vercel will auto-detect Vite configuration
6. Click "Deploy"

### Environment Variables (if needed)
In Vercel dashboard → Settings → Environment Variables:
- `VITE_API_URL=https://your-backend-domain.railway.app`

## Backend Deployment (Railway)

### Step 1: Push to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/dynamicforms-backend.git
git push -u origin main
```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your backend repository
4. Railway will auto-detect Node.js
5. Add environment variables (see below)
6. Click "Deploy"

### Environment Variables (Railway)
In Railway dashboard → Settings → Variables:
```env
DB_HOST=your-railway-mysql-host.railway.app
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## Alternative: Backend on Render

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables
8. Click "Create Web Service"

## Database Setup (Railway)

### Option 1: Railway MySQL
1. In Railway dashboard, click "New Service"
2. Select "MySQL"
3. Railway will provide connection details
4. Update your backend environment variables

### Option 2: External Database
Update environment variables with your database provider details.

## Important Notes

### Frontend API Configuration
Update your frontend API calls to use the deployed backend URL:
```javascript
// In your frontend code
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

### CORS Configuration
In your backend `server.js`, ensure CORS allows your frontend domain:
```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
```

### Health Check
Add a health check endpoint to your backend:
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

## Deployment URLs
After deployment, you'll have:
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://your-app-name.railway.app` or `https://your-app-name.onrender.com`

## Troubleshooting

### Common Issues
1. **CORS errors**: Update CORS origin in backend
2. **Database connection**: Check environment variables
3. **Build failures**: Verify `package.json` scripts
4. **API calls failing**: Check deployed backend URL in frontend

### Commands for Debugging
```bash
# Frontend
npm run build
npm run preview

# Backend
npm start
node server.js
```

## Next Steps
1. Set up custom domains
2. Configure SSL (automatically handled)
3. Set up monitoring
4. Add error tracking
5. Configure CI/CD pipelines
