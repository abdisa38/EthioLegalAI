# EthioLegal AI 🇪🇹⚖️

An AI-powered Ethiopian legal assistant platform providing educational legal information to help citizens understand their rights.

## 🌟 Features

### Core Features
- ✨ **AI-Powered Legal Chat** - Ask legal questions in English or Amharic
- 📄 **PDF Document Upload** - Upload and analyze legal documents
- 🔍 **Contract Risk Analysis** - AI-powered contract review with risk scoring
- 👨‍⚖️ **Tenant Rights Assistant** - Understand rental rights and disputes
- 💼 **Labor Law Assistant** - Get help with employment issues
- 💬 **Chat History** - Save and retrieve previous conversations
- 🌍 **Multilingual Support** - English, Amharic, Afaan Oromo

### Technical Features
- 🔐 **Production-Grade Security** - JWT auth, refresh tokens, rate limiting
- 🧠 **RAG Architecture** - Retrieval-Augmented Generation for accurate answers
- ⚡ **Optimized Performance** - Caching, indexing, fast retrieval
- 🛡️ **OWASP Protection** - Injection prevention, XSS protection, CORS
- 📊 **Comprehensive Logging** - Security event tracking
- 🚀 **Scalable Architecture** - Ready for production deployment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│                     Deployed on Vercel                          │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS + Axios
┌──────────────▼──────────────────────────────────────────────────┐
│                 Backend (Express + Node.js)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ API Routes (Auth, Chat, Contracts, Documents, etc.)     │  │
│  │ Middleware (Auth, Validation, Rate Limit, Security)    │  │
│  │ RAG Pipeline (Chunking, Retrieval, Reranking)          │  │
│  │ AI Services (Gemini, Tenant, Labor, Contract)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                  Deployed on Render                             │
└──────────────┬──────────────┬──────────────┬────────────────────┘
               │              │              │
    ┌──────────▼─┐   ┌────────▼──────┐  ┌───▼────────────┐
    │  MongoDB   │   │  Cloudinary   │  │ Google Gemini  │
    │  (Atlas)   │   │   (Storage)   │  │  (AI Models)   │
    └────────────┘   └───────────────┘  └────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (Atlas free tier or local)
- Google Gemini API key (free)
- Cloudinary account (free)

### Installation

1. **Clone repository:**
```bash
git clone https://github.com/your-username/ethiolegal-ai.git
cd ethiolegal-ai
```

2. **Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

3. **Setup environment variables:**

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ethiolegal_ai
JWT_SECRET=your-random-secret-key
JWT_ISSUER=ethiolegal-ai
JWT_AUDIENCE=ethiolegal-ai-users
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECRET=your-cookie-secret
GEMINI_API_KEY=your-google-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=http://localhost:5173
```

4. **Start development servers:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

5. **Test the application:**
- Open http://localhost:5173
- Register a new account
- Try uploading a PDF
- Test AI chat
- Analyze a contract

---

## 📁 Project Structure

```
ethiolegal-ai/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # UI pages and components
│   │   │   ├── api/          # API service layer
│   │   │   ├── context/      # React context (auth)
│   │   │   └── routes.ts     # Route definitions
│   │   └── styles/           # Tailwind CSS, theme
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                   # Express backend
│   ├── config/               # Configuration files
│   │   ├── db.js             # MongoDB setup
│   │   ├── env.js            # Environment validation
│   │   └── cloudinary.js     # File upload config
│   ├── middleware/           # Express middleware
│   │   ├── authMiddleware.js # JWT verification
│   │   ├── validate.js       # Input validation
│   │   ├── sanitizeRequest.js # XSS prevention
│   │   └── rateLimiters.js   # Rate limiting
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Document.js
│   │   └── RefreshToken.js
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   ├── aiController.js
│   │   ├── contractController.js
│   │   └── ...
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js
│   │   ├── aiRoutes.js
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── geminiService.js  # AI integration
│   │   ├── contractAnalysisService.js
│   │   └── ...
│   ├── ai/                   # AI features
│   │   └── promptManager.js  # Centralized prompts
│   ├── rag/                  # RAG architecture
│   │   ├── ragService.js     # RAG pipeline
│   │   ├── chunkText.js      # Text chunking
│   │   ├── documentCategorizer.js
│   │   └── ...
│   ├── validators/           # Zod schemas
│   │   ├── authSchemas.js
│   │   ├── aiSchemas.js
│   │   └── ...
│   ├── server.js             # App entry point
│   └── package.json
│
├── QUICK_START.md            # Quick start guide
├── DEPLOYMENT.md             # Deployment instructions
├── GIT_COMMITS_SUMMARY.md    # Commits documentation
└── README.md                 # This file
```

---

## 🔐 Security

### Authentication Flow

```
1. User registers/login
   ↓
2. Backend generates:
   - Access token (15 min) → stored in memory
   - Refresh token (7 days) → stored in secure cookie
   ↓
3. Frontend stores access token in sessionStorage
   ↓
4. Every request includes access token in header
   ↓
5. Token expires in 15 minutes
   ↓
6. Frontend automatically refreshes using refresh token
   ↓
7. Repeat from step 2
```

### Security Features

- ✅ JWT with issuer/audience verification
- ✅ Refresh token rotation and revocation
- ✅ Secure HttpOnly cookies
- ✅ XSS prevention via input sanitization
- ✅ MongoDB injection prevention
- ✅ Rate limiting (4 tiers)
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation (Zod)
- ✅ Security event logging

### OWASP Top 10 Coverage

| Vulnerability | Mitigation |
|---------------|-----------|
| Injection | Input validation, query sanitization |
| Broken Auth | JWT refresh tokens, secure cookies |
| Sensitive Data | HTTPS headers, HttpOnly cookies |
| XML/XXE | JSON-only, no XML parsing |
| Access Control | RBAC middleware, protected routes |
| Misconfiguration | Environment validation, Helmet |
| XSS | Input sanitization, CSP headers |
| Insecure Deserialization | Request validation with Zod |
| Known Vulnerabilities | Regular dependency updates |
| Insufficient Logging | Comprehensive security logging |

---

## 🤖 AI & RAG Architecture

### How RAG Works

1. **Document Upload**
   - User uploads PDF
   - System extracts text
   - Text split into chunks

2. **Indexing**
   - Chunks converted to embeddings
   - Stored in vector database

3. **User Query**
   - User asks a question
   - Query preprocessed (detect intent, translate)

4. **Retrieval**
   - Search vector database
   - Find top-5 similar chunks
   - Apply similarity threshold filtering

5. **Reranking**
   - Score chunks by relevance
   - Boost category matches
   - Boost keyword matches

6. **Response Generation**
   - Inject relevant context
   - Add safety disclaimer
   - Generate AI response
   - Return structured answer

### Prompt Engineering

All AI responses follow structured format:

```
**Summary:** [1-2 sentence quick answer]

**Explanation:** [Detailed explanation in simple language]

**Important Notes:**
- [Key points to remember]
- [Risks to be aware of]

**Recommendations:**
- [What user should do]
- [Next steps]

**Disclaimer:** This is educational information, not legal advice.
```

### Multilingual Support

- 🇬🇧 English
- 🇪🇹 Amharic
- 🇪🇹 Afaan Oromo

---

## 📊 API Endpoints

### Authentication
```
POST   /auth/register          # Create user
POST   /auth/login             # Login user
POST   /auth/refresh           # Refresh token
POST   /auth/logout            # Logout user
```

### AI Chat
```
POST   /api/chat               # Send message
GET    /api/chat/history       # Get history
GET    /api/chat/:id           # Get specific chat
DELETE /api/chat/:id           # Delete chat
```

### Contracts
```
POST   /api/contracts/analyze  # Analyze contract
POST   /api/contracts/upload   # Upload contract
GET    /api/contracts/:id      # Get analysis
```

### Documents
```
POST   /api/documents/upload   # Upload document
GET    /api/documents          # List documents
GET    /api/documents/:id      # Get document
DELETE /api/documents/:id      # Delete document
```

### Tenant Rights
```
POST   /api/tenant/assist      # Get tenant help
```

### Labor Law
```
POST   /api/labor/assist       # Get labor help
```

---

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd ../frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd ../frontend
npm run build
```

### Code Quality

```bash
# Linting (if available)
npm run lint

# Type checking (if using TypeScript)
npm run type-check
```

---

## 📦 Dependencies

### Backend

**Core:**
- `express` - Web framework
- `mongoose` - MongoDB ORM
- `jsonwebtoken` - JWT handling
- `bcryptjs` - Password hashing

**AI & RAG:**
- `@google/generative-ai` - Gemini API
- `pdf-parse` - PDF text extraction
- `langchain` - RAG framework

**Security:**
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `zod` - Input validation
- `xss` - XSS prevention
- `cookie-parser` - Signed cookies

**File Storage:**
- `multer` - File uploads
- `cloudinary` - Cloud storage

### Frontend

- `react` - UI library
- `vite` - Build tool
- `tailwindcss` - Styling
- `axios` - HTTP client
- `react-router` - Navigation
- `shadcn/ui` - UI components

---

## 🚀 Deployment

### Quick Deployment

1. **Backend to Render:**
   - Push to GitHub
   - Connect Render.com
   - Add environment variables
   - Deploy

2. **Frontend to Vercel:**
   - Push to GitHub
   - Connect Vercel
   - Set `VITE_API_URL`
   - Deploy

See `DEPLOYMENT.md` for detailed instructions.

### Environment Variables Required

**Production (.env):**
- `NODE_ENV=production`
- `JWT_SECRET` - Strong random string
- `MONGODB_URI` - MongoDB Atlas connection
- `GEMINI_API_KEY` - Google API key
- `CLOUDINARY_*` - Image storage credentials
- `CORS_ORIGIN` - Frontend domain
- All RAG tuning parameters

---

## 📈 Performance Metrics

| Metric | Target | Status |
|--------|--------|--------|
| AI Response | <3s | ✅ |
| Document Upload | <10MB | ✅ |
| Chat Load | <1s | ✅ |
| RAG Retrieval | <2s | ✅ |

---

## 🐛 Troubleshooting

### Backend Issues

**Error: Cannot find module 'cookie-parser'**
- Solution: Run `npm install` in backend folder

**Error: MongoDB connection refused**
- Solution: Check MongoDB is running (local or Atlas)
- Check connection string in `.env`

**Error: CORS error**
- Solution: Update `CORS_ORIGIN` to match frontend URL

### Frontend Issues

**Error: API request fails**
- Solution: Check `VITE_API_URL` in `.env.production`
- Check backend is running

**Error: Login token doesn't work**
- Solution: Clear browser localStorage
- Try again after backend restart

---

## 📝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push branch: `git push origin feature/your-feature`
5. Submit pull request

---

## ⚠️ DISCLAIMER

**EthioLegal AI provides EDUCATIONAL information only.** It is NOT a substitute for professional legal advice. Always consult with a qualified lawyer before taking any legal action.

---

## 📄 License

MIT License - See LICENSE file

---

## 👨‍💻 Author

Built with ❤️ using AI and modern web technologies.

---

## 🤝 Support

- 📧 Email: support@ethiolegalai.com
- 🐙 GitHub Issues: https://github.com/your-username/ethiolegal-ai/issues
- 📖 Documentation: See DEPLOYMENT.md and QUICK_START.md

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-user document collaboration
- [ ] AI confidence scoring UI
- [ ] Export to PDF reports
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Social login (Google)
- [ ] Real-time chat with WebSockets

---

**Made with 🇪🇹 for Ethiopia**

*An open-source project to democratize legal knowledge for Ethiopian citizens.*
