# Changelog

All notable changes to EthioLegalAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Real-time chat with WebSockets
- Mobile app (React Native)
- Advanced analytics dashboard
- Multi-tenant support
- Webhook support
- GraphQL API
- Elasticsearch integration

---

## [1.0.0] - 2024-01-15

### Added
- 🎉 Initial release of EthioLegalAI
- ✨ AI-powered legal chat with RAG (Retrieval-Augmented Generation)
- 📄 PDF document upload and processing
- 🔍 Contract risk analysis with 0-100 scoring
- 👨‍⚖️ Tenant Rights Assistant
- 💼 Labor Law Assistant
- 🌍 Multilingual support (English, Amharic, Afaan Oromo)
- 🔐 JWT authentication with refresh token rotation
- 🛡️ Enterprise-grade security (rate limiting, XSS prevention, CORS)
- 📊 User analytics and engagement tracking
- 💾 MongoDB database with optimized schema
- 🧠 Google Gemini AI integration
- 📚 ChromaDB vector store for RAG
- ☁️ Cloudinary file storage
- 📱 Responsive React frontend with TypeScript
- 🎨 Tailwind CSS styling
- 🔄 React Query for state management

### Security
- Account locking after 5 failed login attempts
- 4-tier rate limiting system
- Comprehensive audit trails
- Input validation with Zod schemas
- Helmet security headers
- OWASP Top 10 protection

### Performance
- Compound database indexes
- Lean queries for read operations
- Query optimization utilities
- Pagination support (offset + cursor-based)
- Soft delete pattern for data recovery

### Documentation
- Comprehensive README with architecture diagrams
- Complete API documentation
- Setup guide for local development
- Architecture documentation
- Contributing guidelines
- Security documentation

---

## [0.9.0] - 2024-01-10 (Beta)

### Added
- Beta release for testing
- Core AI chat functionality
- Document upload
- Basic authentication
- MongoDB integration

### Fixed
- Token refresh race conditions
- Document embedding errors
- CORS configuration issues

---

## [0.5.0] - 2024-01-05 (Alpha)

### Added
- Alpha release for internal testing
- Basic Express API
- React frontend prototype
- Gemini AI integration
- MongoDB schema design

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-01-15 | Initial public release |
| 0.9.0 | 2024-01-10 | Beta release |
| 0.5.0 | 2024-01-05 | Alpha release |

---

## Upgrade Guide

### From 0.9.0 to 1.0.0

#### Database Migrations
```bash
cd backend
npm run db:migrate
```

#### Environment Variables
Add new variables to `.env`:
```env
# New in 1.0.0
RAG_MAX_RESULTS=4
RAG_DEBUG=false
```

#### Breaking Changes
- Response format changed for `/api/chats` endpoint
- Now includes pagination metadata
- Update frontend API calls accordingly

#### New Features
- Contract analysis endpoint: `POST /api/contracts/analyze`
- Specialized assistants: `/api/assistants/tenant`, `/api/assistants/labor`
- Chat starring: `POST /api/chats/:id/star`

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this changelog.

---

## Links

- [GitHub Repository](https://github.com/yourusername/ethiolegal-ai)
- [Documentation](./docs/README.md)
- [Issue Tracker](https://github.com/yourusername/ethiolegal-ai/issues)
- [Releases](https://github.com/yourusername/ethiolegal-ai/releases)
