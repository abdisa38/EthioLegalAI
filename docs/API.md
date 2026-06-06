PAI# 📡 EthioLegalAI — API Documentation

This document describes the EthioLegalAI backend REST API.

> All AI responses are educational and not legal advice.

---

## Base URL

```text
Development: http://localhost:5000/api
Production:  https://ethiolegal-ai.onrender.com/api
```

---

## Authentication

Most endpoints require JWT authentication.

**Header**:
```http
Authorization: Bearer <access_token>
```

Refresh tokens are stored in **httpOnly cookies**.

---

## Table of Contents

- [Authentication](#authentication)
- [AI Chat](#ai-chat)
- [Documents](#documents)
- [Chat History](#chat-history)
- [Contracts](#contracts)
- [Specialized Assistants](#specialized-assistants)
- [Health Check](#health-check)
- [Errors](#errors)
- [Rate Limits](#rate-limits)
- [Pagination](#pagination)

---

## Authentication

### Register User

**POST** `/auth/register`

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "languagePreference": "en"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "languagePreference": "en",
      "subscriptionPlan": "free",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "<jwt>",
    "expiresIn": "15m"
  }
}
```

---

### Login

**POST** `/auth/login`

**Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "languagePreference": "en"
    },
    "accessToken": "<jwt>",
    "expiresIn": "15m"
  }
}
```

Security features:
- Account locking after 5 failed attempts (30 minutes)
- Activity logging (IP + user agent)
- Refresh token in httpOnly cookie

---

### Refresh Token

**POST** `/auth/refresh`

**Header (cookie)**:
```http
Cookie: refreshToken=<refresh_token>
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": "15m"
  }
}
```

---

### Logout

**POST** `/auth/logout`

**Headers**:
```http
Authorization: Bearer <access_token>
Cookie: refreshToken=<refresh_token>
```

**Response (200)**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## AI Chat

### Send Chat Message

**POST** `/ai/chat`

**Auth:** required

**Body**:
```json
{
  "message": "What are my rights as a tenant in Ethiopia?",
  "language": "en"
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "chat": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "question": "What are my rights as a tenant in Ethiopia?",
      "answer": "## Summary\n\nAs a tenant in Ethiopia...",
      "language": "en",
      "category": "Tenant",
      "sources": [
        {
          "documentId": "doc_123",
          "filename": "rental_agreement.pdf",
          "chunkIndex": 2,
          "relevanceScore": 0.87,
          "category": "Rental"
        }
      ],
      "aiModel": "gemini-2.5-flash",
      "aiConfidence": 85,
      "tokensUsed": 1250,
      "responseTime": 2340,
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

Rate limit: **10 requests / minute**

---

## Documents

### Upload Document

**POST** `/documents/upload`

**Auth:** required

**Request:** `multipart/form-data`
- `file`: PDF
- `category` (optional): one of `Rental | Labor | Contract | Notice | General`

**Response (201)**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "filename": "rental_agreement.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "publicId": "ethiolegal/doc_123",
      "mimeType": "application/pdf",
      "fileSize": 245678,
      "category": "Rental",
      "isEmbedded": true,
      "embeddedAt": "2024-01-15T10:40:00.000Z",
      "chunkCount": 15
    }
  }
}
```

Validation:
- PDF only
- max size: 10MB

Rate limit: **5 uploads / minute**

---

### List Documents

**GET** `/documents`

**Auth:** required

Query params:
- `page` (default: 1)
- `limit` (default: 10)
- `category` (optional)
- `sortBy` (optional, e.g. `createdAt`)
- `sortOrder` (`asc` | `desc`, default: `desc`)

---

### Get Document

**GET** `/documents/:id`

**Auth:** required

---

### Delete Document

**DELETE** `/documents/:id`

Soft delete: document is marked `isDeleted=true`.

---

## Chat History

### Get Chat History

**GET** `/chats/history`

**Auth:** required

Query params:
- `page` (default: 1)
- `limit` (default: 20)
- `category` (optional)
- `starred` (optional)

---

### Get Single Chat

**GET** `/chats/:id`

---

### Star / Unstar Chat

**POST** `/chats/:id/star`

---

### Delete Chat

**DELETE** `/chats/:id`

Soft delete.

---

## Contracts

### Analyze Contract

**POST** `/contracts/analyze`

**Auth:** required

**Body**:
```json
{
  "documentId": "507f1f77bcf86cd799439013",
  "language": "en"
}
```

Rate limit: **10 requests / minute**

---

### Get Analysis

**GET** `/contracts/:documentId`

---

## Specialized Assistants

### Tenant Rights Assistant

**POST** `/assistants/tenant`

---

### Labor Law Assistant

**POST** `/assistants/labor`

---

## Health Check

### API Health

**GET** `/health`

No auth required.

---

## Errors

All error responses follow this shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

Common error codes:
- `VALIDATION_ERROR` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `CONFLICT` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

---

## Rate Limits

| Endpoint Category | Limit | Window |
|---|---:|---:|
| Authentication | 5 requests | 15 minutes |
| AI Chat | 10 requests | 1 minute |
| Document Upload | 5 uploads | 1 minute |
| General API | 100 requests | 15 minutes |

---

## Pagination

Query params:
- `page` (default: 1)
- `limit` (default: 10)
- `sortBy` (default: `createdAt`)
- `sortOrder` (`asc` | `desc`, default: `desc`)

Response includes `pagination` metadata.

