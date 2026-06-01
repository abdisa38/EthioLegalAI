# 🚀 Deploy Backend to Heroku (Dashboard Method)

Complete guide to deploy your backend using **Heroku Dashboard only** (no CLI needed).

**Backend Repository:** https://github.com/abdisa38/EthioLegal-Ai-Backend.git

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Heroku account created
- ✅ Backend code pushed to: https://github.com/abdisa38/EthioLegal-Ai-Backend.git
- ✅ MongoDB Atlas connection string
- ✅ Cloudinary credentials
- ✅ Google Gemini API key

---

## 🎯 Step-by-Step Deployment

### Step 1: Create Heroku App

1. Go to [Heroku Dashboard](https://dashboard.heroku.com)
2. Click **"New"** button (top right)
3. Select **"Create new app"**
4. Enter app name: `ethiolegalai-backend` (or your preferred name)
5. Choose region: **United States** or **Europe** (closer to your users)
6. Click **"Create app"**

---

### Step 2: Connect to GitHub

1. In your new app, go to the **"Deploy"** tab
2. Under **"Deployment method"**, click **"GitHub"**
3. Click **"Connect to GitHub"** button
4. Authorize Heroku to access your GitHub account (if first time)
5. In the search box, type: `EthioLegal-Ai-Backend`
6. Click **"Search"**
7. Find your repository and click **"Connect"**

✅ Your repository is now connected!

---

### Step 3: Set Environment Variables

1. Go to the **"Settings"** tab
2. Scroll down to **"Config Vars"** section
3. Click **"Reveal Config Vars"**
4. Add the following variables one by one:

#### Database Configuration
| Key | Value | Example |
|-----|-------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ethiolegalai` |

#### JWT Configuration
| Key | Value |
|-----|-------|
| `JWT_SECRET` | Generate using method below ⬇️ |
| `JWT_ACCESS_TTL` | `15m` |
| `JWT_ISSUER` | `ethiolegal-ai` |
| `JWT_AUDIENCE` | `ethiolegal-users` |
| `REFRESH_TOKEN_TTL_DAYS` | `30` |

**Generate JWT_SECRET:**
Open Command Prompt and run:
```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste as `JWT_SECRET` value.

#### Cookie Configuration
| Key | Value |
|-----|-------|
| `COOKIE_SECRET` | Generate using method above ⬆️ |
| `COOKIE_DOMAIN` | Leave empty (just add key, leave value blank) |
| `COOKIE_SAMESITE` | `none` |
| `COOKIE_SECURE` | `true` |

#### Google Gemini AI
| Key | Value |
|-----|-------|
| `GEMINI_API_KEY` | Your Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.5-flash` |
| `GEMINI_EMBED_MODEL` | `gemini-embedding-001` |

#### Cloudinary Configuration
| Key | Value |
|-----|-------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

#### RAG Configuration (Optional - Use Defaults)
| Key | Value |
|-----|-------|
| `RAG_CHUNK_SIZE` | `1000` |
| `RAG_CHUNK_OVERLAP` | `150` |
| `RAG_TOP_K` | `4` |
| `RAG_RETRIEVE_K` | `12` |
| `RAG_MAX_RESULTS` | `4` |
| `RAG_MIN_CHUNK_SIZE` | `200` |
| `RAG_MAX_CHUNKS` | `200` |
| `RAG_MAX_CONTEXT_CHARS` | `3500` |
| `RAG_SIMILARITY_THRESHOLD` | `0.45` |
| `RAG_DEBUG` | `false` |

#### CORS Configuration (Temporary)
| Key | Value |
|-----|-------|
| `CORS_ORIGIN` | `http://localhost:5173` |

**Note:** You'll update this later with your Vercel frontend URL.

---

### Step 4: Deploy Your Backend

1. Go back to the **"Deploy"** tab
2. Scroll down to **"Manual deploy"** section
3. Select branch: **`main`** (or `master` if that's your default branch)
4. Click **"Deploy Branch"**

**Wait for deployment to complete** (usually 2-3 minutes)

You'll see:
```
-----> Building on the Heroku-22 stack
-----> Using buildpack: heroku/nodejs
-----> Node.js app detected
-----> Installing dependencies
-----> Build succeeded!
-----> Launching...
       Released v1
       https://ethiolegalai-backend.herokuapp.com/ deployed to Heroku
```

---

### Step 5: Verify Deployment

1. Click **"View"** button at the bottom of the deploy log
2. Or click **"Open app"** button (top right)
3. You should see:
   ```json
   {"status":"ok","service":"EthioLegal AI API"}
   ```

✅ **Your backend is live!**

**Save your backend URL:** `https://ethiolegalai-backend.herokuapp.com`

---

### Step 6: Enable Automatic Deploys (Optional)

1. In the **"Deploy"** tab
2. Scroll to **"Automatic deploys"** section
3. Select branch: **`main`**
4. Click **"Enable Automatic Deploys"**

Now, every time you push to GitHub, Heroku will automatically deploy!

---

## 🔍 Testing Your Backend

### Test 1: Health Check
Visit: `https://ethiolegalai-backend.herokuapp.com`

**Expected response:**
```json
{"status":"ok","service":"EthioLegal AI API"}
```

### Test 2: API Health Endpoint
Visit: `https://ethiolegalai-backend.herokuapp.com/api/health`

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### Test 3: Check Logs
1. Go to **"More"** menu (top right)
2. Click **"View logs"**
3. You should see:
   ```
   EthioLegal AI API running on port 5000
   MongoDB connected successfully
   ```

---

## 🎨 Next Step: Deploy Frontend to Vercel

Now that your backend is deployed, you need to:

1. **Update CORS:** Add your Vercel frontend URL (after deploying frontend)
2. **Deploy Frontend:** Use your backend URL in frontend environment variables

---

## 🔄 Updating Your Backend

### Method 1: Automatic (Recommended)
If you enabled automatic deploys:
1. Make changes to your code locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. Heroku automatically deploys! ✨

### Method 2: Manual
1. Push changes to GitHub
2. Go to Heroku Dashboard → **"Deploy"** tab
3. Click **"Deploy Branch"** in Manual deploy section

---

## 🔧 Managing Your App

### View Logs
1. Go to **"More"** → **"View logs"**
2. Or use the Activity tab to see deployment history

### Restart App
1. Go to **"More"** → **"Restart all dynos"**

### View Metrics
1. Go to **"Metrics"** tab
2. See response times, memory usage, etc.

### Scale App (If Needed)
1. Go to **"Resources"** tab
2. Click edit icon on `web` dyno
3. Adjust dyno type (Free, Hobby $7/month, etc.)

---

## 🆘 Troubleshooting

### Issue: Application Error

**Check logs:**
1. Go to **"More"** → **"View logs"**
2. Look for error messages

**Common causes:**
- Missing environment variables
- MongoDB connection failed
- Invalid API keys

**Solution:**
1. Go to **"Settings"** → **"Config Vars"**
2. Verify all variables are set correctly
3. Restart app: **"More"** → **"Restart all dynos"**

### Issue: Build Failed

**Check build log:**
- Scroll through the deployment log
- Look for npm install errors

**Common causes:**
- Missing dependencies in package.json
- Node version incompatibility

**Solution:**
- Ensure `package.json` has all dependencies
- Check `engines` field specifies Node.js version

### Issue: MongoDB Connection Failed

**Check:**
1. MongoDB Atlas Network Access
2. Go to MongoDB Atlas → Network Access
3. Add IP: `0.0.0.0/0` (allow from anywhere)
4. Verify connection string format

### Issue: Can't Access App

**Check:**
1. App is running: **"Resources"** tab → web dyno should be ON
2. No errors in logs
3. Environment variables are set

---

## 📊 Your Backend URLs

After deployment, you'll have:

| Endpoint | URL |
|----------|-----|
| **Root** | `https://ethiolegalai-backend.herokuapp.com` |
| **API Base** | `https://ethiolegalai-backend.herokuapp.com/api` |
| **Health** | `https://ethiolegalai-backend.herokuapp.com/api/health` |
| **Auth** | `https://ethiolegalai-backend.herokuapp.com/api/auth/*` |
| **Documents** | `https://ethiolegalai-backend.herokuapp.com/api/documents/*` |
| **Chat** | `https://ethiolegalai-backend.herokuapp.com/api/chat/*` |

**Save your API base URL:** `https://ethiolegalai-backend.herokuapp.com/api`

You'll need this for your frontend deployment!

---

## ✅ Deployment Checklist

- [ ] Heroku app created
- [ ] GitHub repository connected
- [ ] All environment variables set (20+ variables)
- [ ] Backend deployed successfully
- [ ] Health check returns `{"status":"ok"}`
- [ ] Logs show no errors
- [ ] MongoDB connected successfully
- [ ] Backend URL saved for frontend

---

## 🎉 Backend Deployed Successfully!

Your backend is now live at: `https://ethiolegalai-backend.herokuapp.com`

**Next Steps:**
1. ✅ Backend deployed (You are here!)
2. ⏭️ Deploy frontend to Vercel
3. ⏭️ Update CORS_ORIGIN with frontend URL
4. ⏭️ Test complete application

---

## 📞 Quick Links

- **Your Backend Repo:** https://github.com/abdisa38/EthioLegal-Ai-Backend
- **Heroku Dashboard:** https://dashboard.heroku.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Cloudinary:** https://cloudinary.com/console
- **Google AI Studio:** https://makersuite.google.com

---

**Congratulations! Your backend is deployed! 🎉**

*Next: Deploy your frontend to Vercel and connect them together.*
