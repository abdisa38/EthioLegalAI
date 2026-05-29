# 🏗️ EthioLegalAI Architecture

## Table of Contents
- [System Overview](#system-overview)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [RAG Pipeline](#rag-pipeline)
- [Database Schema](#database-schema)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## System Overview

EthioLegalAI is a full-stack MERN application with a sophisticated RAG (Retrieval-Augmented Generation) pipeline for context-aware legal assistance.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  React 18 + TypeScript + Tailwind CSS + React Query            │
│  Deployed on Vercel (CDN + Edge Functions)                     │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS REST API
               │ JWT Authentication
               │ Rate Limited
┌──────────────▼──────────────────────────────────────────────────┐
│                      Application Layer                           │
│  Node.js + Express + Middleware Stack                          │
│  Deployed on Render (Auto-scaling)                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────────┬────────────────┐
    │          │          │              │                │
┌───▼───┐  ┌──▼───┐  ┌───▼────┐  ┌──────▼──────┐  ┌────▼─────┐
│MongoDB│  │Chroma│  │Gemini  │  │ Cloudinary  │  │  Cache   │
│Atlas  │  │  DB  │  │   AI   │  │   Storage   │  │ (Future) │
└───────┘  └──────┘  └────────┘  └─────────────┘  └──────────┘
```

### Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Query, Axios |
| **Backend** | Node.js 18+, Express 4.19, Mongoose 8.6 |
| **Database** | MongoDB Atlas (Primary), ChromaDB (Vector Store) |
| **AI/ML** | Google Gemini API (gemini-2.5-flash, gemini-embedding-001) |
| **Storage** | Cloudinary (PDF documents) |
| **Security** | JWT, bcrypt, Helmet, express-rate-limit, Zod |
| **DevOps** | Render, Vercel, GitHub, Docker (ChromaDB) |

---

## Backend Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                      Middleware Layer                            │
│  • CORS & Security (Helmet)                                     │
│  • Authentication (JWT Verification)                            │
│  • Rate Limiting (4-tier system)                                │
│  • Request Validation (Zod schemas)                             │
│  • Sanitization (XSS prevention)                                │
│  • Error Handling (Centralized)                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                       Routing Layer                              │
│  /api/auth       - Authentication endpoints                     │
│  /api/ai         - AI chat endpoints                            │
│  /api/documents  - Document management                          │
│  /api/chats      - Chat history                                 │
│  /api/contracts  - Contract analysis                            │
│  /api/assistants - Specialized assistants                       │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                     Controller Layer                             │
│  • Request parsing & validation                                 │
│  • Business logic orchestration                                 │
│  • Response formatting                                          │
│  • Error handling                                               │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                      Service Layer                               │
│  • AI Services (Prompt management, Gemini integration)          │
│  • RAG Services (Chunking, embedding, retrieval)                │
│  • Document Services (PDF processing, categorization)           │
│  • Auth Services (Token generation, validation)                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                       Data Layer                                 │
│  • Mongoose Models (User, Document, Chat, etc.)                │
│  • Query Optimization (Indexes, lean queries)                   │
│  • Schema Plugins (Soft delete, pagination, validation)         │
│  • Vector Store (ChromaDB integration)                          │
└─────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── server.js                 # Application entry point
├── config/                   # Configuration files
│   ├── db.js                # MongoDB connection
│   ├── env.js               # Environment validation
│   └── cloudinary.js        # Cloudinary setup
├── middleware/               # Express middleware
│   ├── authMiddleware.js    # JWT verification
│   ├── rateLimiters.js      # Rate limiting (4 tiers)
│   ├── validate.js          # Zod schema validation
│   ├── sanitizeRequest.js   # XSS prevention
│   └── errorHandler.js      # Centralized error handling
├── routes/                   # API route definitions
│   ├── index.js             # Route aggregator
│   ├── authRoutes.js        # Authentication
│   ├── aiRoutes.js          # AI chat
│   ├── documentRoutes.js    # Document management
│   ├── chatRoutes.js        # Chat history
│   ├── contractRoutes.js    # Contract analysis
│   ├── tenantAssistantRoutes.js
│   └── laborAssistantRoutes.js
├── controllers/              # Request handlers
│   ├── authController.js
│   ├── aiController.js
│   ├── documentController.js
│   ├── chatController.js
│   └── contractController.js
├── models/                   # Mongoose schemas
│   ├── User.js              # User model
│   ├── Document.js          # Document model
│   ├── Chat.js              # Chat model
│   ├── Activity.js          # Activity logs
│   ├── AIUsage.js           # AI usage tracking
│   ├── UserAnalytics.js     # User analytics
│   └── RefreshToken.js      # Token management
├── ai/                       # AI prompt management
│   ├── promptManager.js     # Prompt compiler
│   ├── promptTemplates.js   # Template definitions
│   └── systemPrompt.js      # System instructions
├── rag/                      # RAG pipeline
│   ├── ragService.js        # Main RAG orchestrator
│   ├── chunkText.js         # Text chunking
│   ├── vectorStore.js       # ChromaDB integration
│   ├── queryPreprocessor.js # Query analysis
│   ├── contextReranker.js   # Result reranking
│   └── documentCategorizer.js
├── services/                 # Business logic
│   ├── embeddingService.js  # Gemini embeddings
│   ├── aiService.js         # Gemini chat
│   └── pdfService.js        # PDF processing
└── utils/                    # Utilities
    ├── baseSchema.js        # Mongoose plugins
    └── queryOptimizer.js    # Query helpers
```

---

## Frontend Architecture

### Component Architecture

```
frontend/
├── src/
│   ├── app/                  # Application core
│   │   ├── components/       # Reusable components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── DocumentsPage.tsx
│   │   │   ├── ContractAnalysisPage.tsx
│   │   │   └── AuthPage.tsx
│   │   └── hooks/            # Custom React hooks
│   │       ├── useAuth.ts
│   │       ├── useChat.ts
│   │       └── useDocuments.ts
│   ├── lib/                  # Utilities
│   │   ├── api.ts           # Axios instance
│   │   ├── queryClient.ts   # React Query config
│   │   └── utils.ts         # Helper functions
│   ├── types/                # TypeScript types
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── index.ts
│   └── styles/               # Global styles
│       └── globals.css
└── index.html
```

### State Management Strategy

- **Server State**: React Query (TanStack Query)
  - Automatic caching
  - Background refetching
  - Optimistic updates
  - Pagination support

- **Client State**: React Context + useState
  - Authentication state
  - UI preferences
  - Language selection

- **Form State**: React Hook Form + Zod
  - Type-safe validation
  - Performance optimization

---

## RAG Pipeline

### Document Ingestion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. PDF Upload                                                    │
│    • User uploads PDF via /api/documents/upload                 │
│    • Multer middleware handles multipart/form-data              │
│    • File size limit: 10MB                                      │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 2. Storage & Text Extraction                                     │
│    • Upload to Cloudinary (secure_url, public_id)               │
│    • Download buffer for processing                             │
│    • Extract text using pdf-parse library                       │
│    • Clean extracted text (remove extra whitespace)             │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 3. Document Categorization                                       │
│    • Analyze filename + content keywords                        │
│    • Categories: Rental, Labor, Contract, Notice, General       │
│    • Store category in metadata                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 4. Text Chunking                                                 │
│    • LangChain RecursiveCharacterTextSplitter                   │
│    • Chunk size: 1000 characters                                │
│    • Overlap: 150 characters (context preservation)             │
│    • Min chunk size: 200 characters (filter noise)              │
│    • Deduplication by normalized text hash                      │
│    • Limit: 200 chunks per document                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 5. Embedding Generation                                          │
│    • Model: gemini-embedding-001                                │
│    • Batch processing for efficiency                            │
│    • Output: 768-dimensional vectors                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 6. Vector Storage                                                │
│    • Store in ChromaDB collection: "ethiolegalai"               │
│    • Metadata: userId, documentId, filename, chunkIndex,        │
│      category, chunkHash, chunkLength                           │
│    • Unique ID: {documentId}_{chunkIndex}_{uuid}                │
└─────────────────────────────────────────────────────────────────┘
```

### Query Processing Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Query                                                    │
│    • POST /api/ai/chat                                          │
│    • Body: { message, language }                                │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 2. Query Preprocessing                                           │
│    • Intent Detection (Tenant/Labor/Contract/General)           │
│    • Keyword Extraction (legal terms, entities)                 │
│    • Query Normalization (lowercase, trim)                      │
│    • Output: { normalizedQuery, predictedCategory, keywords }   │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 3. Query Embedding                                               │
│    • Enhance query with predicted category                      │
│    • Generate embedding: gemini-embedding-001                   │
│    • Output: 768-dimensional vector                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 4. Vector Similarity Search                                      │
│    • Query ChromaDB with embedding                              │
│    • Filter: userId + category (if predicted)                   │
│    • Retrieve top 12 chunks (RAG_RETRIEVE_K)                    │
│    • Include: documents, metadatas, distances                   │
│    • Fallback: If <3 results, retry without category filter     │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 5. Context Reranking                                             │
│    • Convert L2 distance to similarity: 1/(1+distance)          │
│    • Filter by threshold: similarity >= 0.45                    │
│    • Apply boosts:                                              │
│      - Category match: +0.15                                    │
│      - Keyword match: +0.02 per keyword (max +0.1)              │
│    • Sort by final score (descending)                           │
│    • Select top 4 chunks (RAG_TOP_K)                            │
│    • Respect max context length: 3500 chars                     │
│    • Deduplicate by normalized text                             │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 6. Prompt Construction                                           │
│    • System Instruction:                                        │
│      - Ethiopian law focus                                      │
│      - Language-specific style guidelines                       │
│      - Structured response format (5 sections)                  │
│      - Educational disclaimer                                   │
│    • User Prompt:                                               │
│      - Verified legal context (selected chunks)                 │
│      - Source attribution                                       │
│      - User question                                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 7. AI Generation                                                 │
│    • Model: gemini-2.5-flash                                    │
│    • Temperature: 0.2 (deterministic)                           │
│    • TopP: 0.9                                                  │
│    • Max tokens: 2048                                           │
│    • Fallback chain: gemini-flash-latest → gemini-2.0-flash    │
└──────────────┬──────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────────┐
│ 8. Response Formatting                                           │
│    • Parse markdown sections                                    │
│    • Attach source metadata (filename, relevance score)         │
│    • Save to Chat model (question, answer, sources)             │
│    • Track AI usage (tokens, response time, confidence)         │
│    • Return to client                                           │
└─────────────────────────────────────────────────────────────────┘
```

### RAG Configuration Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `RAG_CHUNK_SIZE` | 1000 | Characters per chunk |
| `RAG_CHUNK_OVERLAP` | 150 | Overlap between chunks |
| `RAG_MIN_CHUNK_SIZE` | 200 | Minimum chunk size (filter noise) |
| `RAG_MAX_CHUNKS` | 200 | Max chunks per document |
| `RAG_RETRIEVE_K` | 12 | Initial retrieval count |
| `RAG_TOP_K` | 4 | Final context chunks |
| `RAG_MAX_CONTEXT_CHARS` | 3500 | Max context length |
| `RAG_SIMILARITY_THRESHOLD` | 0.45 | Minimum similarity score |
| `RAG_MAX_RESULTS` | 4 | Max results after reranking |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User     │1      * │   Document   │1      * │    Chat     │
│─────────────│◄────────│──────────────│◄────────│─────────────│
│ _id         │         │ _id          │         │ _id         │
│ email       │         │ userId       │         │ userId      │
│ password    │         │ filename     │         │ question    │
│ role        │         │ fileUrl      │         │ answer      │
│ subscription│         │ category     │         │ language    │
│ isActive    │         │ riskScore    │         │ sources[]   │
└─────────────┘         │ analysis     │         │ rating      │
       │                └──────────────┘         └─────────────┘
       │1
       │
       │*
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Activity   │         │   AIUsage    │         │RefreshToken │
│─────────────│         │──────────────│         │─────────────│
│ _id         │         │ _id          │         │ _id         │
│ userId      │         │ userId       │         │ userId      │
│ action      │         │ model        │         │ token       │
│ resource    │         │ tokensUsed   │         │ family      │
│ ipAddress   │         │ responseTime │         │ expiresAt   │
└─────────────┘         │ cost         │         │ isRevoked   │
                        └──────────────┘         └─────────────┘
```

### User Model

```javascript
{
  _id: ObjectId,
  name: String (required, 2-100 chars),
  email: String (required, unique, indexed),
  password: String (required, bcrypt hashed, select: false),
  role: Enum["user", "admin", "moderator"] (default: "user", indexed),
  permissions: [String],
  languagePreference: Enum["en", "am", "om"] (default: "en", indexed),
  
  // Subscription
  subscriptionPlan: Enum["free", "basic", "premium", "enterprise"],
  subscriptionStatus: Enum["active", "inactive", "cancelled"],
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  
  // Limits
  monthlyDocumentLimit: Number,
  monthlyAIRequestLimit: Number,
  documentsUploadedThisMonth: Number,
  aiRequestsThisMonth: Number,
  
  // Account Status
  isActive: Boolean (default: true, indexed),
  isEmailVerified: Boolean (default: false, indexed),
  accountLockedUntil: Date,
  failedLoginAttempts: Number (default: 0),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  
  // Soft Delete
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date
}
```

**Indexes:**
- `{ email: 1, isDeleted: 1 }` (unique)
- `{ role: 1, isActive: 1 }`
- `{ subscriptionPlan: 1 }`
- `{ name: "text" }` (text search)

### Document Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required, indexed),
  
  // File Info
  filename: String (required),
  originalName: String,
  fileUrl: String (Cloudinary secure_url),
  publicId: String (Cloudinary public_id),
  mimeType: String,
  fileSize: Number (bytes),
  
  // Content
  extractedText: String (select: false),
  category: Enum["Rental", "Labor", "Contract", "Notice", "General"],
  
  // RAG
  isEmbedded: Boolean (default: false, indexed),
  embeddedAt: Date,
  chunkCount: Number,
  
  // Analysis
  analysis: {
    documentId: String,
    fileName: String,
    docType: Enum["contract", "agreement", "notice", "other"],
    summary: String,
    riskScore: Number (0-100),
    aiConfidence: Number (0-100),
    warnings: [String],
    suggestedActions: [String],
    keyFacts: [{ label, value, risk }],
    risks: [{ id, severity, clause, explanation, article, safer }],
    timeline: [{ date, label, type, urgent }],
    sideBySide: [{ original, simplified, risk }],
    riskBreakdown: [{ subject, score }],
    financialRisks: [{ label, value, note, risk }],
    generatedAt: Date,
    processingTime: Number,
    tokensUsed: Number
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Soft Delete
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date
}
```

**Indexes:**
- `{ userId: 1, createdAt: -1 }`
- `{ category: 1, riskScore: -1 }`
- `{ isEmbedded: 1 }`
- `{ filename: "text", extractedText: "text" }`

### Chat Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: "User", required, indexed),
  
  // Conversation
  threadId: String (indexed),
  parentChatId: ObjectId (ref: "Chat"),
  question: String (required, max 5000 chars),
  answer: String (required, max 10000 chars),
  language: Enum["en", "am", "om"] (default: "en", indexed),
  title: String (default: "Untitled Conversation", indexed),
  category: Enum["General", "Tenant", "Labor", "Contract", "Notice"],
  
  // RAG Sources
  sources: [{
    documentId: String,
    filename: String,
    chunkIndex: Number,
    relevanceScore: Number,
    category: String
  }],
  
  // Engagement
  starred: Boolean (default: false, indexed),
  rating: Number (1-5, indexed),
  feedback: String (max 1000 chars),
  
  // AI Metadata
  aiModel: String,
  aiConfidence: Number (0-100),
  tokensUsed: Number,
  responseTime: Number (ms),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Soft Delete
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date
}
```

**Indexes:**
- `{ userId: 1, createdAt: -1 }`
- `{ threadId: 1 }`
- `{ starred: 1, userId: 1 }`
- `{ category: 1 }`
- `{ question: "text", answer: "text" }`

---

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Registration                                             │
│    POST /api/auth/register                                      │
│    • Validate input (Zod schema)                                │
│    • Check email uniqueness                                     │
│    • Hash password (bcrypt, 10 rounds)                          │
│    • Create user record                                         │
│    • Generate access token (15min) + refresh token (7 days)     │
│    • Set httpOnly cookie with refresh token                     │
│    • Return access token + user data                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. User Login                                                    │
│    POST /api/auth/login                                         │
│    • Validate credentials                                       │
│    • Check account status (locked, deleted)                     │
│    • Verify password (bcrypt.compare)                           │
│    • On failure: increment failedLoginAttempts                  │
│    • Lock account after 5 failed attempts (30min)               │
│    • On success: reset failedLoginAttempts                      │
│    • Generate token pair                                        │
│    • Create RefreshToken record (family tracking)               │
│    • Log activity (IP, user agent)                              │
│    • Return tokens                                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. Protected Request                                             │
│    • Extract JWT from Authorization header                      │
│    • Verify signature (JWT_SECRET)                              │
│    • Check expiration                                           │
│    • Validate issuer & audience                                 │
│    • Load user from database                                    │
│    • Check user status (active, not deleted)                    │
│    • Attach user to req.user                                    │
│    • Proceed to route handler                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4. Token Refresh                                                 │
│    POST /api/auth/refresh                                       │
│    • Extract refresh token from cookie                          │
│    • Verify token signature                                     │
│    • Load RefreshToken record                                   │
│    • Check revocation status                                    │
│    • Check family for reuse detection                           │
│    • If reused: revoke entire family (security breach)          │
│    • Generate new token pair                                    │
│    • Revoke old refresh token                                   │
│    • Create new RefreshToken record (same family)               │
│    • Return new tokens                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Security Layers

#### 1. Transport Security
- HTTPS only in production
- Secure cookies (httpOnly, secure, sameSite)
- HSTS headers (15552000 seconds)

#### 2. Application Security
- **Helmet.js**: Security headers (CSP, X-Frame-Options, etc.)
- **CORS**: Whitelist allowed origins
- **XSS Prevention**: Input sanitization with xss library
- **SQL Injection**: N/A (NoSQL with Mongoose)
- **NoSQL Injection**: Zod schema validation, type checking

#### 3. Authentication Security
- **Password Hashing**: bcrypt (10 rounds)
- **JWT**: RS256 or HS256, short-lived access tokens (15min)
- **Refresh Tokens**: Long-lived (7 days), family tracking, rotation
- **Account Locking**: 5 failed attempts → 30min lock
- **Session Management**: Device tracking, suspicious activity detection

#### 4. Rate Limiting (4-Tier System)

```javascript
// Tier 1: Authentication (strictest)
authLimiter: {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // 5 requests
  message: "Too many login attempts"
}

// Tier 2: AI Endpoints (expensive operations)
aiLimiter: {
  windowMs: 60 * 1000,        // 1 minute
  max: 10,                    // 10 requests
  message: "Too many AI requests"
}

// Tier 3: File Uploads
uploadLimiter: {
  windowMs: 60 * 1000,        // 1 minute
  max: 5,                     // 5 uploads
  message: "Too many uploads"
}

// Tier 4: General API
apiLimiter: {
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                   // 100 requests
  message: "Too many requests"
}
```

#### 5. Data Security
- **Soft Deletes**: Preserve data for recovery
- **Field Encryption**: Sensitive fields (select: false)
- **Audit Trails**: Activity logging with IP tracking
- **Data Validation**: Zod schemas at API boundary

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel (Frontend)                        │
│  • CDN: Global edge network                                     │
│  • SSL: Automatic HTTPS                                         │
│  • Build: Vite production build                                 │
│  • Environment: VITE_API_URL                                    │
└──────────────┬──────────────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────────────┐
│                        Render (Backend)                          │
│  • Runtime: Node.js 18                                          │
│  • Auto-scaling: Based on CPU/memory                            │
│  • Health checks: /api/health                                   │
│  • SSL: Automatic HTTPS                                         │
│  • Environment: 20+ variables                                   │
└──────────────┬──────────────────────────────────────────────────┘
               │
    ┌──────────┼──────────┬──────────────┬────────────────┐
    │          │          │              │                │
┌───▼───┐  ┌──▼───┐  ┌───▼────┐  ┌──────▼──────┐  ┌────▼─────┐
│MongoDB│  │Chroma│  │Gemini  │  │ Cloudinary  │  │  Future  │
│Atlas  │  │  DB  │  │   AI   │  │   Storage   │  │  Redis   │
│       │  │Docker│  │  API   │  │             │  │  Cache   │
└───────┘  └──────┘  └────────┘  └─────────────┘  └──────────┘
```

### Environment Variables

**Backend (Render)**
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=<strong-secret>
JWT_ISSUER=ethiolegal-ai
JWT_AUDIENCE=ethiolegal-ai-users
JWT_ACCESS_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECRET=<cookie-secret>

# AI
GEMINI_API_KEY=<api-key>

# Storage
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# RAG
CHROMA_URL=<chromadb-url>

# CORS
CORS_ORIGIN=https://ethiolegal-ai.vercel.app
```

**Frontend (Vercel)**
```env
VITE_API_URL=https://ethiolegal-ai.onrender.com/api
```

---

## Scalability Considerations

### Current Bottlenecks
1. **ChromaDB**: Single instance, no replication
2. **No Caching**: Every request hits database
3. **Synchronous Processing**: Document embedding blocks request

### Scaling Strategies

#### Phase 1: Immediate Improvements
- **Redis Caching**: Cache frequent queries, user sessions
- **Database Indexing**: Already implemented (compound indexes)
- **Connection Pooling**: Mongoose default (100 connections)

#### Phase 2: Horizontal Scaling
- **Load Balancer**: Nginx or cloud-native (AWS ALB, GCP Load Balancer)
- **Multiple Backend Instances**: Render auto-scaling
- **Stateless Design**: Already implemented (JWT, no server sessions)

#### Phase 3: Advanced Optimizations
- **Message Queue**: Bull/BullMQ for async document processing
- **CDN**: Cloudflare for static assets
- **Database Sharding**: MongoDB sharding by userId
- **Read Replicas**: MongoDB Atlas read replicas
- **Microservices**: Split RAG pipeline into separate service

#### Phase 4: Enterprise Scale
- **Kubernetes**: Container orchestration
- **Service Mesh**: Istio for inter-service communication
- **Observability**: Prometheus + Grafana monitoring
- **Distributed Tracing**: OpenTelemetry
- **Multi-Region**: Deploy to multiple AWS/GCP regions

### Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| API Response Time | <500ms | <200ms |
| Document Upload | <5s | <3s |
| AI Chat Response | <3s | <2s |
| Concurrent Users | 100 | 10,000 |
| Database Queries | <100ms | <50ms |

---

## Monitoring & Observability

### Logging Strategy
- **Morgan**: HTTP request logging
- **Activity Model**: User action tracking
- **AIUsage Model**: Token consumption, costs
- **Error Logs**: Centralized error handler

### Future Monitoring
- **APM**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Mixpanel

---

## Conclusion

EthioLegalAI is built with a modern, scalable architecture that balances performance, security, and maintainability. The RAG pipeline provides accurate, context-aware responses while the layered backend architecture ensures clean separation of concerns. With proper monitoring and incremental scaling strategies, the system can grow from hundreds to millions of users.
