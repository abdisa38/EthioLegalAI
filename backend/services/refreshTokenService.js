const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");
const { logSecurityEvent } = require("../utils/securityLogger");

const getRefreshTtlMs = () => {
  const days = Number.parseInt(process.env.REFRESH_TOKEN_TTL_DAYS || "30", 10);
  return Number.isFinite(days) ? days * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateToken = () => crypto.randomBytes(40).toString("hex");

const issueRefreshToken = async ({ userId, ip, userAgent }) => {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + getRefreshTtlMs());
  const tokenFamily = crypto.randomBytes(16).toString("hex"); // Generate token family

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    createdByIp: ip,
    userAgent,
    tokenFamily,
    isRevoked: false,
  });

  return { token, tokenHash, expiresAt };
};

const rotateRefreshToken = async ({ tokenRecord, userId, ip, userAgent }) => {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + getRefreshTtlMs());
  
  // Preserve token family for rotation chain
  const tokenFamily = tokenRecord.tokenFamily || crypto.randomBytes(16).toString("hex");

  await RefreshToken.create({
    userId,
    tokenHash,
    expiresAt,
    createdByIp: ip,
    userAgent,
    tokenFamily,
    isRevoked: false,
  });

  // Mark old token as revoked
  tokenRecord.isRevoked = true;
  tokenRecord.revokedAt = new Date();
  tokenRecord.revokedByIp = ip;
  tokenRecord.replacedByTokenHash = tokenHash;
  await tokenRecord.save();
  
  return { token, tokenHash, expiresAt };
};

const revokeRefreshToken = async ({ tokenRecord, ip, reason }) => {
  if (!tokenRecord || tokenRecord.revokedAt) return;
  tokenRecord.isRevoked = true;
  tokenRecord.revokedAt = new Date();
  tokenRecord.revokedByIp = ip;
  if (reason) {
    tokenRecord.revocationReason = reason.toUpperCase().replace(/\s+/g, '_');
  }
  await tokenRecord.save();
  if (reason) {
    logSecurityEvent("refresh_token_revoked", { 
      reason, 
      tokenId: tokenRecord._id?.toString(), 
      userId: tokenRecord.userId?.toString() 
    });
  }
};

const revokeAllForUser = async ({ userId, reason }) => {
  await RefreshToken.updateMany(
    { userId, isRevoked: false },
    { 
      $set: { 
        isRevoked: true,
        revokedAt: new Date(),
        revocationReason: reason ? reason.toUpperCase().replace(/\s+/g, '_') : 'USER_LOGOUT'
      } 
    }
  );
  logSecurityEvent("refresh_token_revoked_all", { reason, userId });
};

const findTokenRecord = async (token) => {
  const tokenHash = hashToken(token);
  return RefreshToken.findOne({ tokenHash });
};

module.exports = {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  findTokenRecord,
  hashToken,
  getRefreshTtlMs,
};
