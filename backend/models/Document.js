const mongoose = require("mongoose");

const riskItemSchema = new mongoose.Schema(
  {
    id: { type: Number },
    severity: { type: String },
    clause: { type: String },
    explanation: { type: String },
    article: { type: String },
    safer: { type: String },
    confidence: { type: Number },
  },
  { _id: false }
);

const keyFactSchema = new mongoose.Schema(
  {
    label: { type: String },
    value: { type: String },
    risk: { type: Boolean },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    date: { type: String },
    label: { type: String },
    type: { type: String },
    urgent: { type: Boolean },
  },
  { _id: false }
);

const sideBySideSchema = new mongoose.Schema(
  {
    original: { type: String },
    simplified: { type: String },
    risk: { type: String },
  },
  { _id: false }
);

const breakdownSchema = new mongoose.Schema(
  {
    subject: { type: String },
    score: { type: Number },
  },
  { _id: false }
);

const financialRiskSchema = new mongoose.Schema(
  {
    label: { type: String },
    value: { type: String },
    note: { type: String },
    risk: { type: Boolean },
  },
  { _id: false }
);

const analysisSchema = new mongoose.Schema(
  {
    documentId: { type: String },
    fileName: { type: String },
    docType: { type: String },
    summary: { type: String },
    riskScore: { type: Number },
    aiConfidence: { type: Number },
    warnings: [{ type: String }],
    suggestedActions: [{ type: String }],
    keyFacts: [keyFactSchema],
    risks: [riskItemSchema],
    timeline: [timelineSchema],
    sideBySide: [sideBySideSchema],
    riskBreakdown: [breakdownSchema],
    financialRisks: [financialRiskSchema],
    generatedAt: { type: Date },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
    },
    cloudinaryResourceType: {
      type: String,
    },
    mimeType: {
      type: String,
    },
    fileSize: {
      type: Number,
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
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    riskScore: {
      type: String,
    },
    analysis: analysisSchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
