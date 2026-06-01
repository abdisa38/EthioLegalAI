# EthioLegalAI Deployment Guide

Complete guide to deploy your application with **Frontend on Vercel** and **Backend on Heroku**.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Git** installed and project pushed to GitHub/GitLab
2. **Vercel Account** - [Sign up at vercel.com](https://vercel.com)
3. **Heroku Account** - [Sign up at heroku.com](https://heroku.com)
4. **Heroku CLI** installed - [Download here](https://devcenter.heroku.com/articles/heroku-cli)
5. **MongoDB Atlas** account (for production database) - [Sign up at mongodb.com](https://www.mongodb.com/cloud/atlas)
6. **Cloudinary** account (for file uploads) - [Sign up at cloudinary.com](https://cloudinary.com)
7. **Google Gemini API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 🚀 Part 1: Backend Deployment on Heroku

### Step 1: Prepare Your Backend

The backend is already configured with:
- ✅ `Procfile` created (tells Heroku how to run your app)
- ✅ `package.json` with proper start script
- ✅ `.gitignore` configured

### Step 2: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
5. Replace `<password>` with your actual password
6. Replace `dbname` with `ethiolegalai` or your preferred name

### Step 3: Setup Cloudinary

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copy your:
   - Cloud Name
   - API Key
   - API Secret

### Step 4: Login to Heroku CLI

```bash
heroku login
```

This will open a browser window for authentication.

### Step 5: Create Heroku App

```bash
cd backend
heroku create ethiolegalai-backend
```

**Note:** Replace `ethiolegalai-backend` with your preferred app name (must be unique on Heroku).

### Step 6: Set Environment Variables on Heroku

Run these commands one by one, replacing the values with your actual credentials:

```bash
# Database
heroku config:set MONGODB_URI="your-mongodb-atlas-connection-string"

# JWT Configuration
heroku config:set JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
heroku config:set JWT_ACCESS_TTL="15m"
heroku config:set JWT_ISSUER="ethiolegal-ai"
heroku config:set JWT_AUDIENCE="ethiolegal-users"
heroku config:set REFRESH_TOKEN_TTL_DAYS="30"

# Cookie Configuration
heroku config:set COOKIE_SECRET="your-cookie-secret-key"
heroku config:set COOKIE_DOMAIN=""
heroku config:set COOKIE_SAMESITE="none"
heroku config:set COOKIE_SECURE="true"

# Gemini AI
heroku config:set GEMINI_API_KEY="your-gemini-api-key"
heroku config:set GEMINI_MODEL="gemini-2.5-flash"
heroku config:set GEMINI_EMBED_MODEL="gemini-embedding-001"

# Cloudinary
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-cloudinary-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# RAG Configuration (optional, use defaults)
heroku config:set RAG_CHUNK_SIZE="1000"
heroku config:set RAG_CHUNK_OVERLAP="150"
heroku config:set RAG_TOP_K="4"
heroku config:set RAG_RETRIEVE_K="12"
heroku config:set RAG_MAX_RESULTS="4"
heroku config:set RAG_MIN_CHUNK_SIZE="200"
heroku config:set RAG_MAX_CHUNKS="200"
heroku config:set RAG_MAX_CONTEXT_CHARS="3500"
heroku config:set RAG_SIMILARITY_THRESHOLD="0.45"
heroku config:set RAG_DEBUG="false"

# CORS (will update after frontend deployment)
heroku config:set CORS_ORIGIN="http://localhost:5173"
```

**Important:** Generate secure random strings for `JWT_SECRET` and `COOKIE_SECRET`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 7: Deploy Backend to Heroku

```bash
# Make sure you're in the backend directory
cd backend

# Initialize git if not already done
git init
git add .
git commit -m "Initial backend deployment"

# Add Heroku remote
heroku git:remote -a ethiolegalai-backend

# Deploy
git push heroku main
```

If your branch is named `master` instead of `main`:
```bash
git push heroku master
```

### Step 8: Verify Backend Deployment

```bash
heroku open
```

Or visit: `https://ethiolegalai-backend.herokuapp.com`

You should see: `{"status":"ok","service":"EthioLegal AI API"}`

**Save your backend URL!** You'll need it for frontend configuration.
Example: `https://ethiolegalai-backend.herokuapp.com`

---

## 🎨 Part 2: Frontend Deployment on Vercel

### Step 1: Prepare Frontend

The frontend is already configured with:
- ✅ `vercel.json` created (Vercel configuration)
- ✅ Build command in `package.json`

### Step 2: Update Frontend Environment Variable

Create/update `.env.production` in the frontend folder:

```bash
cd ../frontend
```

Create a new file `.env.production`:

```env
VITE_API_URL=https://ethiolegalai-backend.herokuapp.com/api
```

**Replace** `ethiolegalai-backend.herokuapp.com` with your actual Heroku backend URL.

### Step 3: Deploy to Vercel (Option A - Recommended: Via Vercel Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel will auto-detect it's a Vite project
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://ethiolegalai-backend.herokuapp.com/api`
7. Click **"Deploy"**

### Step 3: Deploy to Vercel (Option B - Via CLI)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from frontend directory)
cd frontend
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? ethiolegalai-frontend
# - In which directory is your code located? ./
# - Want to override settings? Yes
# - Build Command: npm run build
# - Output Directory: dist
# - Development Command: npm run dev

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://ethiolegalai-backend.herokuapp.com/api

# Deploy to production
vercel --prod
```

### Step 4: Get Your Frontend URL

After deployment, Vercel will give you a URL like:
`https://ethiolegalai-frontend.vercel.app`

**Save this URL!**

---

## 🔗 Part 3: Connect Frontend and Backend

### Step 1: Update Backend CORS Settings

Now that you have your frontend URL, update the backend to allow requests from it:

```bash
# From your project root
cd backend

# Update CORS_ORIGIN on Heroku
heroku config:set CORS_ORIGIN="https://ethiolegalai-frontend.vercel.app"
```

**Replace** `ethiolegalai-frontend.vercel.app` with your actual Vercel URL.

If you want to allow multiple origins (including localhost for development):
```bash
heroku config:set CORS_ORIGIN="http://localhost:5173,https://ethiolegalai-frontend.vercel.app"
```

### Step 2: Restart Heroku App

```bash
heroku restart
```

---

## ✅ Part 4: Verify Everything Works

### Test Backend:
```bash
curl https://ethiolegalai-backend.herokuapp.com
```
Should return: `{"status":"ok","service":"EthioLegal AI API"}`

### Test Frontend:
1. Visit your Vercel URL: `https://ethiolegalai-frontend.vercel.app`
2. Try to register/login
3. Check browser console for any errors

---

## 🔧 Troubleshooting

### Backend Issues

**Problem:** App crashes on Heroku
```bash
# Check logs
heroku logs --tail

# Common fixes:
# 1. Verify all environment variables are set
heroku config

# 2. Check MongoDB connection string is correct
# 3. Ensure Node version compatibility
```

**Problem:** Database connection fails
- Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access
- Check connection string format
- Ensure database user has proper permissions

### Frontend Issues

**Problem:** API calls fail (CORS errors)
- Verify `VITE_API_URL` is set correctly in Vercel
- Check backend `CORS_ORIGIN` includes your Vercel URL
- Ensure backend is running: visit backend URL directly

**Problem:** Environment variables not working
- In Vercel dashboard, go to Settings → Environment Variables
- Ensure `VITE_API_URL` is set for Production
- Redeploy after adding variables

**Problem:** 404 errors on page refresh
- The `vercel.json` file should handle this with rewrites
- Verify `vercel.json` is in the frontend root directory

---

## 📝 Important Notes

### Security Checklist:
- ✅ Never commit `.env` files to Git
- ✅ Use strong, random secrets for JWT and cookies
- ✅ Enable HTTPS only in production (COOKIE_SECURE=true)
- ✅ Restrict MongoDB Atlas network access if possible
- ✅ Rotate API keys regularly

### Cost Considerations:
- **Vercel:** Free tier includes 100GB bandwidth/month
- **Heroku:** Free tier available (with limitations), or $7/month for Hobby tier
- **MongoDB Atlas:** Free tier includes 512MB storage
- **Cloudinary:** Free tier includes 25GB storage

### Updating Your App:

**Backend updates:**
```bash
cd backend
git add .
git commit -m "Update description"
git push heroku main
```

**Frontend updates:**
```bash
cd frontend
git add .
git commit -m "Update description"
git push origin main
# Vercel auto-deploys from Git
# Or use: vercel --prod
```

---

## 🎉 Deployment Complete!

Your app is now live:
- **Frontend:** https://ethiolegalai-frontend.vercel.app
- **Backend:** https://ethiolegalai-backend.herokuapp.com
- **API:** https://ethiolegalai-backend.herokuapp.com/api

### Next Steps:
1. Set up custom domain (optional)
2. Configure monitoring and logging
3. Set up CI/CD pipelines
4. Add database backups
5. Configure CDN for assets

---

## 📞 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Heroku Docs:** https://devcenter.heroku.com
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com

---

**Happy Deploying! 🚀**
