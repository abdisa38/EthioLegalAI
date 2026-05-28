# Database Quick Reference Guide

## 🚀 Quick Start

### Initialize Database
```bash
npm run db:init
```

### Migrate Existing Data
```bash
npm run db:migrate
```

---

## 📖 Common Patterns

### 1. Pagination

```javascript
// Simple pagination
const { data, pagination } = await User.paginate(
  { isActive: true },
  { page: 1, limit: 10 }
);

// With sorting and population
const { data, pagination } = await Document.paginate(
  { userId },
  {
    page: 1,
    limit: 20,
    sort: { createdAt: -1 },
    populate: { path: 'userId', select: 'name email' }
  }
);
```

### 2. Search

```javascript
// Full-text search
const results = await Document.searchDocuments(
  userId,
  "search term",
  { page: 1, limit: 10 }
);

// Manual text search
const docs = await Document.find({
  $text: { $search: "contract" }
}).select({ score: { $meta: "textScore" } });
```

### 3. Soft Delete

```javascript
// Soft delete
await document.softDelete(userId);

// Restore
await document.restore();

// Query only active records
const active = await Document.find().active();

// Include deleted records
const all = await Document.find(); // Default excludes deleted
```

### 4. Activity Logging

```javascript
await Activity.logActivity({
  userId: req.user._id,
  action: 'DOCUMENT_UPLOADED',
  resourceType: 'Document',
  resourceId: doc._id,
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
  executionTime: 150,
  success: true,
});
```

### 5. Analytics Tracking

```javascript
// Get or create analytics
const analytics = await UserAnalytics.getOrCreate(userId);

// Track chat creation
await analytics.incrementChatsCreated();

// Track AI usage
await analytics.recordAiUsage({
  tokens: 1500,
  responseTime: 2000,
  confidence: 85,
  language: 'en',
  category: 'Contract',
  cost: 0.002,
  success: true,
  inputTokens: 500,
  outputTokens: 1000,
});

// Get engagement score
console.log(analytics.engagementScore); // 0-100
console.log(analytics.userLevel); // New/Beginner/etc.
```

### 6. Query Optimization

```javascript
// Lean query (faster, plain objects)
const users = await User.find({ isActive: true })
  .select('name email')
  .lean();

// With population
const docs = await Document.find({ userId })
  .populate({ path: 'userId', select: 'name email' })
  .select('filename category riskScore')
  .lean();

// Monitor performance
const { result, duration } = await QueryMonitor.measureQuery(
  () => Document.find({ userId }).lean(),
  'Find Documents'
);
```

---

## 🔍 Model Methods

### User Model

```javascript
// Authentication
const isMatch = await user.comparePassword(password);
await user.updateLastLogin(ipAddress);
await user.handleFailedLogin();
await user.unlock();

// Subscription checks
const canUpload = user.canUploadDocument(currentCount);
const canChat = user.canCreateChat(currentCount);
const hasSpace = user.hasStorageSpace(currentUsage, newFileSize);

// Query helpers
const activeUsers = await User.find().active();
const verifiedUsers = await User.find().verified();
const admins = await User.find().byRole('admin');
```

### Document Model

```javascript
// Document operations
await doc.trackView();
await doc.addAnalysis(analysisData);
await doc.addChunks(chunks);
const riskLevel = doc.getRiskLevel(); // low/medium/high/critical

// Statistics
const stats = await Document.getUserStats(userId);
const categoryStats = await Document.getCategoryStats(userId);
const riskDist = await Document.getRiskDistribution(userId);

// Query helpers
const analyzed = await Document.find().analyzed();
const highRisk = await Document.find().highRisk(70);
const recent = await Document.find().recent(7);
```

### Chat Model

```javascript
// Chat operations
await chat.toggleStar();
await chat.addRating(5, "Very helpful!");
await chat.addSources(ragSources);

// Statistics
const stats = await Chat.getUserStats(userId);
const categoryStats = await Chat.getCategoryStats(userId);
const thread = await Chat.getThreadMessages(threadId);

// Query helpers
const starred = await Chat.find().starred();
const highQuality = await Chat.find().highQuality(4);
const recent = await Chat.find().recent(7);
```

### Activity Model

```javascript
// Activity tracking
await Activity.logActivity(activityData);

// Statistics
const summary = await Activity.getUserSummary(userId, 30);
const timeline = await Activity.getTimeline(userId, 7);
const hourly = await Activity.getHourlyPattern(userId, 7);
const errors = await Activity.getErrorSummary(7);

// Query helpers
const userActivities = await Activity.find().recentForUser(userId, 50);
const failed = await Activity.find().failed();
const slow = await Activity.find().slow();
```

### AIUsage Model

```javascript
// AI usage tracking (automatic via middleware)
const usage = await AIUsage.create({
  userId,
  requestType: 'CHAT',
  language: 'en',
  inputTokens: 500,
  outputTokens: 1000,
  responseTime: 2000,
  confidence: 85,
  model: 'gemini-pro',
  status: 'success',
});

// Statistics
const stats = await AIUsage.getUserStats(userId, 30);
const typeStats = await AIUsage.getRequestTypeStats(userId, 30);
const trend = await AIUsage.getDailyTrend(userId, 30);
const modelComp = await AIUsage.getModelComparison(userId, 30);

// Query helpers
const successful = await AIUsage.find().successful();
const expensive = await AIUsage.find().expensive(0.01);
const slow = await AIUsage.find().slow(5000);
```

### RefreshToken Model

```javascript
// Token operations
await token.revoke('USER_LOGOUT', ipAddress);
await token.trackUsage(ipAddress);
const chain = await token.getReplacementChain();
const compromised = await token.isChainCompromised();

// Token management
const activeToken = await RefreshToken.findActiveToken(tokenHash);
await RefreshToken.revokeAllUserTokens(userId, 'USER_LOGOUT', ip);
await RefreshToken.revokeTokenFamily(tokenFamily, 'TOKEN_REUSE');

// Security
const sessions = await RefreshToken.getUserSessions(userId);
const suspicious = await RefreshToken.detectSuspiciousActivity(userId);

// Query helpers
const active = await RefreshToken.find().active();
const expired = await RefreshToken.find().expired();
```

---

## 📊 Aggregation Examples

### User Statistics
```javascript
const stats = await User.aggregate([
  { $match: { isActive: true } },
  {
    $group: {
      _id: '$subscription.plan',
      count: { $sum: 1 },
      avgLoginCount: { $avg: '$loginCount' }
    }
  }
]);
```

### Document Risk Analysis
```javascript
const riskAnalysis = await Document.aggregate([
  { $match: { userId: mongoose.Types.ObjectId(userId) } },
  {
    $bucket: {
      groupBy: '$riskScore',
      boundaries: [0, 25, 50, 75, 100],
      default: 'unknown',
      output: {
        count: { $sum: 1 },
        avgSize: { $avg: '$fileSize' }
      }
    }
  }
]);
```

### Chat Engagement
```javascript
const engagement = await Chat.aggregate([
  { $match: { userId: mongoose.Types.ObjectId(userId) } },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
      },
      count: { $sum: 1 },
      avgConfidence: { $avg: '$aiConfidence' }
    }
  },
  { $sort: { _id: -1 } },
  { $limit: 30 }
]);
```

---

## 🔧 Utility Functions

### Pagination
```javascript
const { paginate, cursorPaginate, aggregatePaginate } = require('./utils/pagination');

// Offset pagination
const result = await paginate(Model, query, options);

// Cursor pagination
const result = await cursorPaginate(Model, query, options);

// Aggregation pagination
const result = await aggregatePaginate(Model, pipeline, options);
```

### Query Optimizer
```javascript
const { QueryOptimizer, QueryMonitor } = require('./utils/queryOptimizer');

// Build optimized query
const query = QueryOptimizer.optimizeFind(
  Model.find({ userId }),
  { lean: true, select: 'name email' }
);

// Measure performance
const { result, duration } = await QueryMonitor.measureQuery(
  () => Model.find(query),
  'Query Label'
);

// Explain query
const explanation = await QueryMonitor.explainQuery(query);
```

---

## 🎯 Best Practices

### 1. Always Use Pagination
```javascript
// ❌ Bad - loads all records
const docs = await Document.find({ userId });

// ✅ Good - paginated
const { data } = await Document.paginate({ userId }, { limit: 10 });
```

### 2. Use Lean for Read-Only
```javascript
// ❌ Bad - full Mongoose documents
const users = await User.find();

// ✅ Good - plain objects
const users = await User.find().lean();
```

### 3. Select Only Needed Fields
```javascript
// ❌ Bad - all fields
const users = await User.find();

// ✅ Good - specific fields
const users = await User.find().select('name email').lean();
```

### 4. Use Query Helpers
```javascript
// ❌ Bad - manual filtering
const docs = await Document.find({ isDeleted: false, userId });

// ✅ Good - query helper
const docs = await Document.find({ userId }).active();
```

### 5. Track Activities
```javascript
// ✅ Always log important actions
await Activity.logActivity({
  userId,
  action: 'DOCUMENT_DELETED',
  resourceType: 'Document',
  resourceId: docId,
  success: true,
});
```

---

## 🐛 Debugging

### Check Index Usage
```javascript
const explanation = await Document.find({ userId })
  .explain('executionStats');
console.log(explanation.executionStats);
```

### Monitor Slow Queries
```javascript
// Enable in development
mongoose.set('debug', true);

// Or use QueryMonitor
const { duration } = await QueryMonitor.measureQuery(
  () => Model.find(query),
  'Query Name'
);
```

### Check Database Health
```javascript
const { checkDatabaseHealth } = require('./config/db');
const health = await checkDatabaseHealth();
console.log(health);
```

---

## 📞 Quick Commands

```bash
# Initialize database
npm run db:init

# Run migration
npm run db:migrate

# Start server
npm start

# Development mode
npm run dev
```

---

## 🔗 Related Files

- **Models**: `backend/models/`
- **Utilities**: `backend/utils/`
- **Scripts**: `backend/scripts/`
- **Full Documentation**: `backend/models/README.md`
- **Summary**: `backend/DATABASE_REFACTORING_SUMMARY.md`
