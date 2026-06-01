# ⚡ Quick Deploy Guide - Heroku Dashboard

**Backend Repo:** https://github.com/abdisa38/EthioLegal-Ai-Backend.git

---

## 🚀 5-Minute Deployment

### 1. Create App (1 min)
1. Go to https://dashboard.heroku.com
2. Click **"New"** → **"Create new app"**
3. Name: `ethiolegalai-backend`
4. Click **"Create app"**

### 2. Connect GitHub (1 min)
1. **"Deploy"** tab → **"GitHub"**
2. Search: `EthioLegal-Ai-Backend`
3. Click **"Connect"**

### 3. Set Environment Variables (2 min)
1. **"Settings"** tab → **"Reveal Config Vars"**
2. Add these variables:

**Required (Must Have):**
```
MONGODB_URI = your-mongodb-connection-string
JWT_SECRET = (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
COOKIE_SECRET = (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
GEMINI_API_KEY = your-gemini-api-key
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
CORS_ORIGIN = http://localhost:5173
```

**Optional (Use Defaults):**
```
JWT_ACCESS_TTL = 15m
JWT_ISSUER = ethiolegal-ai
JWT_AUDIENCE = ethiolegal-users
REFRESH_TOKEN_TTL_DAYS = 30
COOKIE_DOMAIN = (leave empty)
COOKIE_SAMESITE = none
COOKIE_SECURE = true
GEMINI_MODEL = gemini-2.5-flash
GEMINI_EMBED_MODEL = gemini-embedding-001
RAG_CHUNK_SIZE = 1000
RAG_CHUNK_OVERLAP = 150
RAG_TOP_K = 4
RAG_RETRIEVE_K = 12
RAG_MAX_RESULTS = 4
RAG_MIN_CHUNK_SIZE = 200
RAG_MAX_CHUNKS = 200
RAG_MAX_CONTEXT_CHARS = 3500
RAG_SIMILARITY_THRESHOLD = 0.45
RAG_DEBUG = false
```

### 4. Deploy (1 min)
1. **"Deploy"** tab → **"Manual deploy"**
2. Select branch: **`main`**
3. Click **"Deploy Branch"**
4. Wait 2-3 minutes

### 5. Verify
Visit: `https://ethiolegalai-backend.herokuapp.com`

Should see: `{"status":"ok","service":"EthioLegal AI API"}`

---

## ✅ Checklist

- [ ] App created on Heroku
- [ ] GitHub connected
- [ ] MongoDB URI set
- [ ] JWT_SECRET generated and set
- [ ] COOKIE_SECRET generated and set
- [ ] Gemini API key set
- [ ] Cloudinary credentials set
- [ ] CORS_ORIGIN set
- [ ] Deployed successfully
- [ ] Health check passes

---

## 🔑 Where to Get Credentials

| Service | Where to Get | What You Need |
|---------|--------------|---------------|
| **MongoDB** | https://cloud.mongodb.com | Connection string |
| **Cloudinary** | https://cloudinary.com/console | Cloud name, API key, API secret |
| **Gemini** | https://makersuite.google.com | API key |
| **JWT/Cookie Secrets** | Generate with Node.js | Random 32-byte hex string |

---

## 🎯 Generate Secrets

Open Command Prompt and run:
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run it **twice** to get:
1. JWT_SECRET
2. COOKIE_SECRET

---

## 🔄 Update Backend Later

### If Automatic Deploys Enabled:
```bash
git add .
git commit -m "Update"
git push origin main
```
Heroku auto-deploys! ✨

### Manual Deploy:
1. Push to GitHub
2. Heroku Dashboard → **"Deploy"** tab
3. Click **"Deploy Branch"**

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Application Error | Check logs: **"More"** → **"View logs"** |
| Build Failed | Check deployment log for errors |
| MongoDB Connection Failed | Add `0.0.0.0/0` to MongoDB Atlas Network Access |
| Can't access app | Check **"Resources"** tab - web dyno should be ON |

---

## 📱 Your URLs

After deployment:
- **Backend:** `https://ethiolegalai-backend.herokuapp.com`
- **API:** `https://ethiolegalai-backend.herokuapp.com/api`

**Save the API URL** - you'll need it for frontend!

---

## ⏭️ Next Step

Deploy frontend to Vercel using your backend API URL!

---

**Full Guide:** See `HEROKU_DASHBOARD_DEPLOYMENT.md` for detailed instructions.
