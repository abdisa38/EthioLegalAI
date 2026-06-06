# Operational Documentation (Ops)

This document focuses on how EthioLegalAI should behave in real deployments: reliability, observability, incident response, and long-running tasks.

---

## 1) Service Overview

EthioLegalAI consists of:
- **Frontend (Vercel)**: React + Vite build, served via CDN/edge.
- **Backend (Render)**: Express API with middleware-based security.
- **MongoDB (Atlas or local)**: primary persistence.
- **ChromaDB**: vector store for embeddings.
- **Cloudinary**: PDF storage.
- **External AI (Google Gemini)**: chat + embeddings.

---

## 2) Logging Strategy

### Backend logging
- Use Morgan for HTTP request logging.
- Log security events (login failures, token reuse detection) with correlation fields:
  - `userId` (when available)
  - `requestId` / trace identifier (recommended)
  - `ipAddress` / `userAgent`
- Log AI execution metrics:
  - model name
  - tokens used
  - response time
  - confidence score

### What to log (minimum)
- request start/end
- endpoint name + status
- error stack traces (sanitized)
- external service latencies (Gemini, Cloudinary)

---

## 3) Monitoring & Metrics

Recommended KPIs:
- API p50/p95 latency per endpoint category (auth, ai chat, uploads)
- error rate (4xx/5xx split)
- rate-limit triggers
- AI cost proxies (token usage)
- RAG retrieval quality proxies (e.g., number of chunks retrieved, similarity stats)

---

## 4) Error Handling & Response Contract

### Response shape
All errors should follow the standard shape from `docs/API.md`:
- `success: false`
- `error: { code, message, details? }`

### Common error categories
- validation errors (`VALIDATION_ERROR`)
- auth errors (`UNAUTHORIZED`, `FORBIDDEN`)
- rate limiting (`RATE_LIMIT_EXCEEDED`)
- external dependency failures (`SERVICE_UNAVAILABLE`)

---

## 5) Background / Long-Running Tasks

Document ingestion (chunking + embedding) can be expensive.

Current repo behavior (per architecture docs) indicates ingestion occurs as part of upload flow. For scaling, you can evolve toward:
- queue-based ingestion (BullMQ)
- status polling (document `processingState`)

---

## 6) Migrations & Data Lifecycle

- MongoDB schema changes should be versioned.
- ChromaDB is regenerated/updated on ingestion; ensure metadata compatibility.

Recommended migration checklist:
- add indexes before major data growth
- verify soft-delete logic consistency across MongoDB + vector metadata

---

## 7) Security Operations

Operational security steps:
- rotate JWT secrets and Cloudinary credentials periodically
- ensure refresh token cookie settings are secure in production (`httpOnly`, `secure`, `sameSite`)
- track token family reuse events and treat as security incidents

---

## 8) Runbook (Minimal)

### If Gemini API fails
- check `GEMINI_API_KEY`
- confirm quotas and error messages
- degrade gracefully (retry/fallback model if configured)

### If ChromaDB is unreachable
- verify `CHROMA_URL`
- ensure container/service is running
- confirm port exposure (default 8000)

### If uploads fail
- verify Cloudinary credentials
- validate content-type and file size

---

## 9) Deployment Verification Checklist

Before declaring production ready:
- health endpoint returns OK
- user auth flows work end-to-end
- upload + indexing works for a sample PDF
- AI chat works with retrieval and returns sources


