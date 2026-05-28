/**
 * Database Query Optimization Utilities
 * Provides query performance monitoring and optimization patterns
 */

/**
 * Query execution logger
 */
async function executeAndLogQuery(queryFn, description = "Query") {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const executionTime = Date.now() - startTime;
    
    // Log slow queries
    if (executionTime > 1000) {
      console.warn(`SLOW QUERY (${executionTime}ms): ${description}`);
    }
    
    return {
      result,
      executionTime,
      success: true,
    };
  } catch (err) {
    const executionTime = Date.now() - startTime;
    console.error(`QUERY ERROR (${executionTime}ms): ${description}`, err.message);
    
    throw {
      error: err.message,
      executionTime,
      success: false,
    };
  }
}

/**
 * Build optimized find query with common patterns
 */
function buildOptimizedQuery(baseQuery, options = {}) {
  let query = baseQuery;

  // Apply lean() for read-only operations
  if (options.lean) {
    query = query.lean();
  }

  // Apply select() for field projection
  if (options.select) {
    query = query.select(options.select);
  }

  // Apply populate() with limiting fields
  if (options.populate && Array.isArray(options.populate)) {
    for (const pop of options.populate) {
      if (typeof pop === "string") {
        query = query.populate(pop, "-password"); // Exclude sensitive fields
      } else if (typeof pop === "object") {
        query = query.populate(pop);
      }
    }
  }

  // Apply sort
  if (options.sort) {
    query = query.sort(options.sort);
  }

  // Apply limit
  if (options.limit) {
    query = query.limit(options.limit);
  }

  // Apply skip
  if (options.skip) {
    query = query.skip(options.skip);
  }

  return query;
}

/**
 * Batch operations for better performance
 */
async function batchOperation(items, operation, batchSize = 100) {
  const results = [];
  const errors = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    
    try {
      const batchResults = await Promise.all(
        batch.map((item) => operation(item))
      );
      results.push(...batchResults);
    } catch (err) {
      errors.push({
        batchIndex: Math.floor(i / batchSize),
        error: err.message,
      });
    }
  }

  return { results, errors };
}

/**
 * Bulk write operations for efficiency
 */
async function bulkWriteOperations(model, operations) {
  if (!operations || operations.length === 0) {
    return { acknowledged: false, insertedCount: 0, modifiedCount: 0 };
  }

  try {
    const result = await model.bulkWrite(operations, { ordered: false });
    return result;
  } catch (err) {
    console.error("Bulk write error:", err.message);
    throw err;
  }
}

/**
 * Cache query results with TTL
 */
class QueryCache {
  constructor(ttlSeconds = 300) {
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000;
  }

  set(key, value) {
    const expiresAt = Date.now() + this.ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  generateKey(prefix, data) {
    return `${prefix}:${JSON.stringify(data)}`;
  }
}

/**
 * Connection pooling helpers
 */
const getConnectionStats = () => {
  if (!global.mongooseConnection) return null;
  
  return {
    readyState: global.mongooseConnection.readyState,
    collections: global.mongooseConnection.collections,
    models: global.mongooseConnection.modelNames(),
  };
};

/**
 * Index creation helpers
 */
async function ensureIndexes(model) {
  try {
    await model.collection.getIndexes();
    console.log(`Indexes verified for ${model.modelName}`);
  } catch (err) {
    console.error(`Error verifying indexes for ${model.modelName}:`, err.message);
  }
}

/**
 * Query profiling
 */
async function profileQuery(model, query, options = {}) {
  const startTime = Date.now();
  
  let queryObj = model.find(query);
  
  if (options.select) queryObj = queryObj.select(options.select);
  if (options.sort) queryObj = queryObj.sort(options.sort);
  if (options.limit) queryObj = queryObj.limit(options.limit);
  
  const result = await queryObj.explain("executionStats");
  const executionTime = Date.now() - startTime;
  
  return {
    executionTime,
    stats: result,
    docsScanned: result.executionStats?.totalDocsExamined || 0,
    docsReturned: result.executionStats?.nReturned || 0,
    efficiency: result.executionStats?.nReturned / (result.executionStats?.totalDocsExamined || 1),
  };
}

module.exports = {
  executeAndLogQuery,
  buildOptimizedQuery,
  batchOperation,
  bulkWriteOperations,
  QueryCache,
  getConnectionStats,
  ensureIndexes,
  profileQuery,
};
