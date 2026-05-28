const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
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
      enum: ["en", "am", "om"],
      default: "en",
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Conversation",
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    category: {
      type: String,
      enum: ["General", "Tenant", "Labor", "Contract", "Notice"],
      default: "General",
      index: true,
    },
    starred: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    // AI response metadata
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    sources: [
      {
        documentId: mongoose.Schema.Types.ObjectId,
        chunkIndex: Number,
        relevanceScore: { type: Number, min: 0, max: 1 },
      },
    ],
    responseTime: {
      type: Number,
      default: null, // in milliseconds
    },
    tokens: {
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, category: 1, createdAt: -1 });
chatSchema.index({ userId: 1, starred: 1 });
chatSchema.index({ createdAt: -1 });
chatSchema.index({ userId: 1, isDeleted: 1 });

// Get active chats query
chatSchema.query.active = function () {
  return this.where({ isDeleted: false });
};

// Get starred chats
chatSchema.query.starred = function () {
  return this.where({ starred: true, isDeleted: false });
};

// Soft delete
chatSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore
chatSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

module.exports = mongoose.model("Chat", chatSchema);
