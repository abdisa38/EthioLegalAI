# EthioLegal AI - Complete Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy EthioLegal AI to production.

**Tech Stack:**
- Backend: Node.js + Express → Render
- Frontend: React + Vite → Vercel
- Database: MongoDB Atlas
- Storage: Cloudinary
- AI: Google Gemini API

---

## PHASE 1: PRE-DEPLOYMENT SETUP (LOCAL)

### Step 1: Install Dependencies

```bash
# Navigate to project
cd C:\Users\SPARK COMPUTERS MART\Videos\EthioLegalAI\EthioLegalAI

# Backend
cd backend
npm install

# Frontend
cd ..\frontend
npm install
cd ..
```

### Step 2: Create .env Files

**Backend - `backend/.env`:**

```env
# Server
PORT=5000
NODE_ENV=production

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ethiolegal_ai?retryWrites=true&w=majority

# JWT & Security
JWT_SECRET=generate-random-string-here-min-32-chars
JWT_ISSUER=ethiolegal-ai
JWT_AUDIENCE=ethiolegal-ai-users
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECRET=generate-another-random-string-here

# AI Service - Google Gemini
GEMINI_API_KEY=your-api-key-from-aistudio.google.com

# File Storage - Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# RAG Tuning (Optional - defaults work fine)
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=200
RAG_RETRIEVAL_K=5
RAG_SIMILARITY_THRESHOLD=0.45
RAG_CATEGORY_BOOST=0.15
RAG_KEYWORD_BOOST=0.1
RAG_MAX_CONTEXT_TOKENS=3500
RAG_ENABLE_FALLBACK=true

# Logging
LOG_LEVEL=info
```

**Frontend - `frontend/.env.production`:**

```env
VITE_API_URL=https://your-render-backend-url.onrender.com
```

### Step 3: Generate Secure Random Strings

**For JWT_SECRET and COOKIE_SECRET:**

Option A - Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two random strings.

Option B - Using Online Tool:
https://www.random.org/strings/

---

## PHASE 2: EXTERNAL SERVICES SETUP

### Step 1: MongoDB Atlas Setup

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster:**
   - Choose free tier (M0)
   - Region: Choose closest to users
   - Cluster name: `ethiolegal-ai`
3. **Create Database User:**
   - Username: `ethiolegal_user`
   - Password: Generate strong password
   - Save the password securely
4. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<username>` and `<password>`
   - Add `/ethiolegal_ai?retryWrites=true&w=majority` to database name
5. **Add IP Whitelist:**
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (Allow all - or restrict to Render IPs later)

**Connection String Example:**
```
mongodb+srv://ethiolegal_user:PASSWORD@cluster.mongodb.net/ethiolegal_ai?retryWrites=true&w=majority
```

### Step 2: Google Gemini API Setup

1. **Get Free API Key:**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API key"
   - Copy the key
   - Save it securely

2. **Enable API:**
   - Go to https://console.cloud.google.com
   - Search for "Generative Language API"
   - Enable it

### Step 3: Cloudinary Setup

1. **Create Account:** https://cloudinary.com/
2. **Get Credentials:**
   - Dashboard shows: Cloud Name, API Key, API Secret
   - Save all three
3. **Create Upload Folder:**
   - Settings → Upload
   - Unsigned uploads allowed (for frontend uploads)

---

## PHASE 3: GITHUB REPOSITORY

### Step 1: Initialize Git (If Not Done)

```bash
cd C:\Users\SPARK COMPUTERS MART\Videos\EthioLegalAI\EthioLegalAI
git init
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Step 2: Create .gitignore (If Missing)

The `.gitignore` should already exist. Verify it contains:

```
node_modules/
.env
.env.local
.env.*.local
dist/
build/
.DS_Store
*.log
```

### Step 3: Add All Files

```bash
git add .
```

### Step 4: Create Commits

For organized commits, run:

```bash
git commit -m "Initial: Project setup with React frontend and Express backend

- Frontend: React 18 + Vite with Tailwind CSS
- Backend: Express.js with MongoDB
- UI: 50+ shadcn/ui components from Figma export
- Security: JWT, rate limiting, input validation
- AI: Google Gemini integration

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

For subsequent commits, organize by feature (see GIT_COMMITS_SUMMARY.md)

### Step 5: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `ethiolegal-ai`
3. **Description:** AI-powered Ethiopian legal assistant
4. **Public or Private:** Your choice
5. **DO NOT:** Initialize with README (we have one)
6. **Create repository**

### Step 6: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/ethiolegal-ai.git
git branch -M main
git push -u origin main
```

**Expected output:**
```
Counting objects: ...
...
To https://github.com/YOUR_USERNAME/ethiolegal-ai.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## PHASE 4: BACKEND DEPLOYMENT (Render)

### Step 1: Create Render Account

1. **Go to:** https://render.com
2. **Sign up** with GitHub account
3. **Authorize Render** to access your repositories

### Step 2: Create Web Service

1. **Dashboard → New +**
2. **Select "Web Service"**
3. **Connect Repository:**
   - Select `ethiolegal-ai`
   - Select `main` branch
4. **Configuration:**
   - **Name:** `ethiolegal-ai-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (upgrade later if needed)

### Step 3: Add Environment Variables

In Render dashboard:

1. **Environment:**
2. Add each variable from `backend/.env`:

```
PORT = 5000
NODE_ENV = production
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your-random-string
JWT_ISSUER = ethiolegal-ai
JWT_AUDIENCE = ethiolegal-ai-users
JWT_ACCESS_TTL = 15m
REFRESH_TOKEN_TTL_DAYS = 7
COOKIE_SECRET = your-random-string
GEMINI_API_KEY = your-api-key
CLOUDINARY_CLOUD_NAME = your-name
CLOUDINARY_API_KEY = your-key
CLOUDINARY_API_SECRET = your-secret
CORS_ORIGIN = https://your-vercel-domain.vercel.app
```

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for deployment** (5-10 minutes)
3. **Check logs** for errors
4. **Note the URL:** `https://ethiolegal-ai-backend.onrender.com`

### Step 5: Test Backend

```bash
# Test health check
curl https://ethiolegal-ai-backend.onrender.com/health

# Expected response:
# {"status": "ok"}
```

---

## PHASE 5: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Create Vercel Account

1. **Go to:** https://vercel.com
2. **Sign up** with GitHub account
3. **Authorize Vercel** to access repositories

### Step 2: Import Project

1. **Dashboard → Add New → Project**
2. **Import Git Repository**
3. **Select `ethiolegal-ai`**
4. **Configure:**
   - **Framework:** Vite
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Add Environment Variables

1. **Environment Variables:**

```
VITE_API_URL = https://ethiolegal-ai-backend.onrender.com
```

Replace with your actual Render backend URL.

### Step 4: Deploy

1. **Click "Deploy"**
2. **Wait for deployment** (3-5 minutes)
3. **Visit your site**

**Your site URL will be:** `https://ethiolegal-ai.vercel.app`

### Step 5: Update CORS in Backend

Go back to Render dashboard and update:

```
CORS_ORIGIN = https://ethiolegal-ai.vercel.app
```

Then redeploy backend.

---

## PHASE 6: POST-DEPLOYMENT TESTING

### Test 1: Health Check

```bash
curl https://ethiolegal-ai-backend.onrender.com/health
```

Expected: `{"status": "ok"}`

### Test 2: Register User

```bash
curl -X POST https://ethiolegal-ai-backend.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: User created with tokens

### Test 3: Frontend

Open: `https://ethiolegal-ai.vercel.app`

Try to:
1. Register new account
2. Login
3. Send a chat message
4. Upload a PDF document
5. Analyze a contract

---

## PHASE 7: MONITORING & MAINTENANCE

### Backend Monitoring (Render)

1. **Logs:** Dashboard → Service → Logs
2. **Metrics:** Dashboard → Metrics (response time, errors)
3. **Restart:** Service → Restart

### Frontend Monitoring (Vercel)

1. **Logs:** Project → Deployments → select deployment → Logs
2. **Analytics:** Project → Analytics
3. **Redeploy:** Deployments → Redeploy

### MongoDB Monitoring

1. **Atlas Dashboard** → Cluster → Monitoring
2. **Check connection count**
3. **Monitor query performance**

---

## COMMON DEPLOYMENT ISSUES & FIXES

### Issue 1: "Cannot find module" Error on Render

**Problem:** Dependencies not installed

**Solution:**
- Render should run `npm install` automatically
- Check: Render Dashboard → Service → Build Logs
- If missing, add to **Build Command:** `npm install`

### Issue 2: CORS Error

**Problem:** Frontend can't connect to backend

**Solution:**
- Update `CORS_ORIGIN` in Render environment
- Include full domain: `https://yourdomain.vercel.app`
- Restart backend service

### Issue 3: Timeout Error on AI Requests

**Problem:** Gemini API taking too long

**Solution:**
- Increase timeout in `frontend/src/app/api/http.ts`
- Check Gemini API quota/rate limits
- Consider caching responses

### Issue 4: MongoDB Connection Refused

**Problem:** Database connection failing

**Solution:**
- Verify connection string in Render `.env`
- Check MongoDB Atlas IP whitelist (add `0.0.0.0/0`)
- Verify username/password
- Check cluster is running in MongoDB Atlas

### Issue 5: File Upload Not Working

**Problem:** Cloudinary upload failing

**Solution:**
- Verify Cloudinary credentials are correct
- Check cloud name, API key, API secret
- Ensure unsigned uploads are enabled in Cloudinary

---

## SECURITY CHECKLIST FOR PRODUCTION

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] COOKIE_SECRET is strong (32+ characters)
- [ ] NODE_ENV is set to `production`
- [ ] MongoDB user has limited permissions (not admin)
- [ ] MongoDB IP whitelist is restrictive (if possible)
- [ ] Cloudinary API keys are restricted to upload API
- [ ] CORS_ORIGIN only includes your domain
- [ ] API rate limits are appropriate
- [ ] Error logs don't expose sensitive info
- [ ] HTTPS is enforced (automatic on Render/Vercel)
- [ ] Cookies are HttpOnly and Secure
- [ ] Helmet security headers are active

---

## SCALING FOR PRODUCTION

### If You Get High Traffic

1. **Upgrade Render Plan:**
   - Free → Paid (auto-scales)
   - More CPU/RAM for backend

2. **Upgrade MongoDB:**
   - M0 Free → M2 Shared (1GB storage)
   - M10 Dedicated (more features)

3. **Add Redis Cache:**
   - For session storage
   - For chat history caching
   - For vector store acceleration

4. **CDN for Images:**
   - Cloudinary handles this automatically
   - Vercel includes global CDN

5. **Database Indexes:**
   - Add indexes for frequently queried fields
   - MongoDB Atlas suggests indexes automatically

---

## ROLLBACK PROCEDURE

If deployment breaks:

### Backend (Render)
1. Dashboard → Service
2. Deployments tab
3. Click previous working deployment
4. Click "Redeploy"

### Frontend (Vercel)
1. Project → Deployments
2. Click previous working deployment
3. Click "Redeploy"

### Code Rollback
```bash
git revert <broken-commit-hash>
git push
```

---

## NEXT STEPS

1. ✅ Complete all phases above
2. ✅ Run smoke tests
3. ✅ Monitor for 24 hours
4. ✅ Setup automated backups for MongoDB
5. ✅ Enable 2FA on GitHub/Render/Vercel accounts
6. ✅ Document any custom configurations
7. ✅ Create runbook for common issues
8. 📊 Setup monitoring dashboards
9. 📧 Setup error alerts
10. 📝 Create runbook for operations team

---

## USEFUL LINKS

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Google Gemini Docs:** https://ai.google.dev/tutorials
- **Express.js Docs:** https://expressjs.com/
- **React Docs:** https://react.dev/

---

## SUPPORT & TROUBLESHOOTING

**For Render issues:** https://render.com/support
**For Vercel issues:** https://vercel.com/help
**For MongoDB issues:** https://docs.atlas.mongodb.com/
**For general Node.js issues:** https://stackoverflow.com/questions/tagged/node.js

---

**Estimated deployment time:** 30-60 minutes (depending on experience)

**All set!** Your EthioLegal AI platform is now running in production! 🚀
