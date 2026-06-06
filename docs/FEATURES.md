# EthioLegalAI — Feature Documentation

This document explains what each product capability does, what inputs/outputs look like, and which parts of the system implement it.

> Note: All AI guidance is educational and not legal advice.

---

## 1) Multilingual Legal Chat (RAG)

### What it does
A user can ask questions in English, Amharic (አማርኛ), or Afaan Oromo (አወፋን ኦሮምራ). If the user has uploaded documents, the assistant retrieves relevant chunks using embeddings (ChromaDB) and generates a grounded response using Google Gemini.

### Key behaviors
- Intent/category prediction to bias retrieval (Tenant/Labor/Contract/General)
- Context reranking and thresholding to reduce noise
- Structured markdown output:
  - Summary
  - Explanation
  - Important Notes
  - Risks
  - Recommendations
- Source attribution with relevance scores

### Primary API
- `POST /api/ai/chat`

### System modules involved
- `backend/controllers/aiController.js`
- `backend/routes/aiRoutes.js`
- `backend/rag/*` (query preprocessing, retrieval, reranking)
- `backend/services/geminiService.js`
- `backend/ai/promptManager.js`

---

## 2) Document Upload & RAG Indexing

### What it does
Users upload PDFs. The backend stores the file in Cloudinary, extracts text, categorizes it, chunks it, generates embeddings, and persists the vectors in ChromaDB.

### Key behaviors
- PDF-only validation
- Cloudinary upload + secure URL + publicId persistence
- Text extraction with cleaning
- Recursive chunking with configured overlap
- Deduplication using normalized chunk hashes
- Embedding generation and metadata storage for traceability

### Primary API
- `POST /api/documents/upload`
- `GET /api/documents` (list)
- `GET /api/documents/:id` (details)
- `DELETE /api/documents/:id` (soft delete)

### System modules involved
- `backend/controllers/documentController.js`
- `backend/middleware/upload.js`
- `backend/services/*` (pdf processing, embedding generation)
- `backend/rag/vectorStore.js`
- `backend/rag/documentCategorizer.js`

---

## 3) Contract Risk Analysis

### What it does
Given a previously uploaded contract document, the assistant generates a clause-by-clause risk assessment (0–100), warnings, suggested actions, timeline extraction, and “side-by-side” simplifications.

### Key behaviors
- Uses RAG context or embedded chunks (implementation depends on pipeline configuration)
- Produces a structured analysis object returned to the UI
- Stores the analysis results for retrieval

### Primary API
- `POST /api/contracts/analyze`
- `GET /api/contracts/:documentId`

### System modules involved
- `backend/controllers/contractController.js`
- `backend/services/contractAnalysisService.js`

---

## 4) Specialized Assistants (Tenant & Labor)

### What it does
Dedicated assistants provide focused guidance:
- Tenant rights & rental disputes
- Labor rights & employment disputes

### Primary API
- `POST /api/assistants/tenant`
- `POST /api/assistants/labor`

### System modules involved
- `backend/controllers/tenantAssistantController.js`
- `backend/controllers/laborAssistantController.js`
- `backend/services/tenantAssistantService.js`
- `backend/services/laborAssistantService.js`

---

## 5) Chat History, Star/Rating, Feedback

### What it does
Users can browse prior chats, star important conversations, rate outcomes, and view details.

### Primary API
- `GET /api/chats/history`
- `GET /api/chats/:id`
- `POST /api/chats/:id/star`
- `DELETE /api/chats/:id`

---

## 6) Analytics & Usage Tracking

### What it does
The platform tracks:
- tokens used
- response times
- AI confidence scores
- engagement milestones/metrics

This enables product iteration and observability.

### Primary API
(Endpoints exist in `docs/API.md`; align in the next documentation pass.)

---

## 7) Health & Operational Readiness

### What it does
A basic health endpoint verifies backend service readiness and database connectivity.

### Primary API
- `GET /api/health`

---

## Appendix: Educational Disclaimer
All outputs are generated from public/legal-text-informed models and are intended for educational purposes. Users should consult a licensed professional for legal decisions.

