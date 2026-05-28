const mongoose = require("mongoose");

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
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    createdByIp: {
      type: String,
    },
    revokedByIp: {
      type: String,
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Compound indexes
refreshTokenSchema.index({ userId: 1, createdAt: -1 });
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// Virtual for active status
refreshTokenSchema.virtual("isActive").get(function () {
  return !this.isRevoked && this.expiresAt > new Date();
});

// Static method to clean expired tokens
refreshTokenSchema.statics.cleanExpired = async function () {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
  return result;
};

// Instance method to revoke token
refreshTokenSchema.methods.revoke = async function (ip) {
  this.isRevoked = true;
  this.revokedAt = new Date();
  if (ip) this.revokedByIp = ip;
  return this.save();
};

// Instance method to get replacement chain
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

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
