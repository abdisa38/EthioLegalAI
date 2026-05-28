# EthioLegal AI - Quick Start Guide

## ERROR: Missing Dependencies

You are seeing this error because `npm install` has not been run yet:

```
Error: Cannot find module 'cookie-parser'
```

## SOLUTION: Install Dependencies

### Option 1: Using Command Prompt (Recommended)

1. **Open Command Prompt** (Press `Win + R`, type `cmd`, press Enter)

2. **Navigate to the project folder:**
   ```
   cd C:\Users\SPARK COMPUTERS MART\Videos\EthioLegalAI\EthioLegalAI
   ```

3. **Install Backend Dependencies:**
   ```
   cd backend
   npm install
   ```
   
   This will take 2-5 minutes. Wait for it to complete. You should see:
   ```
   added XXX packages
   ```

4. **Install Frontend Dependencies:**
   ```
   cd ..\frontend
   npm install
   ```

5. **Go back to root:**
   ```
   cd ..
   ```

### Option 2: Using the Batch Script

Double-click the `install-deps.bat` file in the project root folder to run both installations automatically.

---

## AFTER INSTALLATION: Running the Application

### Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 5000
Connected to MongoDB
```

### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v... ready in XXX ms
Local: http://localhost:5173/
```

---

## ENVIRONMENT SETUP

Before running the backend, create a `.env` file in the `backend/` folder:

### Option A: Minimal Setup (Testing Locally)

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ethiolegal_ai
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ISSUER=ethiolegal-ai
JWT_AUDIENCE=ethiolegal-ai-users
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECRET=your-cookie-secret-change-this
GEMINI_API_KEY=your-google-gemini-api-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
CORS_ORIGIN=http://localhost:5173
```

### Option B: Using MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up free account
3. Create a cluster
4. Get connection string
5. Replace `MONGODB_URI` with your connection string

### Option C: Get API Keys

1. **Google Gemini API:**
   - Go to https://aistudio.google.com/app/apikey
   - Create API key
   - Paste in `GEMINI_API_KEY`

2. **Cloudinary:**
   - Go to https://cloudinary.com/
   - Sign up free
   - Get API credentials from dashboard

---

## TEST THE SETUP

### Test 1: Backend Health Check

Once backend is running, open your browser and go to:
```
http://localhost:5000/health
```

You should see:
```json
{"status": "ok"}
```

### Test 2: Register a New User

Using **Postman** or **curl**:

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "userId": "...",
  "accessToken": "..."
}
```

### Test 3: Open Frontend

Go to: `http://localhost:5173/`

You should see the EthioLegal AI landing page.

---

## COMMON ISSUES

### Issue 1: `npm install` not found
**Solution:** Install Node.js from https://nodejs.org/

### Issue 2: MongoDB connection error
**Solution:** Either install MongoDB locally or use MongoDB Atlas (cloud)

### Issue 3: Port 5000 already in use
**Solution:** Change PORT in `.env` to 5001 or kill the process using port 5000

### Issue 4: GEMINI_API_KEY error
**Solution:** Get free API key from https://aistudio.google.com/app/apikey

---

## FILE TREE AFTER INSTALLATION

```
EthioLegalAI/
├── backend/
│   ├── node_modules/          ← Created by npm install
│   ├── .env                   ← Create this file with your secrets
│   ├── server.js
│   ├── package.json
│   └── ... (other backend files)
│
├── frontend/
│   ├── node_modules/          ← Created by npm install
│   ├── package.json
│   └── ... (other frontend files)
│
└── README.md
```

---

## NEXT STEPS

1. ✅ Run `npm install` in backend and frontend
2. ✅ Create `.env` file in backend
3. ✅ Start backend with `npm run dev`
4. ✅ Start frontend with `npm run dev`
5. ✅ Test login/register
6. ✅ Upload a PDF document
7. ✅ Test AI chat
8. 📋 Deploy to production (see DEPLOYMENT.md)

---

## PROJECT STRUCTURE

- **Backend:** Express.js + MongoDB + Gemini AI
- **Frontend:** React + Vite + Tailwind CSS
- **Database:** MongoDB (Atlas or local)
- **Storage:** Cloudinary
- **AI:** Google Gemini API

## FEATURES IMPLEMENTED

✅ User authentication with JWT
✅ Refresh token rotation
✅ AI-powered legal chat
✅ Contract risk analysis
✅ PDF document upload
✅ Tenant rights assistant
✅ Labor law assistant
✅ RAG (Retrieval-Augmented Generation)
✅ Multilingual support (English, Amharic, Afaan Oromo)
✅ Production-grade security

---

**Need help?** Check the backend/server.js logs for detailed error messages.
