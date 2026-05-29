# 📚 EthioLegalAI Documentation

Welcome to the EthioLegalAI documentation! This guide will help you understand, set up, and contribute to the project.

## 📖 Documentation Index

### Getting Started
- **[Main README](../README.md)** - Project overview, features, and quick start
- **[Setup Guide](./SETUP.md)** - Complete local development setup instructions
- **[Contributing Guidelines](../CONTRIBUTING.md)** - How to contribute to the project

### Technical Documentation
- **[Architecture](./ARCHITECTURE.md)** - System architecture, tech stack, and design patterns
- **[API Reference](./API.md)** - Complete API endpoint documentation
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions

### Specialized Guides
- **[RAG System](./RAG.md)** - Deep dive into the RAG pipeline
- **[Security](./SECURITY.md)** - Security architecture and best practices
- **[Database Schema](./DATABASE.md)** - Database models and relationships

---

## 🎯 Quick Navigation

### I want to...

#### ...understand the project
→ Start with [Main README](../README.md)  
→ Then read [Architecture](./ARCHITECTURE.md)

#### ...set up for development
→ Follow [Setup Guide](./SETUP.md)  
→ Check [API Reference](./API.md) for testing

#### ...deploy to production
→ Read [Deployment Guide](./DEPLOYMENT.md)  
→ Review [Security](./SECURITY.md) checklist

#### ...contribute code
→ Read [Contributing Guidelines](../CONTRIBUTING.md)  
→ Check [Architecture](./ARCHITECTURE.md) for patterns

#### ...understand the AI/RAG system
→ Read [RAG System](./RAG.md)  
→ Check [Architecture - RAG Pipeline](./ARCHITECTURE.md#rag-pipeline)

#### ...integrate the API
→ Start with [API Reference](./API.md)  
→ Check [Authentication](./API.md#authentication)

---

## 📂 Documentation Structure

```
docs/
├── README.md              # This file - documentation index
├── SETUP.md              # Local development setup
├── ARCHITECTURE.md       # System architecture
├── API.md                # API documentation
├── DEPLOYMENT.md         # Deployment guide
├── RAG.md                # RAG system deep dive
├── SECURITY.md           # Security documentation
├── DATABASE.md           # Database schema
├── TROUBLESHOOTING.md    # Common issues and solutions
└── assets/               # Images and diagrams
    ├── banner.png
    ├── architecture/
    ├── screenshots/
    └── diagrams/
```

---

## 🔑 Key Concepts

### RAG (Retrieval-Augmented Generation)
EthioLegalAI uses RAG to ground AI responses in user-uploaded legal documents, ensuring accuracy and preventing hallucination.

**Learn more:** [RAG System Documentation](./RAG.md)

### Multilingual Support
The platform supports English, Amharic (አማርኛ), and Afaan Oromo with culturally-adapted responses.

**Learn more:** [Architecture - Prompt Management](./ARCHITECTURE.md#prompt-management)

### Security Architecture
Enterprise-grade security with JWT authentication, refresh token rotation, rate limiting, and comprehensive audit trails.

**Learn more:** [Security Documentation](./SECURITY.md)

### Database Design
Optimized MongoDB schema with soft deletes, compound indexes, and query optimization utilities.

**Learn more:** [Database Schema](./DATABASE.md)

---

## 🛠️ Development Resources

### Code Examples

#### Backend: Creating a New API Endpoint
```javascript
// controllers/exampleController.js
const ExampleService = require('../services/exampleService');

const getExample = async (req, res, next) => {
  try {
    const { id } = req.params;
    const example = await ExampleService.findById(id);
    
    res.json({
      success: true,
      data: { example }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getExample };
```

#### Frontend: Using React Query
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export const useExample = (id: string) => {
  return useQuery({
    queryKey: ['example', id],
    queryFn: () => api.get(`/examples/${id}`).then(res => res.data)
  });
};
```

### Testing Examples

#### Backend Test
```javascript
describe('GET /api/examples/:id', () => {
  it('should return example by id', async () => {
    const response = await request(app)
      .get('/api/examples/123')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

#### Frontend Test
```typescript
import { render, screen } from '@testing-library/react';
import { ExampleComponent } from './ExampleComponent';

test('renders example component', () => {
  render(<ExampleComponent />);
  expect(screen.getByText('Example')).toBeInTheDocument();
});
```

---

## 🌍 Internationalization

### Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Full support |
| Amharic | `am` | ✅ Full support |
| Afaan Oromo | `om` | ✅ Full support |

### Adding a New Language

1. Add language profile in `backend/ai/promptTemplates.js`
2. Update language enum in models
3. Add translations in frontend
4. Test AI responses in new language

**Learn more:** [Architecture - Multilingual Support](./ARCHITECTURE.md#multilingual-support)

---

## 📊 Performance Metrics

### Current Performance

| Metric | Value | Target |
|--------|-------|--------|
| API Response Time | <500ms | <200ms |
| Document Upload | <5s | <3s |
| AI Chat Response | <3s | <2s |
| Database Queries | <100ms | <50ms |

### Optimization Strategies

- **Caching**: Redis for frequent queries (planned)
- **Indexing**: Compound indexes on all models
- **Query Optimization**: Lean queries, field selection
- **CDN**: Cloudflare for static assets (planned)

**Learn more:** [Architecture - Scalability](./ARCHITECTURE.md#scalability-considerations)

---

## 🔒 Security

### Security Features

- ✅ JWT authentication with refresh token rotation
- ✅ Account locking after failed login attempts
- ✅ Rate limiting (4-tier system)
- ✅ XSS prevention and input sanitization
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Comprehensive audit trails

### Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] Database access restricted
- [ ] API keys rotated regularly
- [ ] Security headers configured
- [ ] Rate limits tuned
- [ ] Audit logs monitored

**Learn more:** [Security Documentation](./SECURITY.md)

---

## 🚀 Deployment

### Supported Platforms

| Platform | Component | Status |
|----------|-----------|--------|
| Render | Backend | ✅ Supported |
| Vercel | Frontend | ✅ Supported |
| MongoDB Atlas | Database | ✅ Supported |
| Cloudinary | File Storage | ✅ Supported |
| Docker | ChromaDB | ✅ Supported |

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented

**Learn more:** [Deployment Guide](./DEPLOYMENT.md)

---

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check connection string
   - Verify network access (Atlas)
   - Ensure MongoDB is running (local)

2. **Gemini API Errors**
   - Verify API key
   - Check quota limits
   - Review error messages

3. **ChromaDB Connection Issues**
   - Ensure Docker container is running
   - Check port 8000 availability
   - Verify CHROMA_URL in .env

**Learn more:** [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

## 📞 Support

### Getting Help

- **Documentation**: You're reading it! 📖
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/ethiolegal-ai/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/ethiolegal-ai/discussions)
- **Email**: support@ethiolegal-ai.com

### Contributing

We welcome contributions! Please read our [Contributing Guidelines](../CONTRIBUTING.md) to get started.

---

## 📝 Documentation Updates

This documentation is continuously updated. Last major update: January 2024

### Contributing to Documentation

Found an error or want to improve the docs?

1. Fork the repository
2. Edit the relevant `.md` file
3. Submit a pull request
4. Tag with `documentation` label

---

## 🎓 Learning Resources

### External Resources

- **MongoDB**: [Official Docs](https://docs.mongodb.com/)
- **Express.js**: [Official Guide](https://expressjs.com/en/guide/routing.html)
- **React**: [Official Docs](https://react.dev/)
- **Google Gemini**: [API Docs](https://ai.google.dev/docs)
- **ChromaDB**: [Official Docs](https://docs.trychroma.com/)

### Recommended Reading

- [Building RAG Applications](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [MongoDB Performance](https://www.mongodb.com/docs/manual/administration/analyzing-mongodb-performance/)
- [React Query Guide](https://tanstack.com/query/latest/docs/react/overview)

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] Real-time chat with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant support
- [ ] API rate limiting per user
- [ ] Webhook support
- [ ] GraphQL API
- [ ] Elasticsearch integration

**Track progress:** [GitHub Projects](https://github.com/yourusername/ethiolegal-ai/projects)

---

<div align="center">

**Built with ❤️ for Ethiopia**

[Main README](../README.md) • [Setup Guide](./SETUP.md) • [API Docs](./API.md) • [Contributing](../CONTRIBUTING.md)

</div>
