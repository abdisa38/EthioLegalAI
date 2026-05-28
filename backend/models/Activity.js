const mongoose = require("mongoose");

/**
 * Enhanced Activity Log Schema
 * Implements comprehensive activity tracking with TTL and aggregation support
 */
const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        // Authentication
        "LOGIN",
        "LOGOUT",
        "PASSWORD_RESET",
        "PASSWORD_CHANGED",
        "EMAIL_VERIFIED",
        
        // Chat operations
        "CHAT_CREATED",
        "CHAT_UPDATED",
        "CHAT_DELETED",
        "CHAT_STARRED",
        "CHAT_RATED",
        
        // Document operations
        "DOCUMENT_UPLOADED",
        "DOCUMENT_VIEWED",
        "DOCUMENT_DELETED",
        "DOCUMENT_ANALYZED",
        "DOCUMENT_EXPORTED",
        
        // Contract operations
        "CONTRACT_ANALYZED",
        "CONTRACT_EXPORTED",
        
        // Assistant operations
        "TENANT_QUERY",
        "LABOR_QUERY",
        
        // User operations
        "PROFILE_UPDATED",
        "SETTINGS_UPDATED",
        "SUBSCRIPTION_CHANGED",
        
        // System operations
        "EXPORT",
        "IMPORT",
        "BACKUP",
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ["User", "Chat", "Document", "Contract", "Settings", "System"],
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    
    // Activity details
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Request metadata
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
      maxlength: 500,
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
    },
    
    // Response metadata
    statusCode: {
      type: Number,
      enum: [200, 201, 204, 400, 401, 403, 404, 409, 422, 500, 503],
      index: true,
    },
    executionTime: {
      type: Number, // milliseconds
      default: 0,
      index: true,
    },
    success: {
      type: Boolean,
      default: true,
      index: true,
    },
    errorMessage: {
      type: String,
      maxlength: 1000,
    },
    errorStack: {
      type: String,
      select: false, // Don't include by default
    },
    
    // Session tracking
    sessionId: {
      type: String,
      index: true,
    },
    
    // Performance flags
    isSlow: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "activities",
  }
);

// ==================== INDEXES ====================
// Compound indexes for common queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, action: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });
activitySchema.index({ resourceType: 1, resourceId: 1 });
activitySchema.index({ success: 1, createdAt: -1 });
activitySchema.index({ sessionId: 1, createdAt: 1 });
activitySchema.index({ isSlow: 1, createdAt: -1 });

// TTL index: auto-delete after 90 days (configurable)
const ttlDays = parseInt(process.env.ACTIVITY_TTL_DAYS, 10) || 90;
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });

// ==================== MIDDLEWARE ====================
// Mark slow queries
activitySchema.pre("save", function (next) {
  if (this.executionTime > 1000) {
    this.isSlow = true;
  }
  next();
});

// ==================== QUERY HELPERS ====================
activitySchema.query.recentForUser = function (userId, limit = 50) {
  return this.where({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

activitySchema.query.byAction = function (action) {
  return this.where({ action }).sort({ createdAt: -1 });
};

activitySchema.query.successful = function () {
  return this.where({ success: true });
};

activitySchema.query.failed = function () {
  return this.where({ success: false });
};

activitySchema.query.slow = function () {
  return this.where({ isSlow: true });
};

activitySchema.query.bySession = function (sessionId) {
  return this.where({ sessionId }).sort({ createdAt: 1 });
};

activitySchema.query.inDateRange = function (startDate, endDate) {
  return this.where({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });
};

// ==================== STATIC METHODS ====================
// Log activity with error handling
activitySchema.statics.logActivity = async function (activityData) {
  try {
    const activity = new this(activityData);
    return await activity.save();
  } catch (err) {
    console.error("Error logging activity:", err);
    return null;
  }
};

// Get user activity summary
activitySchema.statics.getUserSummary = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ["$success", true] }, 1, 0] },
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] },
        },
        averageExecutionTime: { $avg: "$executionTime" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get activity timeline
activitySchema.statics.getTimeline = async function (userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
        actions: { $push: "$action" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Get hourly activity pattern
activitySchema.statics.getHourlyPattern = async function (userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: { $hour: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Get resource activity
activitySchema.statics.getResourceActivity = async function (resourceType, resourceId) {
  return this.find({ resourceType, resourceId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

// Get system-wide stats
activitySchema.statics.getSystemStats = async function (days = 1) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        successCount: {
          $sum: { $cond: [{ $eq: ["$success", true] }, 1, 0] },
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ["$success", false] }, 1, 0] },
        },
        averageExecutionTime: { $avg: "$executionTime" },
        slowQueryCount: {
          $sum: { $cond: [{ $eq: ["$isSlow", true] }, 1, 0] },
        },
        uniqueUsers: { $addToSet: "$userId" },
      },
    },
    {
      $project: {
        totalActivities: 1,
        successCount: 1,
        failureCount: 1,
        averageExecutionTime: 1,
        slowQueryCount: 1,
        uniqueUserCount: { $size: "$uniqueUsers" },
      },
    },
  ]);
};

// Get error summary
activitySchema.statics.getErrorSummary = async function (days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        success: false,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          action: "$action",
          statusCode: "$statusCode",
        },
        count: { $sum: 1 },
        errors: { $push: "$errorMessage" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
};

// Clean old activities (manual cleanup if TTL is disabled)
activitySchema.statics.cleanOldActivities = async function (days = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const result = await this.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  return result;
};

module.exports = mongoose.model("Activity", activitySchema);
