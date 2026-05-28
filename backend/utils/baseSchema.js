/**
 * Base Schema Plugin
 * Provides common functionality for all schemas
 */

const mongoose = require('mongoose');

/**
 * Soft delete plugin
 * Adds soft delete functionality to any schema
 */
const softDeletePlugin = (schema) => {
  // Add soft delete fields if not already present
  if (!schema.path('isDeleted')) {
    schema.add({
      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },
    });
  }

  if (!schema.path('deletedAt')) {
    schema.add({
      deletedAt: {
        type: Date,
        default: null,
      },
    });
  }

  if (!schema.path('deletedBy')) {
    schema.add({
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    });
  }

  // Add query helpers
  schema.query.active = function () {
    return this.where({ isDeleted: false });
  };

  schema.query.deleted = function () {
    return this.where({ isDeleted: true });
  };

  schema.query.withDeleted = function () {
    return this.where({});
  };

  // Add instance methods
  schema.methods.softDelete = async function (deletedBy = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (deletedBy) {
      this.deletedBy = deletedBy;
    }
    return this.save();
  };

  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
  };

  // Add static methods
  schema.statics.softDeleteById = async function (id, deletedBy = null) {
    return this.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
      },
      { new: true }
    );
  };

  schema.statics.restoreById = async function (id) {
    return this.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
      { new: true }
    );
  };

  // Modify default find queries to exclude soft deleted
  const excludeDeleted = function (next) {
    if (!this.getQuery().isDeleted) {
      this.where({ isDeleted: false });
    }
    next();
  };

  // Apply to find queries (optional - can be enabled per model)
  // schema.pre('find', excludeDeleted);
  // schema.pre('findOne', excludeDeleted);
  // schema.pre('countDocuments', excludeDeleted);
};

/**
 * Timestamp plugin
 * Adds createdAt, updatedAt, and additional tracking
 */
const timestampPlugin = (schema) => {
  // Mongoose already adds timestamps with { timestamps: true }
  // This plugin adds additional tracking fields

  if (!schema.path('createdBy')) {
    schema.add({
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    });
  }

  if (!schema.path('updatedBy')) {
    schema.add({
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    });
  }

  // Track who made the last update
  schema.pre('save', function (next) {
    if (this.isNew && this._createdBy) {
      this.createdBy = this._createdBy;
    }
    if (this._updatedBy) {
      this.updatedBy = this._updatedBy;
    }
    next();
  });

  // Helper method to set user context
  schema.methods.setUser = function (userId) {
    this._updatedBy = userId;
    if (this.isNew) {
      this._createdBy = userId;
    }
    return this;
  };
};

/**
 * Pagination plugin
 * Adds pagination methods to schema
 */
const paginationPlugin = (schema) => {
  schema.statics.paginate = async function (query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      select = '',
      populate = null,
      lean = true,
    } = options;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let queryBuilder = this.find(query);

    if (select) queryBuilder = queryBuilder.select(select);
    if (populate) queryBuilder = queryBuilder.populate(populate);
    queryBuilder = queryBuilder.sort(sort).skip(skip).limit(limitNum);
    if (lean) queryBuilder = queryBuilder.lean();

    const [results, totalCount] = await Promise.all([
      queryBuilder.exec(),
      this.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      data: results,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  };
};

/**
 * Activity tracking plugin
 * Automatically logs activities for model changes
 */
const activityTrackingPlugin = (schema, options = {}) => {
  const { modelName, trackCreate = true, trackUpdate = true, trackDelete = true } = options;

  // Post save hook for create and update
  schema.post('save', async function (doc) {
    try {
      const Activity = mongoose.model('Activity');
      const isNew = doc._wasNew || false;

      if (isNew && trackCreate) {
        await Activity.logActivity({
          userId: doc.userId || doc.createdBy,
          action: `${modelName}_CREATED`,
          resourceType: modelName,
          resourceId: doc._id,
          details: { documentId: doc._id },
          success: true,
        });
      } else if (!isNew && trackUpdate) {
        await Activity.logActivity({
          userId: doc.userId || doc.updatedBy,
          action: `${modelName}_UPDATED`,
          resourceType: modelName,
          resourceId: doc._id,
          details: { documentId: doc._id },
          success: true,
        });
      }
    } catch (err) {
      console.error('Activity tracking error:', err);
    }
  });

  // Track if document is new
  schema.pre('save', function (next) {
    this._wasNew = this.isNew;
    next();
  });

  // Post remove hook for delete
  if (trackDelete) {
    schema.post('remove', async function (doc) {
      try {
        const Activity = mongoose.model('Activity');
        await Activity.logActivity({
          userId: doc.userId || doc.deletedBy,
          action: `${modelName}_DELETED`,
          resourceType: modelName,
          resourceId: doc._id,
          details: { documentId: doc._id },
          success: true,
        });
      } catch (err) {
        console.error('Activity tracking error:', err);
      }
    });
  }
};

/**
 * Validation helpers plugin
 */
const validationHelpersPlugin = (schema) => {
  // Add custom validation error formatter
  schema.post('save', function (error, doc, next) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      error.formattedErrors = errors;
    }
    next(error);
  });

  // Add duplicate key error handler
  schema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      error.message = `${field} already exists`;
      error.statusCode = 409;
    }
    next(error);
  });
};

/**
 * JSON transform plugin
 * Removes sensitive fields from JSON output
 */
const jsonTransformPlugin = (schema, options = {}) => {
  const { hide = ['__v', 'password'] } = options;

  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
      hide.forEach((field) => {
        delete ret[field];
      });
      return ret;
    },
  });

  schema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
      hide.forEach((field) => {
        delete ret[field];
      });
      return ret;
    },
  });
};

/**
 * Optimized indexing plugin
 * Ensures indexes are created efficiently
 */
const indexOptimizationPlugin = (schema) => {
  // Log index creation in development
  if (process.env.NODE_ENV === 'development') {
    schema.post('index', function (err) {
      if (err) {
        console.error('Index creation error:', err);
      } else {
        console.log('Indexes created successfully for', this.modelName);
      }
    });
  }
};

module.exports = {
  softDeletePlugin,
  timestampPlugin,
  paginationPlugin,
  activityTrackingPlugin,
  validationHelpersPlugin,
  jsonTransformPlugin,
  indexOptimizationPlugin,
};
