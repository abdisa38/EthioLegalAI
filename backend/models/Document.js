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
    type: { type: String, enum: ["deadline", "milestone", "warning"] },
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
      enum: ["contract", "agreement", "notice", "other"],
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
      required: [true, "Cloudinary URL is required"],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    cloudinaryResourceType: {
      type: String,
      default: "raw",
    },
    mimeType: {
      type: String,
      enum: ["application/pdf", "text/plain"],
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

// Compound indexes
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, isDeleted: 1 });
documentSchema.index({ createdAt: -1 });
documentSchema.index({ riskScore: 1 });

// Virtual for status
documentSchema.virtual("status").get(function () {
  if (this.isDeleted) return "deleted";
  return this.analysis ? "analyzed" : "pending";
});

// Get active documents
documentSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

// Soft delete
documentSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore
documentSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Track view
documentSchema.methods.trackView = async function () {
  this.views = (this.views || 0) + 1;
  this.lastViewedAt = new Date();
  return this.save();
};

module.exports = mongoose.model("Document", documentSchema);
