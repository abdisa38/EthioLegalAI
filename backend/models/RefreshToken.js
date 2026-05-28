const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date },
    replacedByTokenHash: { type: String },
    createdByIp: { type: String },
    revokedByIp: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1 });

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
