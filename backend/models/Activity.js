const mongoose = require("mongoose");

// Activity log schema
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
        "LOGIN",
        "LOGOUT",
        "CHAT_CREATED",
        "CHAT_DELETED",
        "DOCUMENT_UPLOADED",
        "DOCUMENT_DELETED",
        "DOCUMENT_ANALYZED",
        "EXPORT",
        "SETTINGS_UPDATED",
        "PROFILE_UPDATED",
      ],
      required: true,
      index: true,
    },
    resourceType: {
      type: String,
      enum: ["User", "Chat", "Document", "Settings", "System"],
      index: true,
    },
    resourceId: mongoose.Schema.Types.ObjectId,
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
    userAgent: String,
    statusCode: {
      type: Number,
      enum: [200, 201, 400, 401, 403, 404, 500],
    },
    executionTime: {
      type: Number, // milliseconds
      default: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
  },
  {
    timestamps: true,
    collection: "activities",
  }
);

// Compound indexes
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ action: 1, createdAt: -1 });
activitySchema.index({ userId: 1, action: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });

// TTL index: auto-delete after 90 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Query helper to get user recent activities
activitySchema.query.recentForUser = function (userId, limit = 50) {
  return this.where({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to log activity
activitySchema.statics.logActivity = async function (activityData) {
  try {
    const activity = new this(activityData);
    return await activity.save();
  } catch (err) {
    console.error("Error logging activity:", err);
    return null;
  }
};

module.exports = mongoose.model("Activity", activitySchema);
