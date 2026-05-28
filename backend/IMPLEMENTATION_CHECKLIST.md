# Database Refactoring Implementation Checklist

## ✅ Pre-Implementation

- [ ] **Backup Database**
  ```bash
  mongodump --uri="mongodb://localhost:27017/ethiolegalai" --out=/path/to/backup
  ```

- [ ] **Review Changes**
  - [ ] Read `DATABASE_REFACTORING_SUMMARY.md`
  - [ ] Review `models/README.md`
  - [ ] Check `QUICK_REFERENCE.md`

- [ ] **Environment Setup**
  - [ ] Update `.env` file with new variables
  - [ ] Set `NODE_ENV` appropriately
  - [ ] Configure `MONGO_POOL_SIZE` if needed
  - [ ] Set TTL values if different from defaults

---

## 🔧 Implementation Steps

### Step 1: Install Dependencies (if needed)
```bash
cd backend
npm install
```

### Step 2: Run Migration
```bash
npm run db:migrate
```

**Expected Output:**
- ✅ Users migrated
- ✅ Documents migrated
- ✅ Chats migrated
- ✅ UserAnalytics created
- ✅ Indexes created

### Step 3: Initialize Database
```bash
npm run db:init
```

**Expected Output:**
- ✅ Indexes created for all models
- ✅ Database verified
- ✅ Collections listed

### Step 4: Create Admin User (Optional)
```bash
# Set environment variables
export CREATE_ADMIN=true
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=SecurePassword123

# Run init
npm run db:init
```

### Step 5: Test Database Connection
```bash
npm start
```

**Check:**
- [ ] Server starts without errors
- [ ] Database connection successful
- [ ] No index creation errors

---

## 🧪 Testing Checklist

### Basic Functionality
- [ ] **User Operations**
  - [ ] User registration works
  - [ ] User login works
  - [ ] Password reset works
  - [ ] Profile update works
  - [ ] Soft delete works

- [ ] **Document Operations**
  - [ ] Document upload works
  - [ ] Document retrieval works
  - [ ] Document analysis works
  - [ ] Document search works
  - [ ] Pagination works

- [ ] **Chat Operations**
  - [ ] Chat creation works
  - [ ] Chat retrieval works
  - [ ] Chat search works
  - [ ] Star/unstar works
  - [ ] Rating works

- [ ] **Analytics**
  - [ ] User analytics created
  - [ ] Metrics updated correctly
  - [ ] Milestones tracked
  - [ ] Engagement score calculated

### Advanced Features
- [ ] **Pagination**
  - [ ] Offset pagination works
  - [ ] Cursor pagination works
  - [ ] Aggregation pagination works

- [ ] **Search**
  - [ ] Full-text search works
  - [ ] Search results ranked correctly
  - [ ] Search pagination works

- [ ] **Activity Tracking**
  - [ ] Activities logged automatically
  - [ ] Activity queries work
  - [ ] Statistics generated correctly

- [ ] **AI Usage Tracking**
  - [ ] Usage recorded correctly
  - [ ] Cost calculated automatically
  - [ ] Statistics accurate

### Performance
- [ ] **Query Performance**
  - [ ] Queries use indexes (check with explain)
  - [ ] No slow queries (< 100ms for simple queries)
  - [ ] Pagination efficient

- [ ] **Index Usage**
  - [ ] All indexes created
  - [ ] Indexes used in queries
  - [ ] No collection scans for common queries

---

## 🔍 Verification Steps

### 1. Check Indexes
```javascript
// In MongoDB shell or Compass
db.users.getIndexes()
db.documents.getIndexes()
db.chats.getIndexes()
db.activities.getIndexes()
db.ai_usage.getIndexes()
db.user_analytics.getIndexes()
db.refreshtokens.getIndexes()
```

### 2. Verify Data Migration
```javascript
// Check user fields
db.users.findOne()

// Check document fields
db.documents.findOne()

// Check chat fields
db.chats.findOne()

// Check analytics exist
db.user_analytics.count()
```

### 3. Test Queries
```javascript
// Test pagination
const { data, pagination } = await User.paginate({}, { page: 1, limit: 10 });

// Test search
const results = await Document.searchDocuments(userId, "test", { page: 1 });

// Test analytics
const analytics = await UserAnalytics.findOne({ userId });
console.log(analytics.engagementScore);
```

### 4. Monitor Performance
```javascript
// Enable query logging
mongoose.set('debug', true);

// Run common queries and check execution time
const { duration } = await QueryMonitor.measureQuery(
  () => Document.find({ userId }).lean(),
  'Find Documents'
);
```

---

## 🚨 Troubleshooting

### Issue: Migration Fails
**Solution:**
1. Check MongoDB connection
2. Verify MongoDB version (4.4+)
3. Check error logs
4. Restore from backup if needed

### Issue: Indexes Not Created
**Solution:**
```bash
# Manually create indexes
npm run db:init
```

### Issue: Slow Queries
**Solution:**
1. Check index usage with `.explain()`
2. Add missing indexes
3. Use lean queries
4. Select only needed fields

### Issue: Duplicate Key Errors
**Solution:**
1. Check unique indexes
2. Verify data doesn't have duplicates
3. Handle conflicts in application

### Issue: Memory Issues
**Solution:**
1. Use pagination
2. Use lean queries
3. Select specific fields
4. Increase connection pool size

---

## 📊 Post-Implementation

### Monitor These Metrics
- [ ] Query execution time
- [ ] Index usage
- [ ] Database size
- [ ] Connection pool usage
- [ ] Error rates
- [ ] Slow query logs

### Regular Maintenance
- [ ] **Daily**
  - Monitor error logs
  - Check slow queries

- [ ] **Weekly**
  - Review database statistics
  - Check index usage
  - Monitor data growth

- [ ] **Monthly**
  - Clean old data (if TTL not enabled)
  - Review and optimize indexes
  - Analyze query patterns

---

## 🔄 Rollback Procedure

If critical issues occur:

### 1. Stop Application
```bash
# Stop the server
pm2 stop ethiolegalai
# or
kill <process-id>
```

### 2. Restore Database
```bash
# Restore from backup
mongorestore --uri="mongodb://localhost:27017/ethiolegalai" --drop /path/to/backup
```

### 3. Revert Code
```bash
git checkout <previous-commit>
npm install
```

### 4. Restart Application
```bash
npm start
```

---

## 📝 Documentation Updates

- [ ] Update API documentation
- [ ] Update developer guide
- [ ] Update deployment guide
- [ ] Update README files
- [ ] Document new features

---

## 🎯 Success Criteria

### Functional
- ✅ All existing features work
- ✅ New features accessible
- ✅ No data loss
- ✅ No breaking changes

### Performance
- ✅ Queries faster or same speed
- ✅ No slow queries (< 100ms)
- ✅ Pagination efficient
- ✅ Search responsive

### Quality
- ✅ Code follows patterns
- ✅ Documentation complete
- ✅ Tests passing
- ✅ No errors in logs

---

## 📞 Support Contacts

- **Database Issues**: Check `models/README.md`
- **Query Issues**: Check `QUICK_REFERENCE.md`
- **Migration Issues**: Check `scripts/migrate.js`
- **General Issues**: Check `DATABASE_REFACTORING_SUMMARY.md`

---

## ✨ Next Steps After Implementation

1. **Monitor Performance**
   - Use QueryMonitor for slow queries
   - Check database statistics regularly

2. **Optimize Further**
   - Add indexes based on usage patterns
   - Optimize frequently used queries

3. **Update Controllers**
   - Use new model methods
   - Implement pagination everywhere
   - Add activity tracking

4. **Enhance Features**
   - Build analytics dashboards
   - Add leaderboards
   - Implement milestone notifications

5. **Scale**
   - Configure replica sets
   - Implement caching
   - Add read replicas

---

## 🎉 Completion

Once all items are checked:
- [ ] All tests passing
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Team trained
- [ ] Monitoring in place

**Status**: Ready for Production ✅

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Maintained By**: Development Team
