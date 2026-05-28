const mongoose = require("mongoose");

// User analytics schema
const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Chat statistics
    chatsCreated: {
      type: Number,
      default: 0,
    },
    chatsDeleted: {
      type: Number,
      default: 0,
    },
    chatsCurrent: {
      type: Number,
      default: 0,
    },
    
    // Document statistics
    documentsUploaded: {
      type: Number,
      default: 0,
    },
    documentsDeleted: {
      type: Number,
      default: 0,
    },
    documentsCurrent: {
      type: Number,
      default: 0,
    },
    totalDocumentSize: {
      type: Number,
      default: 0, // in bytes
    },
    
    // Analysis statistics
    contractsAnalyzed: {
      type: Number,
      default: 0,
    },
    tenantQueriesAnswered: {
      type: Number,
      default: 0,
    },
    laborQueriesAnswered: {
      type: Number,
      default: 0,
    },
    
    // AI usage
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
    totalAiRequests: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0, // milliseconds
    },
    
    // Platform engagement
    lastActiveAt: {
      type: Date,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    sessionDuration: {
      type: Number,
      default: 0, // total seconds
    },
    
    // Language preferences
    languageUsage: {
      en: { type: Number, default: 0 },
      am: { type: Number, default: 0 },
      om: { type: Number, default: 0 },
    },
    
    // Category preferences
    categoryUsage: {
      Rental: { type: Number, default: 0 },
      Labor: { type: Number, default: 0 },
      Contract: { type: Number, default: 0 },
      Notice: { type: Number, default: 0 },
      General: { type: Number, default: 0 },
    },
    
    // Quality metrics
    averageDocumentSize: {
      type: Number,
      default: 0, // in bytes
    },
    averageAiConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "user_analytics",
  }
);

// Indexes
analyticsSchema.index({ userId: 1 });
analyticsSchema.index({ lastActiveAt: -1 });
analyticsSchema.index({ totalAiRequests: -1 });

// Methods to increment counters
analyticsSchema.methods.incrementChatsCreated = async function () {
  this.chatsCreated = (this.chatsCreated || 0) + 1;
  this.chatsCurrent = (this.chatsCurrent || 0) + 1;
  return this.save();
};

analyticsSchema.methods.incrementChatsDeleted = async function () {
  this.chatsDeleted = (this.chatsDeleted || 0) + 1;
  this.chatsCurrent = Math.max(0, (this.chatsCurrent || 1) - 1);
  return this.save();
};

analyticsSchema.methods.incrementDocumentsUploaded = async function (sizeInBytes) {
  this.documentsUploaded = (this.documentsUploaded || 0) + 1;
  this.documentsCurrent = (this.documentsCurrent || 0) + 1;
  this.totalDocumentSize = (this.totalDocumentSize || 0) + sizeInBytes;
  return this.save();
};

analyticsSchema.methods.incrementDocumentsDeleted = async function (sizeInBytes) {
  this.documentsDeleted = (this.documentsDeleted || 0) + 1;
  this.documentsCurrent = Math.max(0, (this.documentsCurrent || 1) - 1);
  this.totalDocumentSize = Math.max(0, (this.totalDocumentSize || 0) - sizeInBytes);
  return this.save();
};

analyticsSchema.methods.recordAiUsage = async function (tokens, responseTime, confidence, language, category) {
  this.totalTokensUsed = (this.totalTokensUsed || 0) + tokens;
  this.totalAiRequests = (this.totalAiRequests || 0) + 1;
  
  // Update average response time
  const currentAvg = this.averageResponseTime || 0;
  this.averageResponseTime = Math.round(
    (currentAvg * (this.totalAiRequests - 1) + responseTime) / this.totalAiRequests
  );
  
  // Update average confidence
  const currentConfidence = this.averageAiConfidence || 0;
  this.averageAiConfidence = Math.round(
    (currentConfidence * (this.totalAiRequests - 1) + confidence) / this.totalAiRequests
  );
  
  // Update language usage
  if (language) {
    this.languageUsage[language] = (this.languageUsage[language] || 0) + 1;
  }
  
  // Update category usage
  if (category) {
    this.categoryUsage[category] = (this.categoryUsage[category] || 0) + 1;
  }
  
  return this.save();
};

analyticsSchema.methods.updateLastActive = async function () {
  this.lastActiveAt = new Date();
  return this.save();
};

// Static method to get top users by engagement
analyticsSchema.statics.getTopEngaged = async function (limit = 10) {
  return this.find()
    .sort({ totalAiRequests: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model("UserAnalytics", analyticsSchema);
