# MongoDB Database Architecture - Enterprise Grade

## Overview

The database architecture is designed with enterprise-level patterns including:

- ✅ Optimized indexing strategies
- ✅ Soft delete architecture
- ✅ Activity tracking
- ✅ User analytics
- ✅ Query performance optimization
- ✅ Pagination utilities
- ✅ Data validation
- ✅ TTL indexes for automatic cleanup
- ✅ Compound indexes for common queries
- ✅ Lean query optimization

---

## Collections

### 1. Users
**Purpose:** Store user account information and authentication data

**Indexes:**
- `email` + `isDeleted` (compound) - Fast user lookup
- `createdAt` - Sort recent users
- `lastLoginAt` - Track activity
- `isActive` + `isDeleted` (compound) - Get active users

**Key Features:**
- Soft delete support (isDeleted field)
- Login tracking (lastLoginAt, loginCount)
- Profile information (bio, avatar, phone)
- Preferences (notifications, theme)
- Password hashing with bcryptjs
- Email validation

**Schema Validation:**
```javascript
{
  name: String (2-100 chars),
  email: String (unique, valid format),
  password: String (hashed, 6+ chars),
  role: Enum ["user", "admin"],
  languagePreference: Enum ["en", "am", "om"],
  isActive: Boolean,
  isDeleted: Boolean,
  lastLoginAt: Date,
  profile: { bio, avatarUrl, phone },
  preferences: { emailNotifications, marketingEmails, theme }
}
```

---

### 2. Chats
**Purpose:** Store AI conversation history and messages

**Indexes:**
- `userId` + `createdAt` - Get user's chats
- `userId` + `category` + `createdAt` - Filter by category
- `userId` + `starred` - Get starred chats
- `createdAt` - Recent chats

**Key Features:**
- Soft delete support
- Star/favorite functionality
- AI confidence scoring
- Source attribution for RAG
- Token usage tracking
- Response time measurement

**Schema Validation:**
```javascript
{
  userId: ObjectId (required, indexed),
  question: String (max 5000),
  answer: String (max 10000),
  language: Enum ["en", "am", "om"],
  title: String (max 200),
  category: Enum ["General", "Tenant", "Labor", "Contract", "Notice"],
  starred: Boolean,
  aiConfidence: Number (0-100),
  sources: [{ documentId, chunkIndex, relevanceScore }],
  responseTime: Number (ms),
  tokens: { inputTokens, outputTokens }
}
```

---

### 3. Documents
**Purpose:** Store uploaded legal documents and analysis results

**Indexes:**
- `userId` + `createdAt` - Get user's documents
- `userId` + `category` - Filter by category
- `userId` + `isDeleted` - Soft delete tracking
- `riskScore` - Sort by risk

**Key Features:**
- Soft delete support
- File metadata tracking (MIME type, size)
- Contract analysis results
- RAG chunks with embeddings
- View tracking
- Category classification

**Nested Collections:**
- Analysis results with risk breakdown
- Chunks for RAG with embeddings

**Schema Validation:**
```javascript
{
  userId: ObjectId (required),
  filename: String (required),
  cloudinaryUrl: String,
  mimeType: String (PDF/text),
  fileSize: Number,
  extractedText: String,
  category: Enum ["Rental", "Labor", "Contract", "Notice", "General"],
  analysis: {
    riskScore: Number (0-100),
    risks: Array,
    keyFacts: Array,
    suggestedActions: Array
  },
  chunks: Array of {
    index, text, hash, embedding, category, confidence
  }
}
```

---

### 4. Activities
**Purpose:** Audit log for all user actions

**Indexes:**
- `userId` + `createdAt` - User's activity history
- `action` + `createdAt` - Filter by action type
- `userId` + `action` + `createdAt` - Combined filter
- `createdAt` (TTL) - Auto-cleanup after 90 days

**Key Features:**
- Soft delete compatible
- IP tracking for security
- User agent tracking
- Error logging
- Execution time measurement
- TTL index for automatic cleanup

**Actions Tracked:**
- LOGIN, LOGOUT
- CHAT_CREATED, CHAT_DELETED
- DOCUMENT_UPLOADED, DOCUMENT_DELETED, DOCUMENT_ANALYZED
- SETTINGS_UPDATED, PROFILE_UPDATED

---

### 5. User Analytics
**Purpose:** Aggregate statistics per user

**Indexes:**
- `userId` - Direct lookup
- `lastActiveAt` - Sort by activity
- `totalAiRequests` - Engagement ranking

**Key Metrics:**
- Chat statistics (created, deleted, current count)
- Document statistics (uploaded, deleted, current count)
- AI usage (tokens, requests, response time)
- Language preferences breakdown
- Category usage breakdown
- Engagement metrics

**Methods:**
- `incrementChatsCreated()` - Update on chat creation
- `incrementDocumentsUploaded(sizeInBytes)` - Track document uploads
- `recordAiUsage(tokens, responseTime, confidence, language, category)`
- `updateLastActive()` - Track engagement
- `getTopEngaged()` - Find most active users

---

### 6. AI Usage
**Purpose:** Detailed tracking of AI API usage

**Indexes:**
- `userId` + `createdAt` - User's AI requests
- `requestType` + `createdAt` - Filter by request type
- `status` - Success/failure tracking
- `createdAt` (TTL) - Auto-cleanup after 180 days

**Request Types:**
- CHAT
- CONTRACT_ANALYSIS
- TENANT_ASSIST
- LABOR_ASSIST
- DOCUMENT_SUMMARY

**Metrics:**
- Token usage (input, output, total)
- Response time
- AI confidence
- Risk scores
- Cost estimation
- Error tracking

**Aggregation Methods:**
- `getUserStats(userId, days)` - Period-based stats
- `getRequestTypeStats(userId)` - By request type
- `getLanguageStats(userId)` - Language distribution
- `getHourlyStats(userId, hoursBack)` - Time-series data

---

## Query Patterns

### Optimized Get User's Chats
```javascript
// Uses index: userId + createdAt
Chat.find({ userId, isDeleted: false })
  .sort({ createdAt: -1 })
  .limit(20)
  .lean() // Important for read-only
```

### Paginated Chat History
```javascript
const pagination = parsePagination(req.query);
executePaginatedQuery(
  Chat,
  { userId, isDeleted: false },
  pagination,
  'question answer title -_id',
  null
)
```

### Activity Audit Trail
```javascript
Activity.find({ userId })
  .sort({ createdAt: -1 })
  .limit(50)
  .lean()
```

### Document Analysis Summary
```javascript
Document.aggregate([
  { $match: { userId, isDeleted: false } },
  { $group: {
      _id: "$category",
      count: { $sum: 1 },
      avgRiskScore: { $avg: "$riskScore" }
    }
  },
  { $sort: { count: -1 } }
])
```

---

## Pagination

### Offset-Based (Default)
```javascript
const { page = 1, limit = 20 } = req.query;
const skip = (page - 1) * limit;

Chat.find()
  .skip(skip)
  .limit(limit)
  .sort({ createdAt: -1 })
```

### Cursor-Based (Large Datasets)
```javascript
getCursorPaginated(
  Chat,
  { userId, isDeleted: false },
  cursor,
  20,
  '_id'
)
```

### With Aggregation
```javascript
getAggregatedWithPagination(
  Activity,
  [
    { $match: { userId } },
    { $group: { _id: "$action", count: { $sum: 1 } } }
  ],
  pagination
)
```

---

## Performance Optimization

### Lean Queries
Use `.lean()` for read-only queries:
```javascript
// Fast! Returns plain objects
User.find({}).lean()

// Slower. Returns Mongoose documents
User.find({})
```

### Field Projection
Select only needed fields:
```javascript
Chat.find().select('question answer title -_id')
```

### Batch Operations
For bulk updates:
```javascript
bulkWriteOperations(Chat, [
  { updateOne: { filter: { _id: id1 }, update: { $set: { starred: true } } } },
  { updateOne: { filter: { _id: id2 }, update: { $set: { starred: false } } } }
])
```

### Query Caching
```javascript
const cache = new QueryCache(300); // 5 min TTL
const key = cache.generateKey('user_chats', { userId });

// First time: query DB
let chats = cache.get(key);
if (!chats) {
  chats = await Chat.find({ userId });
  cache.set(key, chats);
}
```

---

## Soft Delete Architecture

### Mark as Deleted (No Data Loss)
```javascript
await user.softDelete(); // Sets isDeleted=true, deletedAt=now
```

### Query Only Active Records
```javascript
// Custom query helper
User.find().where('isDeleted', false)

// Or explicit
User.find({ isDeleted: false })
```

### Restore Deleted Record
```javascript
await deletedUser.restore(); // Reverses soft delete
```

### Cleanup Old Deleted Records (Optional)
```javascript
// Delete records soft-deleted >90 days ago
await cleanupSoftDeletedRecords(90);
```

---

## Activity Tracking

### Automatic Logging
```javascript
await Activity.logActivity({
  userId,
  action: 'CHAT_CREATED',
  resourceType: 'Chat',
  resourceId: chatId,
  details: { category: 'Tenant' },
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  statusCode: 200,
  executionTime: 150,
  success: true
});
```

### Query User Activity
```javascript
// Get user's recent activity
const activities = await Activity.recentForUser(userId, 50);

// Get by action type
const logins = await Activity.find({ 
  userId, 
  action: 'LOGIN' 
}).sort({ createdAt: -1 });
```

---

## Analytics Tracking

### Record AI Usage
```javascript
analytics.recordAiUsage(
  tokens = 150,
  responseTime = 2500,
  confidence = 92,
  language = 'en',
  category = 'Tenant'
);
```

### Get User Engagement Stats
```javascript
const stats = await AIUsage.getUserStats(userId, 30); // Last 30 days

// Result:
{
  totalRequests: 45,
  totalTokens: 6750,
  averageResponseTime: 2100,
  averageConfidence: 88,
  successCount: 44,
  failureCount: 1,
  totalCost: 0.45
}
```

### Language Usage Distribution
```javascript
const langStats = await AIUsage.getLanguageStats(userId);
// [{ _id: 'en', count: 35, totalTokens: 5250 }, ...]
```

---

## Index Strategy

### Index Types Used

1. **Single Field Indexes:**
   ```javascript
   schema.index({ createdAt: 1 })
   schema.index({ userId: 1 })
   schema.index({ isDeleted: 1 })
   ```

2. **Compound Indexes:**
   ```javascript
   schema.index({ userId: 1, createdAt: -1 })
   schema.index({ userId: 1, category: 1, createdAt: -1 })
   ```

3. **TTL Indexes (Auto-cleanup):**
   ```javascript
   schema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 })
   ```

4. **Unique Indexes:**
   ```javascript
   schema.index({ email: 1 }, { unique: true })
   schema.index({ tokenHash: 1 }, { unique: true })
   ```

---

## Database Maintenance

### Run Migrations
```javascript
const { runAllMigrations } = require('./utils/dbMigrations');
await runAllMigrations();
```

### Health Check
```javascript
const { performHealthCheck } = require('./utils/dbMigrations');
const health = await performHealthCheck();
console.log(health);
```

### Create Indexes
```javascript
const { createAllIndexes } = require('./utils/dbMigrations');
await createAllIndexes();
```

---

## Best Practices

### ✅ DO:
- Use `.lean()` for read operations
- Use indexes for common queries
- Batch operations for bulk updates
- Use TTL indexes for auto-cleanup
- Validate at schema level
- Use compound indexes for multi-field queries
- Cache frequently accessed data
- Monitor query performance

### ❌ DON'T:
- Query all fields when you only need a few
- Use `.save()` in loops (batch instead)
- Create queries without indexes
- Store passwords as plaintext
- Skip validation
- Use too many nested populations
- Query without filtering
- Ignore slow query logs

---

## Migration Checklist

- [ ] Run `npm install` to get all dependencies
- [ ] Create MongoDB cluster on Atlas
- [ ] Update `MONGODB_URI` in `.env`
- [ ] Run migration script: `node -e "require('./utils/dbMigrations').runAllMigrations()"`
- [ ] Verify indexes created: `db.collection.getIndexes()`
- [ ] Test CRUD operations
- [ ] Monitor slow queries
- [ ] Setup automated backups

---

**Enterprise-Grade Database Architecture ✅**
