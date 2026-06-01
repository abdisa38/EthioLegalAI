# 🚀 Quick Deployment Commands Reference

Copy and paste these commands for quick deployment.

---

## 🔧 Backend Deployment (Heroku)

### 1. Login to Heroku
```bash
heroku login
```

### 2. Create Heroku App
```bash
cd backend
heroku create your-app-name-backend
```

### 3. Set Environment Variables (Update with your values)
```bash
# Generate secure secrets first
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Set all variables
heroku config:set MONGODB_URI="your-mongodb-connection-string"
heroku config:set JWT_SECRET="your-generated-secret-here"
heroku config:set JWT_ACCESS_TTL="15m"
heroku config:set JWT_ISSUER="ethiolegal-ai"
heroku config:set JWT_AUDIENCE="ethiolegal-users"
heroku config:set REFRESH_TOKEN_TTL_DAYS="30"
heroku config:set COOKIE_SECRET="your-generated-secret-here"
heroku config:set COOKIE_DOMAIN=""
heroku config:set COOKIE_SAMESITE="none"
heroku config:set COOKIE_SECURE="true"
heroku config:set GEMINI_API_KEY="your-gemini-api-key"
heroku config:set GEMINI_MODEL="gemini-2.5-flash"
heroku config:set GEMINI_EMBED_MODEL="gemini-embedding-001"
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-api-secret"
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
heroku config:set CORS_ORIGIN="http://localhost:5173"
```

### 4. Deploy to Heroku
```bash
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a your-app-name-backend
git push heroku main
```

### 5. Verify Deployment
```bash
heroku open
# Or visit: https://your-app-name-backend.herokuapp.com
```

### 6. View Logs (if needed)
```bash
heroku logs --tail
```

---

## 🎨 Frontend Deployment (Vercel)

### Method 1: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://your-app-name-backend.herokuapp.com/api`
6. Click "Deploy"

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://your-app-name-backend.herokuapp.com/api

# Deploy to production
vercel --prod
```

---

## 🔗 Connect Frontend & Backend

### Update CORS on Backend
```bash
cd backend
heroku config:set CORS_ORIGIN="https://your-frontend-url.vercel.app"
heroku restart
```

### Allow Multiple Origins (Development + Production)
```bash
heroku config:set CORS_ORIGIN="http://localhost:5173,https://your-frontend-url.vercel.app"
heroku restart
```

---

## 🔄 Update Deployed Apps

### Update Backend
```bash
cd backend
git add .
git commit -m "Your update message"
git push heroku main
```

### Update Frontend
```bash
cd frontend
git add .
git commit -m "Your update message"
git push origin main
# Vercel auto-deploys from Git

# Or manually:
vercel --prod
```

---

## 🔍 Debugging Commands

### Check Heroku Config
```bash
heroku config
```

### View Heroku Logs
```bash
heroku logs --tail
```

### Restart Heroku App
```bash
heroku restart
```

### Check Heroku App Status
```bash
heroku ps
```

### Open Heroku Dashboard
```bash
heroku open
```

### Vercel Logs
```bash
vercel logs
```

### Check Vercel Deployments
```bash
vercel ls
```

---

## 🧪 Test Commands

### Test Backend API
```bash
curl https://your-app-name-backend.herokuapp.com
```

### Test Backend Health
```bash
curl https://your-app-name-backend.herokuapp.com/api/health
```

### Test with Authentication
```bash
curl -X POST https://your-app-name-backend.herokuapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📦 Database Commands

### MongoDB Atlas Connection Test
```bash
# Install MongoDB tools
npm install -g mongodb

# Test connection (replace with your connection string)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/dbname"
```

---

## 🔐 Generate Secure Secrets

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generate Cookie Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🎯 Quick Checklist

Before deploying, ensure:
- [ ] MongoDB Atlas database created
- [ ] Cloudinary account set up
- [ ] Gemini API key obtained
- [ ] All secrets generated
- [ ] Git repository pushed
- [ ] `.env` files not committed

After deploying:
- [ ] Backend URL works
- [ ] Frontend URL works
- [ ] CORS updated
- [ ] Test login/register
- [ ] Test file upload
- [ ] Test AI features

---

## 📞 Useful Links

- **Heroku Dashboard:** https://dashboard.heroku.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Cloudinary:** https://cloudinary.com/console
- **Google AI Studio:** https://makersuite.google.com

---

**Happy Deploying! 🚀**
