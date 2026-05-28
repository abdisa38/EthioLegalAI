const mongoose = require("mongoose");

/**
 * Enhanced Refresh Token Schema
 * Implements secure token management with rotation and tracking
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      unique: true,
      index: true,
    },
    
    // Token lifecycle
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // Token rotation
    replacedByTokenHash: {
      type: String,
      default: null,
      index: true,
    },
    tokenFamily: {
      type: String,
      required: true,
      index: true,
    },
    
    // Request metadata
    createdByIp: {
      type: String,
      required: true,
    },
    revokedByIp: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      os: String,
      browser: String,
    },
    location: {
      country: String,
      city: String,
    },
    
    // Security tracking
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    lastUsedIp: {
      type: String,
      default: null,
    },
    
    // Revocation reason
    revocationReason: {
      type: String,
      enum: [
        "USER_LOGOUT",
        "TOKEN_ROTATION",
        "SECURITY_BREACH",
        "SUSPICIOUS_ACTIVITY",
        "ADMIN_ACTION",
        "TOKEN_REUSE",
        "EXPIRED",
      ],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.tokenHash;
        return ret;
      },
    },
  }
);

// ==================== INDEXES ====================
// Compound indexes for performance
refreshTokenSchema.index({ userId: 1, createdAt: -1 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ tokenFamily: 1, createdAt: -1 });
refreshTokenSchema.index({ expiresAt: 1, isRevoked: 1 });

// TTL index for automatic cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== VIRTUALS ====================
refreshTokenSchema.virtual("isActive").get(function () {
  return !this.isRevoked && this.expiresAt > new Date();
});

refreshTokenSchema.virtual("isExpired").get(function () {
  return this.expiresAt <= new Date();
});

refreshTokenSchema.virtual("daysUntilExpiry").get(function () {
  const now = new Date();
  const diff = this.expiresAt - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// ==================== MIDDLEWARE ====================
// Prevent updates to revoked tokens
refreshTokenSchema.pre("save", function (next) {
  if (!this.isNew && this.isRevoked && this.isModified("isRevoked")) {
    return next(new Error("Cannot modify a revoked token"));
  }
  next();
});

// ==================== QUERY HELPERS ====================
refreshTokenSchema.query.active = function () {
  return this.where({
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

refreshTokenSchema.query.expired = function () {
  return this.where({
    expiresAt: { $lte: new Date() },
  });
};

refreshTokenSchema.query.revoked = function () {
  return this.where({ isRevoked: true });
};

refreshTokenSchema.query.byUser = function (userId) {
  return this.where({ userId });
};

refreshTokenSchema.query.byFamily = function (tokenFamily) {
  return this.where({ tokenFamily });
};

// ==================== INSTANCE METHODS ====================
// Revoke token
refreshTokenSchema.methods.revoke = async function (reason = "USER_LOGOUT", ip = null) {
  if (this.isRevoked) {
    throw new Error("Token is already revoked");
  }

  this.isRevoked = true;
  this.revokedAt = new Date();
  this.revocationReason = reason;
  if (ip) this.revokedByIp = ip;
  
  return this.save();
};

// Track token usage
refreshTokenSchema.methods.trackUsage = async function (ip = null) {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  if (ip) this.lastUsedIp = ip;
  
  return this.save({ validateBeforeSave: false });
};

// Get replacement chain
refreshTokenSchema.methods.getReplacementChain = async function () {
  const chain = [this];
  let current = this;

  while (current.replacedByTokenHash) {
    const replaced = await this.constructor.findOne({
      tokenHash: current.replacedByTokenHash,
    });
    if (!replaced) break;
    chain.push(replaced);
    current = replaced;
  }

  return chain;
};

// Check if token is part of a compromised chain
refreshTokenSchema.methods.isChainCompromised = async function () {
  const chain = await this.getReplacementChain();
  return chain.some(
    (token) =>
      token.revocationReason === "TOKEN_REUSE" ||
      token.revocationReason === "SECURITY_BREACH"
  );
};

// ==================== STATIC METHODS ====================
// Find active token by hash
refreshTokenSchema.statics.findActiveToken = async function (tokenHash) {
  return this.findOne({
    tokenHash,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

// Clean expired tokens (manual cleanup)
refreshTokenSchema.statics.cleanExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result;
};

// Revoke all user tokens
refreshTokenSchema.statics.revokeAllUserTokens = async function (
  userId,
  reason = "USER_LOGOUT",
  ip = null
) {
  const result = await this.updateMany(
    { userId, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revocationReason: reason,
        revokedByIp: ip,
      },
    }
  );
  return result;
};

// Revoke token family (for token rotation security)
refreshTokenSchema.statics.revokeTokenFamily = async function (
  tokenFamily,
  reason = "TOKEN_REUSE"
) {
  const result = await this.updateMany(
    { tokenFamily, isRevoked: false },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
        revocationReason: reason,
      },
    }
  );
  return result;
};

// Get user active sessions
refreshTokenSchema.statics.getUserSessions = async function (userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean();
};

// Get user session statistics
refreshTokenSchema.statics.getUserSessionStats = async function (userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isRevoked", false] },
                  { $gt: ["$expiresAt", new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
        revokedSessions: {
          $sum: { $cond: [{ $eq: ["$isRevoked", true] }, 1, 0] },
        },
        expiredSessions: {
          $sum: { $cond: [{ $lte: ["$expiresAt", new Date()] }, 1, 0] },
        },
        averageUsageCount: { $avg: "$usageCount" },
      },
    },
  ]);
};

// Detect suspicious activity
refreshTokenSchema.statics.detectSuspiciousActivity = async function (userId) {
  const sessions = await this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).lean();

  const suspiciousPatterns = [];

  // Check for multiple active sessions from different locations
  const uniqueIps = new Set(sessions.map((s) => s.createdByIp));
  if (uniqueIps.size > 3) {
    suspiciousPatterns.push({
      type: "MULTIPLE_LOCATIONS",
      count: uniqueIps.size,
    });
  }

  // Check for rapid token creation
  const recentSessions = sessions.filter(
    (s) => new Date() - new Date(s.createdAt) < 60 * 60 * 1000 // Last hour
  );
  if (recentSessions.length > 5) {
    suspiciousPatterns.push({
      type: "RAPID_TOKEN_CREATION",
      count: recentSessions.length,
    });
  }

  return {
    isSuspicious: suspiciousPatterns.length > 0,
    patterns: suspiciousPatterns,
    activeSessions: sessions.length,
  };
};

// Get system-wide token statistics
refreshTokenSchema.statics.getSystemStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalTokens: { $sum: 1 },
        activeTokens: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$isRevoked", false] },
                  { $gt: ["$expiresAt", new Date()] },
                ],
              },
              1,
              0,
            ],
          },
        },
        revokedTokens: {
          $sum: { $cond: [{ $eq: ["$isRevoked", true] }, 1, 0] },
        },
        uniqueUsers: { $addToSet: "$userId" },
        averageUsageCount: { $avg: "$usageCount" },
      },
    },
    {
      $project: {
        totalTokens: 1,
        activeTokens: 1,
        revokedTokens: 1,
        uniqueUserCount: { $size: "$uniqueUsers" },
        averageUsageCount: 1,
      },
    },
  ]);
};

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
