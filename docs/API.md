# 📡 EthioLegalAI API Documentation

## Base URL

```
Development: http://localhost:5000/api
Production:  https://ethiolegal-ai.onrender.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

Refresh tokens are stored in httpOnly cookies and automatically sent with requests.

---

## Table of Contents

- [Authentication](#authentication-endpoints)
- [AI Chat](#ai-chat-endpoints)
- [Documents](#document-endpoints)
- [Chats](#chat-history-endpoints)
- [Contracts](#contract-analysis-endpoints)
- [Assistants](#specialized-assistants)
- [Health](#health-check)
- [Error Responses](#error-responses)

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "languagePreference": "en"
}
```

**Response:** `201 Created`
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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

**Validation Rules:**
- `name`: 2-100 characters
- `email`: Valid email format, unique
- `password`: Minimum 6 characters
- `languagePreference`: "en", "am", or "om" (optional)

---

### Login

Authenticate user and receive tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
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
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

**Security Features:**
- Account locking after 5 failed attempts (30 minutes)
- Activity logging (IP address, user agent)
- Refresh token stored in httpOnly cookie

---

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```http
Cookie: refreshToken=<refresh_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m"
  }
}
```

**Security:**
- Token rotation: Old refresh token is revoked
- Family tracking: Detects token reuse attacks
- If reuse detected: Entire token family is revoked

---

### Logout

Revoke refresh token and end session.

**Endpoint:** `POST /auth/logout`

**Headers:**
```http
Authorization: Bearer <access_token>
Cookie: refreshToken=<refresh_token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## AI Chat Endpoints

### Send Chat Message

Send a message to the AI assistant with optional document context.

**Endpoint:** `POST /ai/chat`

**Authentication:** Required

**Request Body:**
```json
{
  "message": "What are my rights as a tenant in Ethiopia?",
  "language": "en"
}
```

**Response:** `200 OK`
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

**Parameters:**
- `message` (required): User question (max 5000 chars)
- `language` (optional): "en", "am", "om" (default: user preference)

**Response Structure:**
The AI response follows a structured markdown format:
- **Summary**: 2-3 sentence overview
- **Explanation**: Detailed legal explanation with citations
- **Important Notes**: Key details and assumptions
- **Risks**: Potential legal risks and deadlines
- **Recommendations**: 2-3 actionable steps

**Rate Limit:** 10 requests per minute

---

## Document Endpoints

### Upload Document

Upload a PDF document for analysis and RAG indexing.

**Endpoint:** `POST /documents/upload`

**Authentication:** Required

**Request:**
```http
Content-Type: multipart/form-data

file: <PDF file>
category: "Rental" (optional)
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "filename": "rental_agreement.pdf",
      "originalName": "My Rental Agreement.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "publicId": "ethiolegal/doc_123",
      "mimeType": "application/pdf",
      "fileSize": 245678,
      "category": "Rental",
      "isEmbedded": true,
      "embeddedAt": "2024-01-15T10:40:00.000Z",
      "chunkCount": 15,
      "createdAt": "2024-01-15T10:40:00.000Z"
    }
  }
}
```

**Validation:**
- File type: PDF only
- Max size: 10MB
- Categories: "Rental", "Labor", "Contract", "Notice", "General"

**Processing:**
1. Upload to Cloudinary
2. Extract text (pdf-parse)
3. Categorize document
4. Chunk text (1000 chars, 150 overlap)
5. Generate embeddings (Gemini)
6. Store in ChromaDB

**Rate Limit:** 5 uploads per minute

---

### List Documents

Get paginated list of user's documents.

**Endpoint:** `GET /documents`

**Authentication:** Required

**Query Parameters:**
```
page=1
limit=10
category=Rental (optional)
sortBy=createdAt (optional)
sortOrder=desc (optional)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "filename": "rental_agreement.pdf",
        "fileUrl": "https://res.cloudinary.com/...",
        "category": "Rental",
        "fileSize": 245678,
        "isEmbedded": true,
        "chunkCount": 15,
        "createdAt": "2024-01-15T10:40:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalDocuments": 25,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### Get Document

Get details of a specific document.

**Endpoint:** `GET /documents/:id`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "document": {
      "_id": "507f1f77bcf86cd799439013",
      "filename": "rental_agreement.pdf",
      "originalName": "My Rental Agreement.pdf",
      "fileUrl": "https://res.cloudinary.com/...",
      "category": "Rental",
      "fileSize": 245678,
      "isEmbedded": true,
      "chunkCount": 15,
      "analysis": {
        "riskScore": 45,
        "summary": "Standard rental agreement with moderate risks",
        "warnings": ["No termination clause", "Unclear deposit terms"]
      },
      "createdAt": "2024-01-15T10:40:00.000Z"
    }
  }
}
```

---

### Delete Document

Soft delete a document (preserves data for recovery).

**Endpoint:** `DELETE /documents/:id`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Note:** Document is soft-deleted (isDeleted=true) and excluded from queries.

---

## Chat History Endpoints

### Get Chat History

Retrieve paginated chat history.

**Endpoint:** `GET /chats/history`

**Authentication:** Required

**Query Parameters:**
```
page=1
limit=20
category=Tenant (optional)
starred=true (optional)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "question": "What are my rights as a tenant?",
        "answer": "## Summary\n\nAs a tenant...",
        "language": "en",
        "category": "Tenant",
        "starred": false,
        "rating": 5,
        "createdAt": "2024-01-15T10:35:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalChats": 87,
      "limit": 20
    }
  }
}
```

---

### Get Single Chat

Get details of a specific chat.

**Endpoint:** `GET /chats/:id`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "chat": {
      "_id": "507f1f77bcf86cd799439012",
      "question": "What are my rights as a tenant?",
      "answer": "## Summary\n\nAs a tenant in Ethiopia...",
      "language": "en",
      "category": "Tenant",
      "sources": [
        {
          "documentId": "doc_123",
          "filename": "rental_agreement.pdf",
          "relevanceScore": 0.87
        }
      ],
      "aiModel": "gemini-2.5-flash",
      "tokensUsed": 1250,
      "responseTime": 2340,
      "createdAt": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

---

### Star/Unstar Chat

Toggle star status on a chat.

**Endpoint:** `POST /chats/:id/star`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "starred": true
  }
}
```

---

### Delete Chat

Soft delete a chat.

**Endpoint:** `DELETE /chats/:id`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

## Contract Analysis Endpoints

### Analyze Contract

Perform comprehensive risk analysis on a contract document.

**Endpoint:** `POST /contracts/analyze`

**Authentication:** Required

**Request Body:**
```json
{
  "documentId": "507f1f77bcf86cd799439013",
  "language": "en"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "analysis": {
      "documentId": "507f1f77bcf86cd799439013",
      "fileName": "rental_agreement.pdf",
      "docType": "contract",
      "summary": "Standard rental agreement with moderate risks",
      "riskScore": 45,
      "aiConfidence": 88,
      "warnings": [
        "No termination clause specified",
        "Unclear deposit return terms",
        "This is educational information, not legal advice"
      ],
      "suggestedActions": [
        "Request written termination clause",
        "Clarify deposit return timeline",
        "Consult a lawyer before signing"
      ],
      "keyFacts": [
        {
          "label": "Monthly Rent",
          "value": "5,000 ETB",
          "risk": false
        },
        {
          "label": "Deposit",
          "value": "10,000 ETB (2 months)",
          "risk": true
        }
      ],
      "risks": [
        {
          "id": 1,
          "severity": "high",
          "clause": "Deposit shall be returned at landlord's discretion",
          "explanation": "Vague deposit return terms violate tenant protection laws",
          "article": "Civil Code Art. 2975",
          "safer": "Deposit shall be returned within 30 days of lease termination",
          "confidence": 92
        }
      ],
      "timeline": [
        {
          "date": "2024-02-01",
          "label": "Lease Start Date",
          "type": "milestone",
          "urgent": false
        },
        {
          "date": "2024-02-15",
          "label": "First Rent Payment Due",
          "type": "deadline",
          "urgent": true
        }
      ],
      "sideBySide": [
        {
          "original": "The tenant shall maintain the property in good condition",
          "simplified": "You must keep the rental in good shape",
          "risk": "low"
        }
      ],
      "riskBreakdown": [
        {
          "subject": "Legal Compliance",
          "score": 65
        },
        {
          "subject": "Financial Terms",
          "score": 40
        },
        {
          "subject": "Obligations",
          "score": 55
        }
      ],
      "financialRisks": [
        {
          "label": "Excessive Deposit",
          "value": "10,000 ETB",
          "note": "2x monthly rent may be excessive",
          "risk": true
        }
      ],
      "generatedAt": "2024-01-15T10:45:00.000Z",
      "processingTime": 4500,
      "tokensUsed": 3200
    }
  }
}
```

**Risk Score Scale:**
- 0-25: Low risk
- 26-50: Moderate risk
- 51-75: High risk
- 76-100: Critical risk

**Rate Limit:** 10 requests per minute

---

### Get Analysis

Retrieve previously generated contract analysis.

**Endpoint:** `GET /contracts/:documentId`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "analysis": { /* Same structure as analyze endpoint */ }
  }
}
```

---

## Specialized Assistants

### Tenant Rights Assistant

Get guidance on tenant rights and rental disputes.

**Endpoint:** `POST /assistants/tenant`

**Authentication:** Required

**Request Body:**
```json
{
  "message": "My landlord is trying to evict me without notice",
  "language": "en"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "answer": "## Summary\n\nIn Ethiopia, landlords must provide written notice...",
    "category": "Tenant",
    "aiModel": "gemini-2.5-flash",
    "tokensUsed": 980,
    "responseTime": 1850
  }
}
```

---

### Labor Law Assistant

Get help with employment rights and labor disputes.

**Endpoint:** `POST /assistants/labor`

**Authentication:** Required

**Request Body:**
```json
{
  "message": "Can my employer fire me without severance pay?",
  "language": "en"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "answer": "## Summary\n\nUnder Ethiopian Labor Proclamation No. 1156/2019...",
    "category": "Labor",
    "aiModel": "gemini-2.5-flash",
    "tokensUsed": 1120,
    "responseTime": 2100
  }
}
```

---

## Health Check

### Check API Health

Verify API and database connectivity.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "status": "ok",
  "service": "EthioLegal AI API",
  "timestamp": "2024-01-15T10:50:00.000Z",
  "uptime": 86400,
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Optional additional context */ }
  }
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | External service unavailable |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| AI Chat | 10 requests | 1 minute |
| Document Upload | 5 uploads | 1 minute |
| General API | 100 requests | 15 minutes |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1642248600
```

---

## Pagination

List endpoints support pagination with these query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: "asc" or "desc" (default: desc)

**Response includes:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Webhooks (Future)

Webhook support is planned for:
- Document processing completion
- Contract analysis completion
- Subscription changes
- Usage limit warnings

---

## SDKs & Client Libraries

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Go

---

## Support

- **Documentation**: https://github.com/yourusername/ethiolegal-ai/docs
- **Issues**: https://github.com/yourusername/ethiolegal-ai/issues
- **Email**: support@ethiolegal-ai.com

---

**Last Updated:** January 2024  
**API Version:** 1.0.0
