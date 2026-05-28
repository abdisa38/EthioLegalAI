const mongoose = require("mongoose");

// AI usage statistics schema
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
      enum: ["CHAT", "CONTRACT_ANALYSIS", "TENANT_ASSIST", "LABOR_ASSIST", "DOCUMENT_SUMMARY"],
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ["en", "am", "om"],
      default: "en",
    },
    inputTokens: {
      type: Number,
      required: true,
    },
    outputTokens: {
      type: Number,
      required: true,
    },
    totalTokens: {
      type: Number,
      required: true,
    },
    responseTime: {
      type: Number, // milliseconds
      required: true,
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
    sourcesUsed: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["General", "Tenant", "Labor", "Contract", "Notice"],
      default: "General",
    },
    status: {
      type: String,
      enum: ["success", "partial", "failed"],
      default: "success",
      index: true,
    },
    errorType: String,
    errorMessage: String,
    model: {
      type: String,
      enum: ["gemini-pro", "gemini-1.5"],
      default: "gemini-pro",
    },
    costEstimate: {
      type: Number,
      default: 0, // in USD
    },
  },
  {
    timestamps: true,
    collection: "ai_usage",
  }
);

// Compound indexes for performance
aiUsageSchema.index({ userId: 1, createdAt: -1 });
aiUsageSchema.index({ requestType: 1, createdAt: -1 });
aiUsageSchema.index({ userId: 1, requestType: 1 });
aiUsageSchema.index({ status: 1 });
aiUsageSchema.index({ createdAt: -1 });

// TTL index: keep for 180 days
aiUsageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 15552000 });

// Query helpers
aiUsageSchema.query.byUser = function (userId) {
  return this.where({ userId }).sort({ createdAt: -1 });
};

aiUsageSchema.query.successful = function () {
  return this.where({ status: "success" });
};

aiUsageSchema.query.failed = function () {
  return this.where({ status: { $in: ["failed", "partial"] } });
};

// Static methods for aggregation
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
        averageResponseTime: { $avg: "$responseTime" },
        averageConfidence: { $avg: "$confidence" },
        successCount: {
          $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
        failureCount: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        totalCost: { $sum: "$costEstimate" },
      },
    },
  ]);

  return stats[0] || {};
};

aiUsageSchema.statics.getRequestTypeStats = async function (userId) {
  return this.aggregate([
    {
      $match: { userId: mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: "$requestType",
        count: { $sum: 1 },
        averageTokens: { $avg: "$totalTokens" },
        averageResponseTime: { $avg: "$responseTime" },
        averageConfidence: { $avg: "$confidence" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

aiUsageSchema.statics.getLanguageStats = async function (userId) {
  return this.aggregate([
    {
      $match: { userId: mongoose.Types.ObjectId(userId) },
    },
    {
      $group: {
        _id: "$language",
        count: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
      },
    },
  ]);
};

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
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);
};

module.exports = mongoose.model("AIUsage", aiUsageSchema);
