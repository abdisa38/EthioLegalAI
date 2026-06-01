# 🚀 Deployment Checklist

Use this checklist to ensure you complete all deployment steps correctly.

---

## 📦 Pre-Deployment Setup

### Accounts & Services
- [ ] GitHub/GitLab account with repository pushed
- [ ] Vercel account created
- [ ] Heroku account created
- [ ] Heroku CLI installed
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Google Gemini API key obtained

---

## 🔧 Backend Deployment (Heroku)

### Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (allow 0.0.0.0/0 for Heroku)
- [ ] Connection string copied

### Cloudinary Setup
- [ ] Cloudinary dashboard accessed
- [ ] Cloud Name copied
- [ ] API Key copied
- [ ] API Secret copied

### Heroku Setup
- [ ] Logged into Heroku CLI (`heroku login`)
- [ ] Created Heroku app (`heroku create app-name`)
- [ ] Set all environment variables (see DEPLOYMENT_GUIDE.md)
  - [ ] MONGODB_URI
  - [ ] JWT_SECRET (generated securely)
  - [ ] COOKIE_SECRET (generated securely)
  - [ ] GEMINI_API_KEY
  - [ ] CLOUDINARY credentials
  - [ ] CORS_ORIGIN (temporary localhost)

### Deploy Backend
- [ ] Navigated to backend directory
- [ ] Git initialized and committed
- [ ] Added Heroku remote
- [ ] Pushed to Heroku (`git push heroku main`)
- [ ] Verified deployment (visit Heroku URL)
- [ ] Backend URL saved: ___________________________________

---

## 🎨 Frontend Deployment (Vercel)

### Environment Configuration
- [ ] Created `.env.production` file
- [ ] Updated `VITE_API_URL` with Heroku backend URL

### Vercel Deployment (Choose One Method)

#### Option A: Dashboard (Recommended)
- [ ] Logged into Vercel dashboard
- [ ] Clicked "Add New Project"
- [ ] Imported Git repository
- [ ] Set root directory to `frontend`
- [ ] Verified build settings (Vite, npm run build, dist)
- [ ] Added `VITE_API_URL` environment variable
- [ ] Deployed project
- [ ] Frontend URL saved: ___________________________________

#### Option B: CLI
- [ ] Installed Vercel CLI (`npm install -g vercel`)
- [ ] Logged in (`vercel login`)
- [ ] Deployed from frontend directory (`vercel`)
- [ ] Added environment variable (`vercel env add`)
- [ ] Deployed to production (`vercel --prod`)
- [ ] Frontend URL saved: ___________________________________

---

## 🔗 Connect Frontend & Backend

### Update CORS
- [ ] Updated Heroku `CORS_ORIGIN` with Vercel URL
- [ ] Restarted Heroku app (`heroku restart`)

### Verify Connection
- [ ] Visited frontend URL
- [ ] Tested user registration
- [ ] Tested user login
- [ ] Checked browser console (no CORS errors)
- [ ] Tested file upload feature
- [ ] Tested AI chat functionality

---

## ✅ Post-Deployment

### Testing
- [ ] Backend health check: `curl https://your-backend.herokuapp.com`
- [ ] Frontend loads correctly
- [ ] All API endpoints working
- [ ] Authentication working
- [ ] File uploads working
- [ ] AI features working

### Documentation
- [ ] Updated README with live URLs
- [ ] Documented any deployment issues encountered
- [ ] Saved all credentials securely (use password manager)

### Optional Enhancements
- [ ] Set up custom domain for frontend
- [ ] Set up custom domain for backend
- [ ] Configure monitoring (Heroku metrics, Vercel analytics)
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure automated backups for MongoDB
- [ ] Set up CI/CD pipeline
- [ ] Add SSL certificate (if using custom domain)

---

## 🔐 Security Checklist

- [ ] `.env` files not committed to Git
- [ ] Strong JWT_SECRET generated (32+ characters)
- [ ] Strong COOKIE_SECRET generated (32+ characters)
- [ ] COOKIE_SECURE set to "true" in production
- [ ] COOKIE_SAMESITE set to "none" for cross-origin
- [ ] MongoDB Atlas network access configured
- [ ] API keys stored securely
- [ ] CORS properly configured
- [ ] Rate limiting enabled

---

## 📊 Monitoring Setup

### Heroku
- [ ] Enabled Heroku metrics
- [ ] Set up log drains (optional)
- [ ] Configured alerts for downtime

### Vercel
- [ ] Enabled Vercel Analytics
- [ ] Reviewed deployment logs
- [ ] Set up custom alerts

### Database
- [ ] MongoDB Atlas monitoring enabled
- [ ] Set up alerts for high usage
- [ ] Configured automated backups

---

## 🎉 Deployment Complete!

**Live URLs:**
- Frontend: ___________________________________
- Backend: ___________________________________
- API: ___________________________________

**Date Deployed:** ___________________________________

**Deployed By:** ___________________________________

---

## 📝 Notes & Issues

Use this space to document any issues encountered or special configurations:

___________________________________
___________________________________
___________________________________
___________________________________
___________________________________

---

**Need help?** Refer to DEPLOYMENT_GUIDE.md for detailed instructions.
