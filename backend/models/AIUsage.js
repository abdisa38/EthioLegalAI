const mongoose = require("mongoose");

/**
 * Enhanced AI Usage Statistics Schema
 * Implements comprehensive AI usage tracking with cost estimation
 */
const aiUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requestType: {
      type: String,
      enum: [
        "CHAT",
        "CONTRACT_ANALYSIS",
        "TENANT_ASSIST",
        "LABOR_ASSIST",
        "DOCUMENT_SUMMARY",
        "DOCUMENT_EXTRACTION",
        "EMBEDDING_GENERATION",
        "SIMILARITY_SEARCH",
      ],
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["en", "am", "om"],
      default: "en",
      index: true,
    },
    
    // Token usage
    inputTokens: {
      type: Number,
      required: true,
      min: 0,
    },
    outputTokens: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTokens: {
      type: Number,
      required: true,
      min: 0,
    },
    
    // Performance metrics
    responseTime: {
      type: Number, // milliseconds
      required: true,
      min: 0,
      index: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    
    // Context information
    sourcesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    category: {
      type: String,
      enum: ["General", "Tenant", "Labor", "Contract", "Notice"],
      default: "General",
      index: true,
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ["success", "partial", "failed", "timeout", "rate_limited"],
      default: "success",
      index: true,
    },
    errorType: {
      type: String,
      enum: [
        "API_ERROR",
        "TIMEOUT",
        "RATE_LIMIT",
        "INVALID_INPUT",
        "INSUFFICIENT_CONTEXT",
        "MODEL_ERROR",
        "NETWORK_ERROR",
      ],
    },
    errorMessage: {
      type: String,
      maxlength: 1000,
    },
    
    // Model information
    model: {
      type: String,
      enum: [
        "gemini-pro",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "text-embedding-004",
      ],
      default: "gemini-pro",
      index: true,
    },
    modelVersion: {
      type: String,
      default: "latest",
    },
    
    // Cost tracking
    costEstimate: {
      type: Number,
      default: 0, // in USD
      min: 0,
    },
    
    // Request metadata
    requestId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    sessionId: {
      type: String,
      index: true,
    },
    
    // Quality metrics
    userRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    userFeedback: {
      type: String,
      maxlength: 500,
    },
    
    // Resource references
    resourceType: {
      type: String,
      enum: ["Chat", "Document", "Contract"],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "ai_usage",
  }
);

// ==================== INDEXES ====================
// Compound indexes for performance
aiUsageSchema.index({ userId: 1, createdAt: -1 });
aiUsageSchema.index({ userId: 1, requestType: 1, createdAt: -1 });
aiUsageSchema.index({ requestType: 1, status: 1, createdAt: -1 });
aiUsageSchema.index({ model: 1, createdAt: -1 });
aiUsageSchema.index({ status: 1, createdAt: -1 });
aiUsageSchema.index({ responseTime: -1 });
aiUsageSchema.index({ costEstimate: -1 });
aiUsageSchema.index({ sessionId: 1, createdAt: 1 });

// TTL index: keep for 180 days (configurable)
const ttlDays = parseInt(process.env.AI_USAGE_TTL_DAYS, 10) || 180;
aiUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: ttlDays * 24 * 60 * 60 });

// ==================== MIDDLEWARE ====================
// Calculate total tokens before save
aiUsageSchema.pre("save", function (next) {
  if (this.isModified("inputTokens") || this.isModified("outputTokens")) {
    this.totalTokens = this.inputTokens + this.outputTokens;
  }
  next();
});

// Estimate cost before save (Gemini pricing as of 2024)
aiUsageSchema.pre("save", function (next) {
  if (this.isModified("totalTokens") || this.isModified("model")) {
    const pricing = {
      "gemini-pro": { input: 0.00025 / 1000, output: 0.0005 / 1000 },
      "gemini-1.5-pro": { input: 0.00125 / 1000, output: 0.005 / 1000 },
      "gemini-1.5-flash": { input: 0.000075 / 1000, output: 0.0003 / 1000 },
      "text-embedding-004": { input: 0.00001 / 1000, output: 0 },
    };

    const modelPricing = pricing[this.model] || pricing["gemini-pro"];
    this.costEstimate =
      this.inputTokens * modelPricing.input +
      this.outputTokens * modelPricing.output;
  }
  next();
});

// ==================== QUERY HELPERS ====================
aiUsageSchema.query.byUser = function (userId) {
  return this.where({ userId }).sort({ createdAt: -1 });
};

aiUsageSchema.query.successful = function () {
  return this.where({ status: "success" });
};

aiUsageSchema.query.failed = function () {
  return this.where({ status: { $in: ["failed", "timeout", "rate_limited"] } });
};

aiUsageSchema.query.byModel = function (model) {
  return this.where({ model });
};

aiUsageSchema.query.expensive = function (minCost = 0.01) {
  return this.where({ costEstimate: { $gte: minCost } });
};

aiUsageSchema.query.slow = function (minTime = 5000) {
  return this.where({ responseTime: { $gte: minTime } });
};

// ==================== STATIC METHODS ====================
// Get user statistics
aiUsageSchema.statics.getUserStats = async function (userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        totalInputTokens: { $sum: "$inputTokens" },
        totalOutputTokens: { $sum: "$outputTokens" },
        averageResponseTime: { $avg: "$responseTime" },
        averageConfidence: { $avg: "$confidence" },
        successCount: {
          $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
        failureCount: {
          $sum: { $cond: [{ $ne: ["$status", "success"] }, 1, 0] },
        },
        totalCost: { $sum: "$costEstimate" },
        averageRating: { $avg: "$userRating" },
      },
    },
  ]);

  return stats[0] || {};
};

// Get request type breakdown
aiUsageSchema.statics.getRequestTypeStats = async function (userId, days = 30) {
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
        _id: "$requestType",
        count: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        averageTokens: { $avg: "$totalTokens" },
        averageResponseTime: { $avg: "$responseTime" },
        averageConfidence: { $avg: "$confidence" },
        totalCost: { $sum: "$costEstimate" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get language usage statistics
aiUsageSchema.statics.getLanguageStats = async function (userId, days = 30) {
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
        _id: "$language",
        count: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$costEstimate" },
      },
    },
  ]);
};

// Get hourly usage pattern
aiUsageSchema.statics.getHourlyStats = async function (userId, hoursBack = 24) {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hoursBack);

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
          $dateToString: { format: "%Y-%m-%d %H:00", date: "$createdAt" },
        },
        count: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        averageResponseTime: { $avg: "$responseTime" },
        totalCost: { $sum: "$costEstimate" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Get daily usage trend
aiUsageSchema.statics.getDailyTrend = async function (userId, days = 30) {
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
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$costEstimate" },
        averageResponseTime: { $avg: "$responseTime" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Get model usage comparison
aiUsageSchema.statics.getModelComparison = async function (userId, days = 30) {
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
        _id: "$model",
        count: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        averageResponseTime: { $avg: "$responseTime" },
        averageConfidence: { $avg: "$confidence" },
        totalCost: { $sum: "$costEstimate" },
        successRate: {
          $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get error analysis
aiUsageSchema.statics.getErrorAnalysis = async function (days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        status: { $ne: "success" },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          errorType: "$errorType",
          requestType: "$requestType",
        },
        count: { $sum: 1 },
        examples: { $push: "$errorMessage" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
};

// Get system-wide statistics
aiUsageSchema.statics.getSystemStats = async function (days = 1) {
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
        totalRequests: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$costEstimate" },
        averageResponseTime: { $avg: "$responseTime" },
        uniqueUsers: { $addToSet: "$userId" },
        successRate: {
          $avg: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        totalRequests: 1,
        totalTokens: 1,
        totalCost: 1,
        averageResponseTime: 1,
        uniqueUserCount: { $size: "$uniqueUsers" },
        successRate: { $multiply: ["$successRate", 100] },
      },
    },
  ]);
};

module.exports = mongoose.model("AIUsage", aiUsageSchema);
