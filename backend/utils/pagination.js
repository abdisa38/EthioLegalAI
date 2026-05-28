/**
 * Pagination Utilities
 * Provides reusable pagination logic for all MongoDB queries
 */

// Default pagination options
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parse pagination parameters from request
 * @param {Object} query - Express query object
 * @returns {Object} - { page, limit, skip, sort }
 */
function parsePagination(query) {
  let page = parseInt(query.page) || DEFAULT_PAGE;
  let limit = parseInt(query.limit) || DEFAULT_LIMIT;
  const sortBy = query.sortBy || "-createdAt";

  // Validate
  if (page < 1) page = DEFAULT_PAGE;
  if (limit < 1) limit = DEFAULT_LIMIT;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;

  const skip = (page - 1) * limit;

  // Parse sort string (e.g., "-createdAt" or "name")
  const sort = {};
  const sortField = sortBy.startsWith("-") ? sortBy.slice(1) : sortBy;
  const sortOrder = sortBy.startsWith("-") ? -1 : 1;
  sort[sortField] = sortOrder;

  return {
    page,
    limit,
    skip,
    sort,
    sortBy,
  };
}

/**
 * Execute paginated query with metadata
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query filter object
 * @param {Object} pagination - Pagination options
 * @param {String} select - Fields to select
 * @param {Array} populate - Fields to populate
 * @returns {Promise<Object>} - { data, pagination, total }
 */
async function executePaginatedQuery(
  model,
  query,
  pagination,
  select = null,
  populate = []
) {
  try {
    // Get total count
    const total = await model.countDocuments(query);

    // Execute query
    let queryBuilder = model.find(query);

    // Apply selections
    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    // Apply population
    if (populate && populate.length > 0) {
      for (const pop of populate) {
        queryBuilder = queryBuilder.populate(pop);
      }
    }

    // Apply sorting, skip, and limit
    const data = await queryBuilder
      .sort(pagination.sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean();

    // Calculate metadata
    const totalPages = Math.ceil(total / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPrevPage = pagination.page > 1;

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        skip: pagination.skip,
      },
    };
  } catch (err) {
    throw new Error(`Pagination query error: ${err.message}`);
  }
}

/**
 * Middleware to attach pagination to request
 */
function paginationMiddleware(req, res, next) {
  req.pagination = parsePagination(req.query);
  next();
}

/**
 * Format paginated response
 */
function formatPaginatedResponse(data, pagination, success = true) {
  return {
    success,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Cursor-based pagination for large datasets
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query filter
 * @param {String} cursor - Cursor for next page
 * @param {Number} limit - Results per page
 * @param {String} cursorField - Field to use for cursor (default: _id)
 */
async function getCursorPaginated(
  model,
  query,
  cursor = null,
  limit = 20,
  cursorField = "_id"
) {
  try {
    const finalQuery = { ...query };

    if (cursor) {
      finalQuery[cursorField] = { $gt: cursor };
    }

    const data = await model
      .find(finalQuery)
      .sort({ [cursorField]: 1 })
      .limit(limit + 1)
      .lean();

    const hasMore = data.length > limit;
    const results = data.slice(0, limit);
    const nextCursor = hasMore ? results[results.length - 1][cursorField] : null;

    return {
      data: results,
      hasMore,
      nextCursor,
    };
  } catch (err) {
    throw new Error(`Cursor pagination error: ${err.message}`);
  }
}

/**
 * Aggregate with pagination
 */
async function getAggregatedWithPagination(
  model,
  pipeline,
  pagination
) {
  try {
    // Add count stage
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await model.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add pagination stages
    const paginatedPipeline = [
      ...pipeline,
      { $sort: pagination.sort },
      { $skip: pagination.skip },
      { $limit: pagination.limit },
    ];

    const data = await model.aggregate(paginatedPipeline);

    const totalPages = Math.ceil(total / pagination.limit);
    const hasNextPage = pagination.page < totalPages;
    const hasPrevPage = pagination.page > 1;

    return {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (err) {
    throw new Error(`Aggregation pagination error: ${err.message}`);
  }
}

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  parsePagination,
  executePaginatedQuery,
  paginationMiddleware,
  formatPaginatedResponse,
  getCursorPaginated,
  getAggregatedWithPagination,
};
