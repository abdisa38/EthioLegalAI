const mongoose = require("mongoose");

/**
 * Enhanced User Analytics Schema
 * Implements comprehensive user engagement and usage analytics
 */
const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ==================== CHAT STATISTICS ====================
    chats: {
      created: { type: Number, default: 0, min: 0 },
      deleted: { type: Number, default: 0, min: 0 },
      current: { type: Number, default: 0, min: 0 },
      starred: { type: Number, default: 0, min: 0 },
      rated: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
    },

    // ==================== DOCUMENT STATISTICS ====================
    documents: {
      uploaded: { type: Number, default: 0, min: 0 },
      deleted: { type: Number, default: 0, min: 0 },
      current: { type: Number, default: 0, min: 0 },
      totalSizeBytes: { type: Number, default: 0, min: 0 },
      averageSizeBytes: { type: Number, default: 0, min: 0 },
      viewed: { type: Number, default: 0, min: 0 },
    },

    // ==================== ANALYSIS STATISTICS ====================
    analysis: {
      contractsAnalyzed: { type: Number, default: 0, min: 0 },
      tenantQueries: { type: Number, default: 0, min: 0 },
      laborQueries: { type: Number, default: 0, min: 0 },
      totalAnalyses: { type: Number, default: 0, min: 0 },
      averageRiskScore: { type: Number, default: 0, min: 0, max: 100 },
      highRiskCount: { type: Number, default: 0, min: 0 },
    },

    // ==================== AI USAGE ====================
    ai: {
      totalRequests: { type: Number, default: 0, min: 0 },
      totalTokens: { type: Number, default: 0, min: 0 },
      inputTokens: { type: Number, default: 0, min: 0 },
      outputTokens: { type: Number, default: 0, min: 0 },
      averageResponseTime: { type: Number, default: 0, min: 0 },
      averageConfidence: { type: Number, default: 0, min: 0, max: 100 },
      totalCost: { type: Number, default: 0, min: 0 },
      successfulRequests: { type: Number, default: 0, min: 0 },
      failedRequests: { type: Number, default: 0, min: 0 },
    },

    // ==================== PLATFORM ENGAGEMENT ====================
    engagement: {
      lastActiveAt: { type: Date, default: null, index: true },
      loginCount: { type: Number, default: 0, min: 0 },
      totalSessionDuration: { type: Number, default: 0, min: 0 }, // seconds
      averageSessionDuration: { type: Number, default: 0, min: 0 },
      activeDays: { type: Number, default: 0, min: 0 },
      streakDays: { type: Number, default: 0, min: 0 },
      longestStreak: { type: Number, default: 0, min: 0 },
      lastStreakDate: { type: Date, default: null },
    },

    // ==================== LANGUAGE PREFERENCES ====================
    languageUsage: {
      en: { type: Number, default: 0, min: 0 },
      am: { type: Number, default: 0, min: 0 },
      om: { type: Number, default: 0, min: 0 },
    },

    // ==================== CATEGORY PREFERENCES ====================
    categoryUsage: {
      Rental: { type: Number, default: 0, min: 0 },
      Labor: { type: Number, default: 0, min: 0 },
      Contract: { type: Number, default: 0, min: 0 },
      Notice: { type: Number, default: 0, min: 0 },
      General: { type: Number, default: 0, min: 0 },
    },

    // ==================== FEATURE USAGE ====================
    features: {
      chatUsed: { type: Boolean, default: false },
      documentUploadUsed: { type: Boolean, default: false },
      contractAnalysisUsed: { type: Boolean, default: false },
      tenantAssistUsed: { type: Boolean, default: false },
      laborAssistUsed: { type: Boolean, default: false },
      exportUsed: { type: Boolean, default: false },
      searchUsed: { type: Boolean, default: false },
    },

    // ==================== QUALITY METRICS ====================
    quality: {
      averageAiConfidence: { type: Number, default: 0, min: 0, max: 100 },
      averageChatRating: { type: Number, default: 0, min: 0, max: 5 },
      feedbackCount: { type: Number, default: 0, min: 0 },
    },

    // ==================== MILESTONES ====================
    milestones: [
      {
        name: {
          type: String,
          enum: [
            "FIRST_LOGIN",
            "FIRST_CHAT",
            "FIRST_DOCUMENT",
            "FIRST_ANALYSIS",
            "10_CHATS",
            "50_CHATS",
            "100_CHATS",
            "10_DOCUMENTS",
            "50_DOCUMENTS",
            "POWER_USER",
            "WEEK_STREAK",
            "MONTH_STREAK",
          ],
        },
        achievedAt: { type: Date, default: Date.now },
      },
    ],

    // ==================== USAGE TRENDS ====================
    trends: {
      dailyAverage: { type: Number, default: 0, min: 0 },
      weeklyAverage: { type: Number, default: 0, min: 0 },
      monthlyAverage: { type: Number, default: 0, min: 0 },
      peakUsageHour: { type: Number, min: 0, max: 23, default: null },
      peakUsageDay: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        default: null,
      },
    },
  },
  {
    timestamps: true,
    collection: "user_analytics",
  }
);

// ==================== INDEXES ====================
analyticsSchema.index({ userId: 1 }, { unique: true });
analyticsSchema.index({ "engagement.lastActiveAt": -1 });
analyticsSchema.index({ "ai.totalRequests": -1 });
analyticsSchema.index({ "engagement.streakDays": -1 });
analyticsSchema.index({ "documents.current": -1 });
analyticsSchema.index({ "chats.current": -1 });

// ==================== VIRTUALS ====================
analyticsSchema.virtual("engagementScore").get(function () {
  let score = 0;
  score += Math.min(this.engagement.loginCount * 2, 50);
  score += Math.min(this.chats.current * 1, 20);
  score += Math.min(this.documents.current * 2, 20);
  score += Math.min(this.engagement.streakDays * 2, 10);
  return Math.min(score, 100);
});

analyticsSchema.virtual("userLevel").get(function () {
  const score = this.engagementScore;
  if (score >= 80) return "Expert";
  if (score >= 60) return "Advanced";
  if (score >= 40) return "Intermediate";
  if (score >= 20) return "Beginner";
  return "New";
});

// ==================== INSTANCE METHODS ====================
// Chat operations
analyticsSchema.methods.incrementChatsCreated = async function () {
  this.chats.created += 1;
  this.chats.current += 1;
  this.features.chatUsed = true;
  await this.checkMilestone("FIRST_CHAT");
  await this.checkMilestone("10_CHATS");
  await this.checkMilestone("50_CHATS");
  await this.checkMilestone("100_CHATS");
  return this.save();
};

analyticsSchema.methods.incrementChatsDeleted = async function () {
  this.chats.deleted += 1;
  this.chats.current = Math.max(0, this.chats.current - 1);
  return this.save();
};

analyticsSchema.methods.updateChatRating = async function (rating) {
  this.chats.rated += 1;
  const totalRating = this.chats.averageRating * (this.chats.rated - 1) + rating;
  this.chats.averageRating = totalRating / this.chats.rated;
  this.quality.averageChatRating = this.chats.averageRating;
  return this.save();
};

// Document operations
analyticsSchema.methods.incrementDocumentsUploaded = async function (sizeInBytes) {
  this.documents.uploaded += 1;
  this.documents.current += 1;
  this.documents.totalSizeBytes += sizeInBytes;
  this.documents.averageSizeBytes = this.documents.totalSizeBytes / this.documents.current;
  this.features.documentUploadUsed = true;
  await this.checkMilestone("FIRST_DOCUMENT");
  await this.checkMilestone("10_DOCUMENTS");
  await this.checkMilestone("50_DOCUMENTS");
  return this.save();
};

analyticsSchema.methods.incrementDocumentsDeleted = async function (sizeInBytes) {
  this.documents.deleted += 1;
  this.documents.current = Math.max(0, this.documents.current - 1);
  this.documents.totalSizeBytes = Math.max(0, this.documents.totalSizeBytes - sizeInBytes);
  if (this.documents.current > 0) {
    this.documents.averageSizeBytes = this.documents.totalSizeBytes / this.documents.current;
  }
  return this.save();
};

// AI usage tracking
analyticsSchema.methods.recordAiUsage = async function (data) {
  const { tokens, responseTime, confidence, language, category, cost = 0, success = true } = data;

  this.ai.totalRequests += 1;
  this.ai.totalTokens += tokens;
  this.ai.inputTokens += data.inputTokens || 0;
  this.ai.outputTokens += data.outputTokens || 0;
  this.ai.totalCost += cost;

  if (success) {
    this.ai.successfulRequests += 1;
  } else {
    this.ai.failedRequests += 1;
  }

  // Update averages
  this.ai.averageResponseTime =
    (this.ai.averageResponseTime * (this.ai.totalRequests - 1) + responseTime) /
    this.ai.totalRequests;

  if (confidence) {
    this.ai.averageConfidence =
      (this.ai.averageConfidence * (this.ai.totalRequests - 1) + confidence) /
      this.ai.totalRequests;
    this.quality.averageAiConfidence = this.ai.averageConfidence;
  }

  // Update language usage
  if (language && this.languageUsage[language] !== undefined) {
    this.languageUsage[language] += 1;
  }

  // Update category usage
  if (category && this.categoryUsage[category] !== undefined) {
    this.categoryUsage[category] += 1;
  }

  return this.save();
};

// Engagement tracking
analyticsSchema.methods.updateLastActive = async function () {
  const now = new Date();
  const lastActive = this.engagement.lastActiveAt;

  this.engagement.lastActiveAt = now;

  // Update streak
  if (lastActive) {
    const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.engagement.streakDays += 1;
      this.engagement.longestStreak = Math.max(
        this.engagement.longestStreak,
        this.engagement.streakDays
      );
    } else if (daysDiff > 1) {
      this.engagement.streakDays = 1;
    }
  } else {
    this.engagement.streakDays = 1;
  }

  this.engagement.lastStreakDate = now;
  await this.checkMilestone("WEEK_STREAK");
  await this.checkMilestone("MONTH_STREAK");

  return this.save();
};

analyticsSchema.methods.recordLogin = async function () {
  this.engagement.loginCount += 1;
  await this.checkMilestone("FIRST_LOGIN");
  return this.updateLastActive();
};

// Milestone tracking
analyticsSchema.methods.checkMilestone = async function (milestoneName) {
  const milestoneConditions = {
    FIRST_LOGIN: () => this.engagement.loginCount >= 1,
    FIRST_CHAT: () => this.chats.created >= 1,
    FIRST_DOCUMENT: () => this.documents.uploaded >= 1,
    FIRST_ANALYSIS: () => this.analysis.totalAnalyses >= 1,
    "10_CHATS": () => this.chats.created >= 10,
    "50_CHATS": () => this.chats.created >= 50,
    "100_CHATS": () => this.chats.created >= 100,
    "10_DOCUMENTS": () => this.documents.uploaded >= 10,
    "50_DOCUMENTS": () => this.documents.uploaded >= 50,
    POWER_USER: () => this.engagementScore >= 80,
    WEEK_STREAK: () => this.engagement.streakDays >= 7,
    MONTH_STREAK: () => this.engagement.streakDays >= 30,
  };

  const condition = milestoneConditions[milestoneName];
  if (!condition || !condition()) return false;

  const exists = this.milestones.some((m) => m.name === milestoneName);
  if (!exists) {
    this.milestones.push({ name: milestoneName, achievedAt: new Date() });
  }

  return true;
};

// ==================== STATIC METHODS ====================
analyticsSchema.statics.getOrCreate = async function (userId) {
  let analytics = await this.findOne({ userId });
  if (!analytics) {
    analytics = await this.create({ userId });
  }
  return analytics;
};

analyticsSchema.statics.getTopEngaged = async function (limit = 10) {
  return this.find()
    .sort({ "ai.totalRequests": -1, "engagement.loginCount": -1 })
    .limit(limit)
    .populate("userId", "name email")
    .lean();
};

analyticsSchema.statics.getLeaderboard = async function (metric = "ai.totalRequests", limit = 10) {
  const sortObj = {};
  sortObj[metric] = -1;
  
  return this.find()
    .sort(sortObj)
    .limit(limit)
    .populate("userId", "name email")
    .lean();
};

analyticsSchema.statics.getSystemOverview = async function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalChats: { $sum: "$chats.created" },
        totalDocuments: { $sum: "$documents.uploaded" },
        totalAiRequests: { $sum: "$ai.totalRequests" },
        totalTokens: { $sum: "$ai.totalTokens" },
        totalCost: { $sum: "$ai.totalCost" },
        averageEngagementScore: { $avg: "$engagementScore" },
      },
    },
  ]);
};

module.exports = mongoose.model("UserAnalytics", analyticsSchema);
