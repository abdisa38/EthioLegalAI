/**
 * Query Optimization Utilities
 * Provides helpers for optimizing MongoDB queries
 */

/**
 * Build optimized query with proper indexing hints
 */
class QueryOptimizer {
  /**
   * Optimize find queries with lean and select
   */
  static optimizeFind(query, options = {}) {
    const {
      lean = true,
      select = null,
      populate = null,
      sort = null,
      limit = null,
      skip = null,
    } = options;

    let optimizedQuery = query;

    // Apply lean for read-only queries (faster)
    if (lean) {
      optimizedQuery = optimizedQuery.lean();
    }

    // Apply field selection to reduce data transfer
    if (select) {
      optimizedQuery = optimizedQuery.select(select);
    }

    // Apply population with field selection
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach((pop) => {
          optimizedQuery = optimizedQuery.populate(pop);
        });
      } else {
        optimizedQuery = optimizedQuery.populate(populate);
      }
    }

    // Apply sorting
    if (sort) {
      optimizedQuery = optimizedQuery.sort(sort);
    }

    // Apply pagination
    if (skip !== null) {
      optimizedQuery = optimizedQuery.skip(skip);
    }

    if (limit !== null) {
      optimizedQuery = optimizedQuery.limit(limit);
    }

    return optimizedQuery;
  }

  /**
   * Build compound query conditions efficiently
   */
  static buildCompoundQuery(filters = {}) {
    const query = {};

    // Handle text search
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Handle date ranges
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    // Handle numeric ranges
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
      const field = filters.numericField || 'value';
      query[field] = {};
      if (filters.minValue !== undefined) {
        query[field].$gte = filters.minValue;
      }
      if (filters.maxValue !== undefined) {
        query[field].$lte = filters.maxValue;
      }
    }

    // Handle array filters
    if (filters.categories && Array.isArray(filters.categories)) {
      query.category = { $in: filters.categories };
    }

    // Handle boolean filters
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.isDeleted !== undefined) {
      query.isDeleted = filters.isDeleted;
    }

    // Handle user filter
    if (filters.userId) {
      query.userId = filters.userId;
    }

    return query;
  }

  /**
   * Optimize aggregation pipelines
   */
  static optimizeAggregation(pipeline) {
    // Move $match stages to the beginning
    const matchStages = [];
    const otherStages = [];

    pipeline.forEach((stage) => {
      if (stage.$match) {
        matchStages.push(stage);
      } else {
        otherStages.push(stage);
      }
    });

    // Combine multiple $match stages
    if (matchStages.length > 1) {
      const combinedMatch = { $match: {} };
      matchStages.forEach((stage) => {
        Object.assign(combinedMatch.$match, stage.$match);
      });
      return [combinedMatch, ...otherStages];
    }

    return [...matchStages, ...otherStages];
  }

  /**
   * Add index hints for complex queries
   */
  static addIndexHint(query, indexName) {
    return query.hint(indexName);
  }

  /**
   * Batch operations for better performance
   */
  static async batchUpdate(model, updates, batchSize = 100) {
    const results = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const operations = batch.map((update) => ({
        updateOne: {
          filter: update.filter,
          update: update.update,
          upsert: update.upsert || false,
        },
      }));

      const result = await model.bulkWrite(operations, { ordered: false });
      results.push(result);
    }

    return results;
  }

  /**
   * Batch inserts for better performance
   */
  static async batchInsert(model, documents, batchSize = 100) {
    const results = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const result = await model.insertMany(batch, { ordered: false });
      results.push(...result);
    }

    return results;
  }

  /**
   * Check if query can use covered index
   */
  static isCoveredQuery(model, query, projection) {
    // This is a helper to remind developers to use covered queries
    // A covered query is one where all fields in the query and projection
    // are part of an index
    console.log('Tip: Ensure query fields and projection are covered by an index');
    return query.select(projection);
  }

  /**
   * Optimize population with field selection
   */
  static optimizePopulate(populateConfig) {
    if (typeof populateConfig === 'string') {
      return {
        path: populateConfig,
        select: '_id name email', // Default minimal fields
      };
    }

    if (!populateConfig.select) {
      populateConfig.select = '_id name';
    }

    return populateConfig;
  }
}

/**
 * Query performance monitoring
 */
class QueryMonitor {
  static async measureQuery(queryFn, label = 'Query') {
    const startTime = Date.now();
    const result = await queryFn();
    const duration = Date.now() - startTime;

    if (duration > 1000) {
      console.warn(`⚠️  Slow query detected: ${label} took ${duration}ms`);
    } else if (duration > 500) {
      console.log(`⚡ ${label} took ${duration}ms`);
    }

    return { result, duration };
  }

  static async explainQuery(query) {
    const explanation = await query.explain('executionStats');
    
    console.log('Query Execution Stats:');
    console.log('- Execution Time:', explanation.executionStats.executionTimeMillis, 'ms');
    console.log('- Documents Examined:', explanation.executionStats.totalDocsExamined);
    console.log('- Documents Returned:', explanation.executionStats.nReturned);
    console.log('- Index Used:', explanation.executionStats.executionStages.indexName || 'COLLSCAN');

    return explanation;
  }
}

module.exports = {
  QueryOptimizer,
  QueryMonitor,
};
