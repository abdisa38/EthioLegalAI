/**
 * Reusable Pagination Utility
 * Provides consistent pagination across all models
 */

/**
 * Paginate query results
 * @param {Object} model - Mongoose model
 * @param {Object} query - Query conditions
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Paginated results
 */
const paginate = async (model, query = {}, options = {}) => {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = '',
    populate = null,
    lean = true,
  } = options;

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Max 100 items per page
  const skip = (pageNum - 1) * limitNum;

  // Build query
  let queryBuilder = model.find(query);

  // Apply select
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // Apply populate
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        queryBuilder = queryBuilder.populate(pop);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }

  // Apply sort
  queryBuilder = queryBuilder.sort(sort);

  // Apply pagination
  queryBuilder = queryBuilder.skip(skip).limit(limitNum);

  // Apply lean for better performance
  if (lean) {
    queryBuilder = queryBuilder.lean();
  }

  // Execute query and count in parallel
  const [results, totalCount] = await Promise.all([
    queryBuilder.exec(),
    model.countDocuments(query),
  ]);

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  return {
    data: results,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCount,
      limit: limitNum,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNum + 1 : null,
      prevPage: hasPrevPage ? pageNum - 1 : null,
    },
  };
};

/**
 * Cursor-based pagination for real-time data
 * Better for infinite scroll and real-time updates
 */
const cursorPaginate = async (model, query = {}, options = {}) => {
  const {
    cursor = null,
    limit = 10,
    sort = { createdAt: -1 },
    select = '',
    populate = null,
    lean = true,
  } = options;

  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  // Build query with cursor
  let queryBuilder = model.find(query);

  if (cursor) {
    const sortField = Object.keys(sort)[0];
    const sortOrder = sort[sortField];
    
    if (sortOrder === -1) {
      queryBuilder = queryBuilder.where(sortField).lt(cursor);
    } else {
      queryBuilder = queryBuilder.where(sortField).gt(cursor);
    }
  }

  // Apply select
  if (select) {
    queryBuilder = queryBuilder.select(select);
  }

  // Apply populate
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        queryBuilder = queryBuilder.populate(pop);
      });
    } else {
      queryBuilder = queryBuilder.populate(populate);
    }
  }

  // Apply sort and limit
  queryBuilder = queryBuilder.sort(sort).limit(limitNum + 1);

  // Apply lean
  if (lean) {
    queryBuilder = queryBuilder.lean();
  }

  const results = await queryBuilder.exec();
  const hasMore = results.length > limitNum;

  if (hasMore) {
    results.pop(); // Remove extra item
  }

  const nextCursor = hasMore && results.length > 0
    ? results[results.length - 1][Object.keys(sort)[0]]
    : null;

  return {
    data: results,
    pagination: {
      nextCursor,
      hasMore,
      limit: limitNum,
    },
  };
};

/**
 * Aggregation pagination
 * For complex queries with aggregation pipeline
 */
const aggregatePaginate = async (model, pipeline = [], options = {}) => {
  const {
    page = 1,
    limit = 10,
  } = options;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Create count pipeline
  const countPipeline = [...pipeline, { $count: 'total' }];

  // Create data pipeline
  const dataPipeline = [
    ...pipeline,
    { $skip: skip },
    { $limit: limitNum },
  ];

  // Execute both pipelines in parallel
  const [countResult, results] = await Promise.all([
    model.aggregate(countPipeline),
    model.aggregate(dataPipeline),
  ]);

  const totalCount = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalCount / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  return {
    data: results,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalCount,
      limit: limitNum,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? pageNum + 1 : null,
      prevPage: hasPrevPage ? pageNum - 1 : null,
    },
  };
};

module.exports = {
  paginate,
  cursorPaginate,
  aggregatePaginate,
};
