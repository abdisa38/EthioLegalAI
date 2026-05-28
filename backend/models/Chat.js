const mongoose = require("mongoose");
const {
  softDeletePlugin,
  timestampPlugin,
  paginationPlugin,
  validationHelpersPlugin,
  activityTrackingPlugin,
} = require("../utils/baseSchema");

/**
 * Enhanced Chat Schema
 * Implements optimized chat history with RAG source tracking
 */
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    
    // Conversation thread support
    threadId: {
      type: String,
      index: true,
      default: null,
    },
    parentChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
    
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [5000, "Question cannot exceed 5000 characters"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      maxlength: [10000, "Answer cannot exceed 10000 characters"],
    },
    language: {
      type: String,
      enum: {
        values: ["en", "am", "om"],
        message: "{VALUE} is not a supported language",
      },
      default: "en",
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Conversation",
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    category: {
      type: String,
      enum: {
        values: ["General", "Tenant", "Labor", "Contract", "Notice"],
        message: "{VALUE} is not a valid category",
      },
      default: "General",
      index: true,
    },
    
    // User engagement
    starred: {
      type: Boolean,
      default: false,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
      index: true,
    },
    feedback: {
      type: String,
      maxlength: 1000,
      default: null,
    },
    
    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    
    // AI response metadata
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    model: {
      type: String,
      enum: ["gemini-pro", "gemini-1.5-pro", "gemini-1.5-flash"],
      default: "gemini-pro",
    },
    
    // RAG sources with enhanced tracking
    sources: [
      {
        documentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Document",
        },
        chunkIndex: Number,
        relevanceScore: {
          type: Number,
          min: 0,
          max: 1,
        },
        text: String,
        category: String,
      },
    ],
    sourcesCount: {
      type: Number,
      default: 0,
    },
    
    // Performance metrics
    responseTime: {
      type: Number,
      default: null, // in milliseconds
    },
    tokens: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
    },
    
    // Context and metadata
    context: {
      userLocation: String,
      deviceType: String,
      sessionId: String,
    },
    
    // Error tracking
    hasError: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
// Compound indexes for optimized queries
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, category: 1, createdAt: -1 });
chatSchema.index({ userId: 1, starred: 1, createdAt: -1 });
chatSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
chatSchema.index({ threadId: 1, createdAt: 1 });
chatSchema.index({ parentChatId: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ rating: -1 }, { sparse: true });

// Text index for search
chatSchema.index({ question: "text", answer: "text", title: "text" });

// ==================== VIRTUALS ====================
chatSchema.virtual("status").get(function () {
  if (this.isDeleted) return "deleted";
  if (this.hasError) return "error";
  return "active";
});

chatSchema.virtual("qualityScore").get(function () {
  let score = 0;
  if (this.aiConfidence) score += this.aiConfidence * 0.4;
  if (this.rating) score += this.rating * 20 * 0.4;
  if (this.sourcesCount > 0) score += 20;
  return Math.round(score);
});

// Virtual populate for thread messages
chatSchema.virtual("replies", {
  ref: "Chat",
  localField: "_id",
  foreignField: "parentChatId",
});

// ==================== MIDDLEWARE ====================
// Update sourcesCount before save
chatSchema.pre("save", function (next) {
  if (this.isModified("sources")) {
    this.sourcesCount = this.sources.length;
  }
  if (this.isModified("tokens")) {
    this.tokens.totalTokens = this.tokens.inputTokens + this.tokens.outputTokens;
  }
  next();
});

// ==================== QUERY HELPERS ====================
chatSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

chatSchema.query.starred = function () {
  return this.where({ starred: true, isDeleted: false });
};

chatSchema.query.byCategory = function (category) {
  return this.where({ category, isDeleted: false });
};

chatSchema.query.byThread = function (threadId) {
  return this.where({ threadId, isDeleted: false }).sort({ createdAt: 1 });
};

chatSchema.query.recent = function (days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where({ createdAt: { $gte: date }, isDeleted: false });
};

chatSchema.query.highQuality = function (minRating = 4) {
  return this.where({ rating: { $gte: minRating }, isDeleted: false });
};

// ==================== INSTANCE METHODS ====================
chatSchema.methods.softDelete = async function (deletedBy = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  if (deletedBy) this.deletedBy = deletedBy;
  return this.save();
};

chatSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

chatSchema.methods.toggleStar = async function () {
  this.starred = !this.starred;
  return this.save();
};

chatSchema.methods.addRating = async function (rating, feedback = null) {
  this.rating = rating;
  if (feedback) this.feedback = feedback;
  return this.save();
};

chatSchema.methods.addSources = async function (sources) {
  this.sources = sources;
  this.sourcesCount = sources.length;
  return this.save();
};

// ==================== STATIC METHODS ====================
chatSchema.statics.findByUser = function (userId, options = {}) {
  return this.paginate({ userId, isDeleted: false }, options);
};

chatSchema.statics.getUserStats = async function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalChats: { $sum: 1 },
        starredCount: {
          $sum: { $cond: [{ $eq: ["$starred", true] }, 1, 0] },
        },
        averageConfidence: { $avg: "$aiConfidence" },
        averageResponseTime: { $avg: "$responseTime" },
        totalTokens: { $sum: "$tokens.totalTokens" },
        averageRating: { $avg: "$rating" },
      },
    },
  ]);
};

chatSchema.statics.getCategoryStats = async function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        averageConfidence: { $avg: "$aiConfidence" },
        averageResponseTime: { $avg: "$responseTime" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

chatSchema.statics.getLanguageStats = async function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: "$language",
        count: { $sum: 1 },
        totalTokens: { $sum: "$tokens.totalTokens" },
      },
    },
  ]);
};

chatSchema.statics.searchChats = async function (userId, searchTerm, options = {}) {
  const query = {
    userId,
    isDeleted: false,
    $text: { $search: searchTerm },
  };
  
  return this.paginate(query, {
    ...options,
    sort: { score: { $meta: "textScore" } },
    select: { score: { $meta: "textScore" } },
  });
};

chatSchema.statics.getThreadMessages = async function (threadId) {
  return this.find({ threadId, isDeleted: false })
    .sort({ createdAt: 1 })
    .lean();
};

// ==================== PLUGINS ====================
chatSchema.plugin(softDeletePlugin);
chatSchema.plugin(timestampPlugin);
chatSchema.plugin(paginationPlugin);
chatSchema.plugin(validationHelpersPlugin);
chatSchema.plugin(activityTrackingPlugin, {
  modelName: "Chat",
  trackCreate: true,
  trackUpdate: false,
  trackDelete: true,
});

module.exports = mongoose.model("Chat", chatSchema);
