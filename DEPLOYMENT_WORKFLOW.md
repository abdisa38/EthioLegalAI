# 🔄 Deployment Workflow - Visual Guide

This document provides a visual step-by-step workflow for deploying EthioLegalAI.

---

## 📊 Complete Deployment Flow

```
START
  │
  ├─── PHASE 1: PREPARATION (15 min)
  │    │
  │    ├─── Create MongoDB Atlas Account
  │    │    └─── Create Cluster → Get Connection String
  │    │
  │    ├─── Create Cloudinary Account
  │    │    └─── Get Cloud Name, API Key, API Secret
  │    │
  │    ├─── Get Google Gemini API Key
  │    │    └─── Visit Google AI Studio → Generate Key
  │    │
  │    ├─── Create Heroku Account
  │    │    └─── Install Heroku CLI
  │    │
  │    └─── Create Vercel Account
  │         └─── Connect GitHub/GitLab
  │
  ├─── PHASE 2: BACKEND DEPLOYMENT (10 min)
  │    │
  │    ├─── Login to Heroku CLI
  │    │    └─── heroku login
  │    │
  │    ├─── Create Heroku App
  │    │    └─── heroku create app-name-backend
  │    │
  │    ├─── Generate Secrets
  │    │    ├─── JWT_SECRET
  │    │    └─── COOKIE_SECRET
  │    │
  │    ├─── Set Environment Variables
  │    │    ├─── Database: MONGODB_URI
  │    │    ├─── Auth: JWT_SECRET, COOKIE_SECRET
  │    │    ├─── AI: GEMINI_API_KEY
  │    │    ├─── Storage: CLOUDINARY_*
  │    │    └─── CORS: CORS_ORIGIN (temp)
  │    │
  │    ├─── Deploy Code
  │    │    ├─── git init
  │    │    ├─── git add .
  │    │    ├─── git commit -m "Deploy"
  │    │    └─── git push heroku main
  │    │
  │    └─── Verify Deployment
  │         ├─── heroku open
  │         └─── Test: curl backend-url
  │              └─── ✅ Should return: {"status":"ok"}
  │
  ├─── PHASE 3: FRONTEND DEPLOYMENT (5 min)
  │    │
  │    ├─── Update .env.production
  │    │    └─── VITE_API_URL = backend-url/api
  │    │
  │    ├─── Deploy to Vercel (Choose Method)
  │    │    │
  │    │    ├─── METHOD A: Dashboard (Recommended)
  │    │    │    ├─── Go to vercel.com/dashboard
  │    │    │    ├─── Click "Add New Project"
  │    │    │    ├─── Import Git Repository
  │    │    │    ├─── Set Root: frontend
  │    │    │    ├─── Add Env: VITE_API_URL
  │    │    │    └─── Click Deploy
  │    │    │
  │    │    └─── METHOD B: CLI
  │    │         ├─── npm install -g vercel
  │    │         ├─── vercel login
  │    │         ├─── vercel (from frontend dir)
  │    │         ├─── vercel env add VITE_API_URL
  │    │         └─── vercel --prod
  │    │
  │    └─── Get Frontend URL
  │         └─── Save: https://your-app.vercel.app
  │
  ├─── PHASE 4: CONNECT SERVICES (2 min)
  │    │
  │    ├─── Update Backend CORS
  │    │    ├─── heroku config:set CORS_ORIGIN="frontend-url"
  │    │    └─── heroku restart
  │    │
  │    └─── Verify Connection
  │         ├─── Visit frontend URL
  │         ├─── Test Registration
  │         ├─── Test Login
  │         ├─── Test File Upload
  │         └─── Test AI Chat
  │              └─── ✅ All working!
  │
  └─── PHASE 5: POST-DEPLOYMENT (5 min)
       │
       ├─── Test All Features
       │    ├─── User Authentication
       │    ├─── Document Upload
       │    ├─── AI Assistants
       │    └─── Contract Analysis
       │
       ├─── Monitor Logs
       │    ├─── heroku logs --tail
       │    └─── vercel logs
       │
       └─── Document URLs
            ├─── Frontend: _______________
            ├─── Backend: _______________
            └─── API: _______________

DEPLOYMENT COMPLETE! 🎉
```

---

## 🎯 Decision Tree: Troubleshooting

```
Deployment Issue?
│
├─── Backend Not Working?
│    │
│    ├─── App Crashes?
│    │    ├─── Check: heroku logs --tail
│    │    ├─── Verify: All env vars set (heroku config)
│    │    └─── Fix: Missing MONGODB_URI or JWT_SECRET
│    │
│    ├─── Database Connection Fails?
│    │    ├─── Check: MongoDB Atlas Network Access
│    │    ├─── Add: 0.0.0.0/0 to IP whitelist
│    │    └─── Verify: Connection string format
│    │
│    └─── API Returns 500?
│         ├─── Check: heroku logs --tail
│         ├─── Verify: GEMINI_API_KEY is valid
│         └─── Test: Individual endpoints
│
├─── Frontend Not Working?
│    │
│    ├─── Build Fails?
│    │    ├─── Check: Vercel deployment logs
│    │    ├─── Verify: package.json scripts
│    │    └─── Fix: Missing dependencies
│    │
│    ├─── CORS Errors?
│    │    ├─── Check: Browser console
│    │    ├─── Verify: CORS_ORIGIN on Heroku
│    │    ├─── Update: heroku config:set CORS_ORIGIN
│    │    └─── Restart: heroku restart
│    │
│    └─── API Calls Fail?
│         ├─── Check: VITE_API_URL in Vercel
│         ├─── Verify: URL ends with /api
│         └─── Redeploy: After env var change
│
└─── Everything Deployed But Not Working Together?
     │
     ├─── Check CORS Configuration
     │    └─── Backend CORS_ORIGIN must include frontend URL
     │
     ├─── Check API URL
     │    └─── Frontend VITE_API_URL must point to backend
     │
     └─── Check Network Tab
          └─── See actual API calls and responses
```

---

## 📈 Deployment Timeline

```
Total Time: ~35-40 minutes

┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Preparation                          [15 min]      │
│ ████████████████████████████████████████████                │
├─────────────────────────────────────────────────────────────┤
│ PHASE 2: Backend Deployment                   [10 min]      │
│ ███████████████████████████                                 │
├─────────────────────────────────────────────────────────────┤
│ PHASE 3: Frontend Deployment                  [5 min]       │
│ █████████████                                               │
├─────────────────────────────────────────────────────────────┤
│ PHASE 4: Connect Services                     [2 min]       │
│ █████                                                       │
├─────────────────────────────────────────────────────────────┤
│ PHASE 5: Testing & Verification               [5 min]       │
│ █████████████                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Checklist Flow

```
Security Setup
│
├─── Secrets Generation
│    ├─── JWT_SECRET (32+ chars)
│    │    └─── node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
│    │
│    └─── COOKIE_SECRET (32+ chars)
│         └─── node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
│
├─── Environment Variables
│    ├─── Never commit .env files
│    ├─── Use .env.example as template
│    └─── Set in Heroku/Vercel dashboards
│
├─── HTTPS Configuration
│    ├─── COOKIE_SECURE = true (production)
│    ├─── COOKIE_SAMESITE = none (cross-origin)
│    └─── Both Heroku & Vercel provide SSL
│
├─── CORS Configuration
│    ├─── Only allow your frontend domain
│    └─── Update when domain changes
│
└─── Database Security
     ├─── Strong MongoDB password
     ├─── Network access restrictions
     └─── Regular backups
```

---

## 🔄 Update Workflow

```
Code Changes Made
│
├─── Backend Changes?
│    │
│    ├─── Local Testing
│    │    └─── npm run dev
│    │
│    ├─── Commit Changes
│    │    ├─── git add .
│    │    └─── git commit -m "Description"
│    │
│    ├─── Deploy to Heroku
│    │    └─── git push heroku main
│    │
│    └─── Verify
│         ├─── heroku logs --tail
│         └─── Test API endpoints
│
└─── Frontend Changes?
     │
     ├─── Local Testing
     │    └─── npm run dev
     │
     ├─── Commit Changes
     │    ├─── git add .
     │    └─── git commit -m "Description"
     │
     ├─── Push to Git
     │    └─── git push origin main
     │
     └─── Vercel Auto-Deploys
          ├─── Watch deployment in dashboard
          └─── Test live site
```

---

## 📊 Service Dependencies Map

```
                    ┌─────────────┐
                    │    USER     │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   VERCEL    │
                    │  (Frontend) │
                    └──────┬──────┘
                           │
                           │ API Calls
                           ▼
                    ┌─────────────┐
                    │   HEROKU    │
                    │  (Backend)  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ MongoDB  │    │Cloudinary│    │  Gemini  │
    │  Atlas   │    │          │    │   AI     │
    └──────────┘    └──────────┘    └──────────┘
    
    Database        File Storage     AI Processing
```

---

## ✅ Verification Checklist

```
After Deployment, Test:

Backend Health
├─── [ ] Root endpoint returns {"status":"ok"}
├─── [ ] /api/health returns health status
└─── [ ] Logs show no errors

Frontend Access
├─── [ ] Site loads without errors
├─── [ ] No console errors
└─── [ ] Assets load correctly

Authentication
├─── [ ] User registration works
├─── [ ] User login works
├─── [ ] JWT tokens issued
└─── [ ] Protected routes work

File Upload
├─── [ ] Document upload works
├─── [ ] Files stored in Cloudinary
└─── [ ] File retrieval works

AI Features
├─── [ ] Chat responses work
├─── [ ] Contract analysis works
├─── [ ] Labor assistant works
└─── [ ] Tenant assistant works

Cross-Origin
├─── [ ] No CORS errors
├─── [ ] Cookies set correctly
└─── [ ] API calls succeed
```

---

## 🎯 Quick Reference: Key URLs

```
Development:
├─── Frontend: http://localhost:5173
└─── Backend:  http://localhost:5000

Production:
├─── Frontend: https://your-app.vercel.app
├─── Backend:  https://your-app.herokuapp.com
└─── API:      https://your-app.herokuapp.com/api

Dashboards:
├─── Heroku:     https://dashboard.heroku.com
├─── Vercel:     https://vercel.com/dashboard
├─── MongoDB:    https://cloud.mongodb.com
├─── Cloudinary: https://cloudinary.com/console
└─── Gemini:     https://makersuite.google.com
```

---

## 📞 Support Resources

```
Documentation:
├─── DEPLOYMENT_README.md      → Overview & quick start
├─── DEPLOYMENT_GUIDE.md       → Detailed step-by-step
├─── DEPLOYMENT_CHECKLIST.md   → Interactive checklist
├─── DEPLOYMENT_COMMANDS.md    → Command reference
└─── DEPLOYMENT_WORKFLOW.md    → This file (visual guide)

Official Docs:
├─── Heroku:  https://devcenter.heroku.com
├─── Vercel:  https://vercel.com/docs
└─── MongoDB: https://docs.atlas.mongodb.com
```

---

**Follow this workflow for a smooth deployment! 🚀**
