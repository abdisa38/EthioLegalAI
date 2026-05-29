# 🚀 Setup Guide

Complete guide to setting up EthioLegalAI for local development.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [External Services](#external-services)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Download |
|----------|----------------|----------|
| Node.js | 18.0.0 | [nodejs.org](https://nodejs.org/) |
| npm | 9.0.0 | Included with Node.js |
| MongoDB | 6.0 | [mongodb.com](https://www.mongodb.com/try/download/community) |
| Git | 2.30+ | [git-scm.com](https://git-scm.com/) |

### Optional Software

| Software | Purpose | Download |
|----------|---------|----------|
| Docker | ChromaDB (RAG) | [docker.com](https://www.docker.com/) |
| MongoDB Compass | Database GUI | [mongodb.com/compass](https://www.mongodb.com/products/compass) |
| Postman | API testing | [postman.com](https://www.postman.com/) |

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB free space
- **Internet**: Required for API keys and cloud services

---

## Local Development Setup

### 1. Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/ethiolegal-ai.git

# Or via SSH
git clone git@github.com:yourusername/ethiolegal-ai.git

# Navigate to project directory
cd ethiolegal-ai
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

**Expected output:**
```
added 245 packages in 15s
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**Expected output:**
```
added 1234 packages in 30s
```

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` file:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# DATABASE
# ============================================
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ethiolegal_ai

# Or MongoDB Atlas (recommended)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ethiolegal_ai?retryWrites=true&w=majority

# ============================================
# JWT AUTHENTICATION
# ============================================
# Generate strong secrets: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-64-chars-minimum
JWT_ISSUER=ethiolegal-ai
JWT_AUDIENCE=ethiolegal-ai-users
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECRET=your-cookie-secret-key-change-in-production-use-32-chars-minimum

# ============================================
# AI SERVICES
# ============================================
# Get free API key: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your-google-gemini-api-key-here

# ============================================
# FILE STORAGE (CLOUDINARY)
# ============================================
# Sign up: https://cloudinary.com/users/register/free
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ============================================
# RAG CONFIGURATION (OPTIONAL)
# ============================================
# ChromaDB URL (if using Docker: http://localhost:8000)
CHROMA_URL=http://localhost:8000

# RAG Parameters (defaults shown)
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=150
RAG_MIN_CHUNK_SIZE=200
RAG_MAX_CHUNKS=200
RAG_RETRIEVE_K=12
RAG_TOP_K=4
RAG_MAX_RESULTS=4
RAG_MAX_CONTEXT_CHARS=3500
RAG_SIMILARITY_THRESHOLD=0.45
RAG_DEBUG=false

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:5173

# ============================================
# RATE LIMITING (OPTIONAL)
# ============================================
# Uncomment to customize rate limits
# AUTH_RATE_LIMIT_WINDOW_MS=900000
# AUTH_RATE_LIMIT_MAX=5
# AI_RATE_LIMIT_WINDOW_MS=60000
# AI_RATE_LIMIT_MAX=10
```

### Frontend Environment Variables

Create `frontend/.env`:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Optional: Analytics
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## Database Setup

### Option 1: Local MongoDB

#### Install MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
1. Download installer from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer and select "Complete" installation
3. Install as Windows Service
4. MongoDB will start automatically

#### Verify MongoDB is Running

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Expected output:
# { ok: 1 }
```

#### Initialize Database

```bash
cd backend
npm run db:init
```

This script will:
- Create database and collections
- Set up indexes
- Create default admin user (if configured)

### Option 2: MongoDB Atlas (Cloud)

#### Create Free Cluster

1. Sign up at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Create a free M0 cluster (512MB storage)
3. Choose a cloud provider and region (closest to you)
4. Wait 3-5 minutes for cluster creation

#### Configure Network Access

1. Go to "Network Access" in Atlas dashboard
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (for development)
   - Or add your specific IP address for better security

#### Create Database User

1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `ethiolegal_admin`
5. Password: Generate strong password
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

#### Get Connection String

1. Go to "Database" → "Connect"
2. Select "Connect your application"
3. Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your credentials
5. Add database name: `/ethiolegal_ai` before the `?`
6. Update `MONGODB_URI` in `backend/.env`

---

## External Services

### 1. Google Gemini API

#### Get API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key
5. Add to `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```

#### Verify API Key

```bash
cd backend
node -e "
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
model.generateContent('Hello').then(r => console.log('✓ Gemini API working'));
"
```

### 2. Cloudinary (File Storage)

#### Create Account

1. Sign up at [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Verify email address
3. Go to Dashboard

#### Get Credentials

1. Find "Account Details" section
2. Copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add to `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
   ```

#### Create Upload Preset (Optional)

1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Preset name: `ethiolegal_documents`
5. Signing Mode: "Signed"
6. Folder: `ethiolegal`
7. Save

### 3. ChromaDB (Vector Store - Optional)

ChromaDB is optional but required for RAG features (document-based chat).

#### Option A: Docker (Recommended)

```bash
# Pull ChromaDB image
docker pull chromadb/chroma

# Run ChromaDB container
docker run -d \
  --name chromadb \
  -p 8000:8000 \
  -v chroma-data:/chroma/chroma \
  chromadb/chroma

# Verify it's running
curl http://localhost:8000/api/v1/heartbeat
# Expected: {"nanosecond heartbeat": ...}
```

#### Option B: Python Installation

```bash
# Install Python 3.10+
python3 --version

# Install ChromaDB
pip install chromadb

# Run ChromaDB server
chroma run --host localhost --port 8000
```

#### Update Environment

```env
CHROMA_URL=http://localhost:8000
```

---

## Running the Application

### Start All Services

#### Terminal 1: MongoDB (if local)
```bash
# macOS/Linux
mongod --dbpath ~/data/db

# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath C:\data\db
```

#### Terminal 2: ChromaDB (if using Docker)
```bash
docker start chromadb
```

#### Terminal 3: Backend
```bash
cd backend
npm run dev
```

**Expected output:**
```
[nodemon] starting `node server.js`
✓ MongoDB connected: localhost
✓ Server running on port 5000
✓ Environment: development
```

#### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```

**Expected output:**
```
VITE v6.3.0  ready in 450 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

---

## Verification Checklist

### Backend Health Check

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "EthioLegal AI API",
  "database": "connected"
}
```

### Test User Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Test AI Chat (after login)

```bash
# 1. Login and get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  | jq -r '.data.accessToken')

# 2. Send chat message
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "message": "What are tenant rights in Ethiopia?",
    "language": "en"
  }'
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`

**Solution:**
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# For Atlas: Verify username/password in connection string
# For local: Ensure no authentication is required or create user
```

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
```bash
# Start MongoDB service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

### Gemini API Issues

**Error:** `API key not valid`

**Solution:**
1. Verify API key in `.env` file
2. Check for extra spaces or quotes
3. Generate new API key at [makersuite.google.com](https://makersuite.google.com/app/apikey)

**Error:** `429 Resource has been exhausted`

**Solution:**
- Free tier quota exceeded
- Wait for quota reset (daily)
- Or upgrade to paid tier

### Cloudinary Upload Issues

**Error:** `Invalid cloud_name`

**Solution:**
- Verify `CLOUDINARY_CLOUD_NAME` in `.env`
- Check Dashboard for correct cloud name

**Error:** `Upload failed: Unauthorized`

**Solution:**
- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Regenerate credentials if needed

### ChromaDB Connection Issues

**Error:** `ECONNREFUSED localhost:8000`

**Solution:**
```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# If not running:
docker start chromadb

# Or restart:
docker restart chromadb
```

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
# macOS/Linux:
lsof -i :5000
kill -9 <PID>

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in backend/.env:
PORT=5001
```

### Frontend Build Issues

**Error:** `Module not found: Can't resolve '@/lib/utils'`

**Solution:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
2. Ensure frontend is running on `http://localhost:5173`
3. Restart backend after changing `.env`

---

## Development Tips

### Hot Reload

- **Backend**: Uses `nodemon` - auto-restarts on file changes
- **Frontend**: Uses Vite HMR - instant updates without refresh

### Database GUI

**MongoDB Compass:**
```
Connection String: mongodb://localhost:27017
Database: ethiolegal_ai
```

### API Testing

**Postman Collection:**
1. Import `docs/postman_collection.json` (if available)
2. Set environment variable: `API_URL=http://localhost:5000/api`
3. Test all endpoints

### Debugging

**Backend:**
```bash
# Enable debug logs
export DEBUG=*
npm run dev

# Or in .env:
NODE_ENV=development
RAG_DEBUG=true
```

**Frontend:**
```bash
# Open browser DevTools
# Check Console for errors
# Check Network tab for API calls
```

---

## Next Steps

- ✅ Setup complete? → [Read API Documentation](./API.md)
- 🏗️ Understand architecture? → [Architecture Guide](./ARCHITECTURE.md)
- 🚀 Ready to deploy? → [Deployment Guide](./DEPLOYMENT.md)
- 🤝 Want to contribute? → [Contributing Guidelines](../CONTRIBUTING.md)

---

## Getting Help

- **Documentation**: [docs/README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ethiolegal-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ethiolegal-ai/discussions)
- **Email**: support@ethiolegal-ai.com
