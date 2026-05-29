# 🇪🇹 EthioLegalAI

<div align="center">

![EthioLegalAI Banner](./docs/assets/banner.png)

**Democratizing Legal Knowledge in Ethiopia Through AI**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.3-blue)](https://reactjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[Live Demo](https://ethiolegal-ai.vercel.app) • [Documentation](./docs/README.md) • [API Reference](./docs/API.md) • [Architecture](./docs/ARCHITECTURE.md)

</div>

---

## 🌟 Overview

**EthioLegalAI** is a production-grade, multilingual AI legal assistant that empowers Ethiopian citizens to understand their legal rights. Built with a sophisticated **Retrieval-Augmented Generation (RAG)** architecture, it provides accurate, context-aware legal guidance grounded in Ethiopian law.

### 🎯 The Problem

In Ethiopia, legal services are expensive and inaccessible to most citizens. Language barriers, complex legal jargon, and lack of legal literacy leave millions vulnerable to exploitation in rental agreements, employment contracts, and legal disputes.

### 💡 The Solution

An AI-powered platform that:
- **Speaks Your Language**: English, Amharic (አማርኛ), and Afaan Oromo support
- **Understands Context**: RAG system grounds responses in your uploaded legal documents
- **Provides Accurate Guidance**: References Ethiopian Civil Code, Labor Proclamation, and Housing laws
- **Analyzes Contracts**: Automated risk assessment with actionable recommendations
- **Accessible 24/7**: Free legal education at your fingertips

---

## ✨ Key Features

### 🤖 AI-Powered Legal Assistance
- **Intelligent Chat**: RAG-enhanced Q&A with document context and source attribution
- **Contract Risk Analysis**: Automated review with 0-100 risk scoring and clause-by-clause breakdown
- **Specialized Assistants**: Dedicated modules for Tenant Rights and Labor Law
- **Multilingual Support**: Seamless switching between English, Amharic, and Afaan Oromo

### 📄 Document Intelligence
- **PDF Processing**: Upload legal documents for instant text extraction and analysis
- **Smart Chunking**: Optimized text segmentation (1000 chars, 150 overlap) for precise retrieval
- **Semantic Search**: Vector similarity search with category-aware reranking
- **Source Tracking**: Every AI response includes document references with relevance scores

### 🔒 Enterprise-Grade Security
- **JWT Authentication**: Access + refresh token rotation with family tracking
- **Account Protection**: Rate limiting, account locking after 5 failed attempts
- **OWASP Compliance**: XSS prevention, CORS protection, Helmet security headers
- **Audit Trails**: Comprehensive activity logging for security monitoring

### 📊 Analytics & Engagement
- **Usage Tracking**: Token consumption, response times, AI confidence scores
- **User Analytics**: Engagement metrics, milestones, gamification
- **Quality Feedback**: Star ratings and feedback collection for continuous improvement

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  Frontend (React + TypeScript)                   │
│              Vite • Tailwind CSS • React Query                  │
│                     Deployed on Vercel                          │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS REST API (Axios)
┌──────────────▼──────────────────────────────────────────────────┐
│                Backend (Node.js + Express)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🛡️  Security Layer (Auth, Rate Limit, Validation)      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  🔌  API Routes (REST endpoints)                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  🧠  AI Services (Prompt Management, Gemini Integration) │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  📚  RAG Pipeline (Chunking → Embedding → Retrieval)     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  💾  Data Layer (Mongoose ODM, Query Optimization)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                    Deployed on Render                           │
└──────────────┬──────────────┬──────────────┬────────────────────┘
               │              │              │
    ┌──────────▼─┐   ┌────────▼──────┐  ┌───▼────────────┐
    │  MongoDB   │   │  ChromaDB     │  │ Google Gemini  │
    │  (Atlas)   │   │ (Vector Store)│  │  (AI Models)   │
    └────────────┘   └───────────────┘  └────────────────┘
                              │
                     ┌────────▼──────┐
                     │  Cloudinary   │
                     │ (PDF Storage) │
                     └───────────────┘
```

### RAG Pipeline Deep Dive

```
┌─────────────────────────────────────────────────────────────────┐
│                      Document Ingestion                          │
└─────────────────────────────────────────────────────────────────┘
    PDF Upload → Text Extraction (pdf-parse) → Text Cleaning
         ↓
    Chunking (RecursiveCharacterTextSplitter)
    • Chunk Size: 1000 chars
    • Overlap: 150 chars
    • Min Size: 200 chars
         ↓
    Embedding (Gemini embedding-001)
    • 768-dimensional vectors
         ↓
    ChromaDB Storage
    • Metadata: userId, documentId, category, chunkIndex

┌─────────────────────────────────────────────────────────────────┐
│                      Query Processing                            │
└─────────────────────────────────────────────────────────────────┘
    User Query → Query Preprocessing
    • Intent Detection (Tenant/Labor/Contract/General)
    • Keyword Extraction
    • Query Normalization
         ↓
    Embedding → Vector Search (ChromaDB)
    • Retrieve Top 12 chunks
    • Filter by userId + category
         ↓
    Context Reranking
    • Similarity Threshold: 0.45
    • Category Match Boost: +0.15
    • Keyword Match Boost: +0.02 per keyword
    • Select Top 4 chunks (max 3500 chars)
         ↓
    Prompt Injection → Gemini Response
    • Model: gemini-2.5-flash
    • Temperature: 0.2 (deterministic)
    • TopP: 0.9
         ↓
    Structured Formatting
    • Markdown sections: Summary, Explanation, Notes, Risks, Recommendations
    • Source Attribution with relevance scores
```

**Learn More**: [Architecture Documentation](./docs/ARCHITECTURE.md)

---

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.19
- **Database**: MongoDB 8.6 (Mongoose ODM)
- **Vector Store**: ChromaDB (RAG embeddings)
- **AI/ML**: Google Gemini API (gemini-2.5-flash, gemini-embedding-001)
- **File Storage**: Cloudinary
- **Security**: JWT, bcrypt, Helmet, express-rate-limit
- **Validation**: Zod schemas
- **PDF Processing**: pdf-parse
- **Text Splitting**: LangChain RecursiveCharacterTextSplitter

### Frontend
- **Framework**: React 18.3 + TypeScript
- **Build Tool**: Vite 6.3
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Radix UI, Material-UI 7.3
- **State Management**: @tanstack/react-query 5.55
- **HTTP Client**: Axios 1.7
- **Routing**: React Router 7.13
- **Forms**: React Hook Form 7.55 + Zod validation
- **Icons**: Lucide React

### DevOps & Infrastructure
- **Deployment**: Render (backend), Vercel (frontend)
- **Database Hosting**: MongoDB Atlas
- **CI/CD**: GitHub Actions (planned)
- **Monitoring**: Morgan logging, custom analytics

---

## 📦 Quick Start

### Prerequisites

```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB (Atlas account or local instance)

# API Keys (all free tier available)
Google Gemini API Key
Cloudinary Account
ChromaDB Server (optional for RAG)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ethiolegal-ai.git
cd ethiolegal-ai
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configure environment variables**

**Backend** (`backend/.env`):
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ethiolegal_ai

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ISSUER=ethiolegal-ai
JWT_AUDIENCE=ethiolegal-ai-users
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECRET=your-cookie-secret-key

# AI Services
GEMINI_API_KEY=your-google-gemini-api-key

# File Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# RAG Configuration (optional - for document-based chat)
CHROMA_URL=http://localhost:8000
RAG_CHUNK_SIZE=1000
RAG_CHUNK_OVERLAP=150
RAG_TOP_K=4
RAG_RETRIEVE_K=12
RAG_SIMILARITY_THRESHOLD=0.45

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Initialize the database**
```bash
cd backend
npm run db:init
```

5. **Start development servers**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - ChromaDB (optional, for RAG features)
docker run -p 8000:8000 chromadb/chroma
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/api/health

---

## 📖 Usage Examples

### 1. General Legal Chat
```javascript
POST /api/ai/chat
{
  "message": "What are my rights as a tenant in Ethiopia?",
  "language": "en"
}
```

### 2. Document Upload & Analysis
```javascript
// Upload PDF
POST /api/documents/upload
Content-Type: multipart/form-data
{
  "file": <PDF file>,
  "category": "Rental"
}

// Chat with document context
POST /api/ai/chat
{
  "message": "Summarize the key terms of my rental agreement",
  "language": "en"
}
```

### 3. Contract Risk Analysis
```javascript
POST /api/contracts/analyze
{
  "documentId": "doc_123",
  "language": "en"
}

// Response includes:
// - Risk score (0-100)
// - Clause-by-clause breakdown
// - Timeline extraction
// - Suggested actions
```

**Full API Documentation**: [API Reference](./docs/API.md)

---

## 🎨 Screenshots

<div align="center">

### Landing Page
![Landing Page](./docs/assets/screenshots/landing.png)

### AI Chat Interface
![Chat Interface](./docs/assets/screenshots/chat.png)

### Contract Analysis
![Contract Analysis](./docs/assets/screenshots/contract-analysis.png)

### Multilingual Support
![Multilingual](./docs/assets/screenshots/multilingual.png)

</div>

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

---

## 🚢 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy command: `npm start`

### Frontend (Vercel)

1. Import project to Vercel
2. Set environment variables
3. Deploy automatically on push to main

**Detailed Guide**: [Deployment Documentation](./docs/DEPLOYMENT.md)

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ethiopian Legal Framework**: Civil Code, Labor Proclamation No. 1156/2019, Housing Proclamations
- **AI Technology**: Google Gemini API
- **Open Source Community**: LangChain, ChromaDB, and all our dependencies

---

## 📧 Contact

**Project Maintainer**: Your Name

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

**Project Link**: [https://github.com/yourusername/ethiolegal-ai](https://github.com/yourusername/ethiolegal-ai)

---

<div align="center">

**Built with ❤️ for Ethiopia**

*Empowering citizens through accessible legal knowledge*

</div>
