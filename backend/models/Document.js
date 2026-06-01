const mongoose = require("mongoose");
const {
  softDeletePlugin,
  timestampPlugin,
  paginationPlugin,
  validationHelpersPlugin,
  activityTrackingPlugin,
} = require("../utils/baseSchema");

const riskItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    clause: { type: String, required: true },
    explanation: { type: String, required: true },
    article: { type: String },
    safer: { type: String },
    confidence: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const keyFactSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    risk: { type: Boolean, default: false },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["start", "payment", "milestone", "deadline", "end", "other", "warning"] },
    urgent: { type: Boolean, default: false },
  },
  { _id: false }
);

const sideBySideSchema = new mongoose.Schema(
  {
    original: { type: String, required: true },
    simplified: { type: String, required: true },
    risk: { type: String, enum: ["low", "medium", "high"] },
  },
  { _id: false }
);

const breakdownSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true },
    score: { type: Number, min: 0, max: 100, required: true },
  },
  { _id: false }
);

const financialRiskSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    note: { type: String },
    risk: { type: Boolean, default: false },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    documentId: { type: String, required: true },
    fileName: { type: String, required: true },
    docType: {
      type: String,
      required: true,
    },
    summary: { type: String, required: true },
    riskScore: { type: Number, min: 0, max: 100, required: true },
    aiConfidence: { type: Number, min: 0, max: 100 },
    warnings: [{ type: String }],
    suggestedActions: [{ type: String }],
    keyFacts: [keyFactSchema],
    risks: [riskItemSchema],
    timeline: [timelineSchema],
    sideBySide: [sideBySideSchema],
    riskBreakdown: [breakdownSchema],
    financialRisks: [financialRiskSchema],
    generatedAt: { type: Date, default: Date.now },
    processingTime: { type: Number }, // milliseconds
    tokensUsed: { type: Number },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    filename: {
      type: String,
      required: [true, "Filename is required"],
      trim: true,
    },
    cloudinaryUrl: {
      type: String,
      default: "",
    },
    cloudinaryPublicId: {
      type: String,
      default: "",
    },
    cloudinaryResourceType: {
      type: String,
      default: "raw",
    },
    mimeType: {
      type: String,
      enum: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/png",
        "text/plain",
      ],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true, // in bytes
    },
    extractedText: {
      type: String,
      default: "",
    },
    textLength: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      maxlength: [1000, "Summary cannot exceed 1000 characters"],
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    category: {
      type: String,
      enum: ["Rental", "Labor", "Contract", "Notice", "General"],
      default: "General",
      index: true,
    },
    analysis: analysisSchema,
    // Tracking fields
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
      default: null,
    },
    // Chunks for RAG
    chunks: [
      {
        index: Number,
        text: String,
        hash: String,
        embedding: [Number], // Vector embedding
        category: String,
        confidence: Number,
      },
    ],
    chunksCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for optimized queries
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, category: 1, createdAt: -1 });
documentSchema.index({ userId: 1, isDeleted: 1, createdAt: -1 });
documentSchema.index({ category: 1, riskScore: -1 });
documentSchema.index({ riskScore: -1, createdAt: -1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ lastViewedAt: -1 });

// Text index for search
documentSchema.index({ filename: "text", summary: "text" });

// Sparse index for analyzed documents
documentSchema.index({ "analysis.riskScore": -1 }, { sparse: true });
documentSchema.index({ "analysis.docType": 1 }, { sparse: true });

// Index for RAG queries
documentSchema.index({ "chunks.category": 1 });
documentSchema.index({ "chunks.hash": 1 }, { sparse: true });

// Virtual for status
documentSchema.virtual("status").get(function () {
  if (this.isDeleted) return "deleted";
  return this.analysis ? "analyzed" : "pending";
});

// Virtual for file size in MB
documentSchema.virtual("fileSizeMB").get(function () {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Virtual for processing status
documentSchema.virtual("processingStatus").get(function () {
  if (this.isDeleted) return "deleted";
  if (!this.extractedText) return "pending_extraction";
  if (!this.analysis) return "pending_analysis";
  if (this.chunksCount === 0) return "pending_chunking";
  return "completed";
});

// ==================== QUERY HELPERS ====================
// Get active documents
documentSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

// Get by category
documentSchema.query.byCategory = function (category) {
  return this.where({ category, isDeleted: false });
};

// Get high risk documents
documentSchema.query.highRisk = function (threshold = 70) {
  return this.where({ riskScore: { $gte: threshold }, isDeleted: false });
};

// Get analyzed documents
documentSchema.query.analyzed = function () {
  return this.where({ analysis: { $exists: true }, isDeleted: false });
};

// Get recent documents
documentSchema.query.recent = function (days = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where({ createdAt: { $gte: date }, isDeleted: false });
};

// ==================== INSTANCE METHODS ====================
// Soft delete
documentSchema.methods.softDelete = async function (deletedBy = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  if (deletedBy) this.deletedBy = deletedBy;
  return this.save();
};

// Restore
documentSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;
  return this.save();
};

// Track view
documentSchema.methods.trackView = async function () {
  this.views = (this.views || 0) + 1;
  this.lastViewedAt = new Date();
  return this.save({ validateBeforeSave: false });
};

// Add analysis
documentSchema.methods.addAnalysis = async function (analysisData) {
  this.analysis = analysisData;
  this.summary = analysisData.summary;
  this.riskScore = analysisData.riskScore;
  return this.save();
};

// Add chunks
documentSchema.methods.addChunks = async function (chunks) {
  this.chunks = chunks;
  this.chunksCount = chunks.length;
  return this.save();
};

// Get risk level
documentSchema.methods.getRiskLevel = function () {
  if (!this.riskScore) return "unknown";
  if (this.riskScore >= 80) return "critical";
  if (this.riskScore >= 60) return "high";
  if (this.riskScore >= 40) return "medium";
  return "low";
};

// ==================== STATIC METHODS ====================
// Find by user with pagination
documentSchema.statics.findByUser = function (userId, options = {}) {
  return this.paginate({ userId, isDeleted: false }, options);
};

// Get user document stats
documentSchema.statics.getUserStats = async function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: "$fileSize" },
        analyzedCount: {
          $sum: { $cond: [{ $ifNull: ["$analysis", false] }, 1, 0] },
        },
        averageRiskScore: { $avg: "$riskScore" },
        totalViews: { $sum: "$views" },
      },
    },
  ]);
};

// Get documents by category stats
documentSchema.statics.getCategoryStats = async function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        averageRiskScore: { $avg: "$riskScore" },
        totalSize: { $sum: "$fileSize" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get risk distribution
documentSchema.statics.getRiskDistribution = async function (userId) {
  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        isDeleted: false,
        riskScore: { $exists: true },
      },
    },
    {
      $bucket: {
        groupBy: "$riskScore",
        boundaries: [0, 25, 50, 75, 100],
        default: "unknown",
        output: {
          count: { $sum: 1 },
          documents: { $push: { _id: "$_id", filename: "$filename" } },
        },
      },
    },
  ]);
};

// Search documents
documentSchema.statics.searchDocuments = async function (userId, searchTerm, options = {}) {
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

// ==================== PLUGINS ====================
documentSchema.plugin(softDeletePlugin);
documentSchema.plugin(timestampPlugin);
documentSchema.plugin(paginationPlugin);
documentSchema.plugin(validationHelpersPlugin);
documentSchema.plugin(activityTrackingPlugin, {
  modelName: "Document",
  trackCreate: true,
  trackUpdate: false,
  trackDelete: true,
});

module.exports = mongoose.model("Document", documentSchema);
