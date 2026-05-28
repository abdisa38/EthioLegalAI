# EthioLegalAI Database Architecture

## Overview
This document describes the enhanced MongoDB database architecture for EthioLegalAI, implementing enterprise-level design patterns with optimized indexing, query performance, and scalability.

## Architecture Principles

### 1. **Soft Delete Pattern**
All models implement soft delete functionality to preserve data integrity and enable recovery:
- `isDeleted`: Boolean flag
- `deletedAt`: Timestamp of deletion
- `deletedBy`: Reference to user who deleted the record

### 2. **Timestamp Tracking**
Enhanced timestamp tracking beyond createdAt/updatedAt:
- `createdBy`: User who created the record
- `updatedBy`: User who last updated the record
- Automatic tracking through middleware

### 3. **Optimized Indexing**
Strategic index design for query performance:
- Compound indexes for common query patterns
- Text indexes for search functionality
- Sparse indexes for optional fields
- TTL indexes for automatic data cleanup

### 4. **Pagination Support**
Built-in pagination utilities:
- Offset-based pagination for traditional use cases
- Cursor-based pagination for real-time data
- Aggregation pagination for complex queries

### 5. **Activity Tracking**
Comprehensive activity logging:
- User actions tracked automatically
- Performance metrics captured
- Error tracking and analysis

## Models

### User Model
**Collection**: `users`

**Key Features**:
- Enhanced authentication with 2FA support
- Account locking after failed login attempts
- Subscription management with limits
- Email verification workflow
- Password reset functionality
- Comprehensive profile management

**Indexes**:
- `{ email: 1, isDeleted: 1 }` - Unique compound index
- `{ isActive: 1, isDeleted: 1 }` - Status queries
- `{ role: 1, isActive: 1 }` - Role-based queries
- `{ lastLoginAt: -1 }` - Recent activity
- Text index on name and email

**Virtual Fields**:
- `accountStatus`: Computed account state
- `isLocked`: Account lock status
- `documents`: Virtual populate to documents
- `chats`: Virtual populate to chats
- `analytics`: Virtual populate to analytics

**Methods**:
- `comparePassword()`: Secure password comparison
- `updateLastLogin()`: Track login activity
- `handleFailedLogin()`: Manage failed attempts
- `canUploadDocument()`: Check subscription limits
- `canCreateChat()`: Check subscription limits

---

### Document Model
**Collection**: `documents`

**Key Features**:
- Cloudinary integration for file storage
- Text extraction and analysis
- RAG (Retrieval-Augmented Generation) support with chunks
- Risk scoring and categorization
- View tracking
- Comprehensive analysis metadata

**Indexes**:
- `{ userId: 1, createdAt: -1 }` - User documents
- `{ userId: 1, category: 1, createdAt: -1 }` - Category filtering
- `{ category: 1, riskScore: -1 }` - Risk analysis
- `{ "chunks.category": 1 }` - RAG queries
- Text index on filename and summary

**Virtual Fields**:
- `status`: Document processing status
- `fileSizeMB`: File size in megabytes
- `processingStatus`: Detailed processing state

**Methods**:
- `trackView()`: Increment view counter
- `addAnalysis()`: Store analysis results
- `addChunks()`: Store RAG chunks
- `getRiskLevel()`: Get risk classification

**Static Methods**:
- `getUserStats()`: Aggregate user document statistics
- `getCategoryStats()`: Category breakdown
- `getRiskDistribution()`: Risk score distribution
- `searchDocuments()`: Full-text search

---

### Chat Model
**Collection**: `chats`

**Key Features**:
- Conversation threading support
- Multi-language support (English, Amharic, Oromo)
- User ratings and feedback
- RAG source tracking with relevance scores
- Token usage tracking
- Performance metrics

**Indexes**:
- `{ userId: 1, createdAt: -1 }` - User chats
- `{ userId: 1, category: 1, createdAt: -1 }` - Category filtering
- `{ threadId: 1, createdAt: 1 }` - Thread conversations
- `{ userId: 1, starred: 1, createdAt: -1 }` - Starred chats
- Text index on question, answer, and title

**Virtual Fields**:
- `status`: Chat status
- `qualityScore`: Computed quality metric
- `replies`: Virtual populate to thread replies

**Methods**:
- `toggleStar()`: Star/unstar chat
- `addRating()`: Add user rating
- `addSources()`: Store RAG sources

**Static Methods**:
- `getUserStats()`: User chat statistics
- `getCategoryStats()`: Category breakdown
- `getThreadMessages()`: Get conversation thread
- `searchChats()`: Full-text search

---

### Activity Model
**Collection**: `activities`

**Key Features**:
- Comprehensive action tracking
- Request/response metadata
- Performance monitoring
- Error tracking with stack traces
- Session tracking
- Geographic location tracking
- TTL-based automatic cleanup (90 days default)

**Indexes**:
- `{ userId: 1, createdAt: -1 }` - User activities
- `{ userId: 1, action: 1, createdAt: -1 }` - Action filtering
- `{ sessionId: 1, createdAt: 1 }` - Session tracking
- `{ isSlow: 1, createdAt: -1 }` - Performance monitoring
- TTL index on createdAt

**Static Methods**:
- `logActivity()`: Safe activity logging
- `getUserSummary()`: User activity summary
- `getTimeline()`: Daily activity timeline
- `getHourlyPattern()`: Usage patterns
- `getSystemStats()`: System-wide statistics
- `getErrorSummary()`: Error analysis

---

### AIUsage Model
**Collection**: `ai_usage`

**Key Features**:
- Token usage tracking (input/output/total)
- Cost estimation with model-specific pricing
- Performance metrics
- Quality tracking (confidence, ratings)
- Error categorization
- Request/response correlation
- TTL-based cleanup (180 days default)

**Indexes**:
- `{ userId: 1, createdAt: -1 }` - User usage
- `{ userId: 1, requestType: 1, createdAt: -1 }` - Type filtering
- `{ model: 1, createdAt: -1 }` - Model comparison
- `{ responseTime: -1 }` - Performance analysis
- `{ costEstimate: -1 }` - Cost tracking

**Middleware**:
- Automatic token total calculation
- Automatic cost estimation based on model pricing

**Static Methods**:
- `getUserStats()`: User AI usage statistics
- `getRequestTypeStats()`: Request type breakdown
- `getDailyTrend()`: Daily usage trends
- `getModelComparison()`: Model performance comparison
- `getErrorAnalysis()`: Error patterns
- `getSystemStats()`: System-wide AI usage

---

### UserAnalytics Model
**Collection**: `user_analytics`

**Key Features**:
- Comprehensive engagement metrics
- Feature usage tracking
- Milestone achievements
- Streak tracking
- Usage trends and patterns
- Quality metrics
- Leaderboard support

**Indexes**:
- `{ userId: 1 }` - Unique user analytics
- `{ "engagement.lastActiveAt": -1 }` - Activity tracking
- `{ "ai.totalRequests": -1 }` - Usage ranking
- `{ "engagement.streakDays": -1 }` - Streak leaderboard

**Virtual Fields**:
- `engagementScore`: Computed engagement metric (0-100)
- `userLevel`: User classification (New/Beginner/Intermediate/Advanced/Expert)

**Methods**:
- `incrementChatsCreated()`: Track chat creation
- `incrementDocumentsUploaded()`: Track document uploads
- `recordAiUsage()`: Track AI usage
- `updateLastActive()`: Update activity timestamp
- `recordLogin()`: Track login
- `checkMilestone()`: Check and award milestones

**Static Methods**:
- `getOrCreate()`: Get or create analytics record
- `getTopEngaged()`: Leaderboard
- `getSystemOverview()`: System-wide analytics

---

### RefreshToken Model
**Collection**: `refreshtokens`

**Key Features**:
- Secure token rotation
- Token family tracking for security
- Device and location tracking
- Usage monitoring
- Suspicious activity detection
- Automatic expiration with TTL
- Revocation with reason tracking

**Indexes**:
- `{ tokenHash: 1 }` - Unique token lookup
- `{ userId: 1, createdAt: -1 }` - User sessions
- `{ tokenFamily: 1, createdAt: -1 }` - Family tracking
- `{ expiresAt: 1 }` - TTL index

**Virtual Fields**:
- `isActive`: Token validity status
- `isExpired`: Expiration status
- `daysUntilExpiry`: Days remaining

**Methods**:
- `revoke()`: Revoke token with reason
- `trackUsage()`: Track token usage
- `getReplacementChain()`: Get rotation chain
- `isChainCompromised()`: Check security

**Static Methods**:
- `findActiveToken()`: Find valid token
- `revokeAllUserTokens()`: Logout all sessions
- `revokeTokenFamily()`: Revoke rotation chain
- `getUserSessions()`: Get active sessions
- `detectSuspiciousActivity()`: Security monitoring

---

## Utility Modules

### Pagination Utility (`utils/pagination.js`)
Provides three pagination strategies:
1. **Offset-based**: Traditional page-based pagination
2. **Cursor-based**: For real-time data and infinite scroll
3. **Aggregation**: For complex aggregation pipelines

### Query Optimizer (`utils/queryOptimizer.js`)
Tools for query optimization:
- `QueryOptimizer`: Query building and optimization
- `QueryMonitor`: Performance monitoring and profiling

### Base Schema Plugins (`utils/baseSchema.js`)
Reusable schema plugins:
- `softDeletePlugin`: Soft delete functionality
- `timestampPlugin`: Enhanced timestamp tracking
- `paginationPlugin`: Built-in pagination
- `activityTrackingPlugin`: Automatic activity logging
- `validationHelpersPlugin`: Enhanced validation
- `jsonTransformPlugin`: JSON output transformation

---

## Database Configuration

### Connection Options
- Connection pooling (configurable, default: 10)
- Automatic reconnection
- Compression enabled
- Read preference: primaryPreferred
- Retry writes and reads enabled

### Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/ethiolegalai
MONGO_POOL_SIZE=10
NODE_ENV=production
CREATE_INDEXES=true
ACTIVITY_TTL_DAYS=90
AI_USAGE_TTL_DAYS=180
```

### Health Monitoring
- `checkDatabaseHealth()`: Connection health check
- `getDatabaseStats()`: Database statistics

---

## Query Patterns

### Common Query Patterns

#### 1. Paginated User Documents
```javascript
const { data, pagination } = await Document.paginate(
  { userId, isDeleted: false },
  { page: 1, limit: 10, sort: { createdAt: -1 } }
);
```

#### 2. Search with Text Index
```javascript
const results = await Document.searchDocuments(
  userId,
  "contract terms",
  { page: 1, limit: 10 }
);
```

#### 3. Aggregation with Pagination
```javascript
const pipeline = [
  { $match: { userId } },
  { $group: { _id: "$category", count: { $sum: 1 } } }
];
const results = await aggregatePaginate(Document, pipeline, { page: 1, limit: 10 });
```

#### 4. Optimized Find with Lean
```javascript
const docs = await Document.find({ userId })
  .select('filename category riskScore')
  .lean()
  .limit(10);
```

---

## Performance Best Practices

### 1. Use Lean Queries
For read-only operations, use `.lean()` to return plain JavaScript objects:
```javascript
const users = await User.find().lean();
```

### 2. Select Only Required Fields
Reduce data transfer by selecting specific fields:
```javascript
const users = await User.find().select('name email');
```

### 3. Use Compound Indexes
Design indexes for your query patterns:
```javascript
// Query: { userId: 1, category: 'Contract', createdAt: -1 }
// Index: { userId: 1, category: 1, createdAt: -1 }
```

### 4. Batch Operations
Use bulk operations for multiple updates:
```javascript
await QueryOptimizer.batchUpdate(Model, updates, 100);
```

### 5. Monitor Slow Queries
Use QueryMonitor to identify slow queries:
```javascript
const { result, duration } = await QueryMonitor.measureQuery(
  () => Model.find(query),
  'Find Users'
);
```

---

## Migration Guide

### From Old Schema to New Schema

1. **Backup your database**
```bash
mongodump --uri="mongodb://localhost:27017/ethiolegalai"
```

2. **Run migration scripts** (if needed)
```javascript
// Add new fields with defaults
await User.updateMany({}, {
  $set: {
    'subscription.plan': 'free',
    'subscription.status': 'active'
  }
});
```

3. **Create indexes**
```javascript
await User.createIndexes();
await Document.createIndexes();
// ... for all models
```

4. **Verify data integrity**
```javascript
const stats = await getDatabaseStats();
console.log(stats);
```

---

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Clean expired tokens**
```javascript
await RefreshToken.cleanExpired();
```

2. **Clean old activities**
```javascript
await Activity.cleanOldActivities(90);
```

3. **Monitor index usage**
```javascript
const explanation = await QueryMonitor.explainQuery(query);
```

4. **Check database health**
```javascript
const health = await checkDatabaseHealth();
```

### Performance Monitoring

Monitor these metrics:
- Query execution time
- Index usage
- Collection sizes
- Connection pool usage
- Slow query logs

---

## Security Considerations

1. **Sanitization**: All queries are sanitized using `mongoose.set('sanitizeFilter', true)`
2. **Validation**: Comprehensive validation on all fields
3. **Soft Delete**: Prevents accidental data loss
4. **Token Security**: Secure token hashing and rotation
5. **Activity Logging**: Complete audit trail
6. **Rate Limiting**: Track and prevent abuse

---

## Scalability

### Horizontal Scaling
- Replica sets supported
- Read preference: primaryPreferred
- Connection pooling configured

### Vertical Scaling
- Optimized indexes reduce memory usage
- Lean queries reduce CPU usage
- TTL indexes automatic cleanup

### Data Growth Management
- TTL indexes for time-series data
- Soft delete for data retention
- Archival strategies for old data

---

## Support and Troubleshooting

### Common Issues

**Issue**: Slow queries
**Solution**: Use QueryMonitor.explainQuery() to analyze and add appropriate indexes

**Issue**: High memory usage
**Solution**: Use lean queries and field selection

**Issue**: Connection pool exhausted
**Solution**: Increase MONGO_POOL_SIZE environment variable

**Issue**: Duplicate key errors
**Solution**: Check unique indexes and handle conflicts in application logic

---

## Version History

- **v2.0.0** (Current): Enterprise-level refactoring with optimized indexing
- **v1.0.0**: Initial implementation

---

## Contributing

When adding new models or modifying existing ones:
1. Follow the established patterns
2. Add appropriate indexes
3. Include query helpers and static methods
4. Update this documentation
5. Add tests for new functionality
