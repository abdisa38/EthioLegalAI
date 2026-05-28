const User = require("../models/User");
const { generateAccessToken } = require("../utils/jwt");
const {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  findTokenRecord,
  getRefreshTtlMs,
} = require("../services/refreshTokenService");
const { logSecurityEvent } = require("../utils/securityLogger");

const cookieName = "ethiolegal_rt";

const isSecureCookie = () =>
  process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isSecureCookie(),
  sameSite: process.env.COOKIE_SAMESITE || (isSecureCookie() ? "none" : "lax"),
  domain: process.env.COOKIE_DOMAIN || undefined,
  maxAge: getRefreshTtlMs(),
  path: "/",
  signed: true,
});

const setRefreshCookie = (res, token) => {
  res.cookie(cookieName, token, getCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie(cookieName, {
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    sameSite: process.env.COOKIE_SAMESITE || (isSecureCookie() ? "none" : "lax"),
    secure: isSecureCookie(),
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, languagePreference } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: { message: "Name, email, and password are required" } });
    }

    // Check if user already exists (simple query)
    const existingUser = await User.findOne({ 
      email: email.toLowerCase()
    });
    
    // Check if user exists and is not deleted
    if (existingUser && !existingUser.isDeleted) {
      return res.status(409).json({ error: { message: "Email is already registered" } });
    }

    // Create new user with explicit field values
    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      languagePreference: languagePreference || "en",
      isActive: true,
      isDeleted: false,
      isEmailVerified: false,
      failedLoginAttempts: 0,
      twoFactorEnabled: false,
      role: "user",
      permissions: [],
      subscription: {
        plan: "free",
        status: "active",
        startDate: null,
        endDate: null,
        limits: {
          maxDocuments: 10,
          maxChats: 50,
          maxStorageBytes: 10485760,
        },
      },
      profile: {
        bio: "",
        avatarUrl: "",
        phone: "",
        organization: "",
        location: "",
      },
      preferences: {
        emailNotifications: true,
        marketingEmails: false,
        theme: "light",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
      },
    };

    const user = await User.create(userData);

    const accessToken = generateAccessToken(user);
    const refresh = await issueRefreshToken({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshCookie(res, refresh.token);

    return res.status(201).json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: "Email and password are required" } });
    }

    // Find user (simple query)
    const user = await User.findOne({ 
      email: email.toLowerCase()
    }).select("+password");
    
    // Check if user exists and is not deleted
    if (!user || user.isDeleted) {
      logSecurityEvent("login_failed", { email, ip: req.ip });
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ 
        error: { message: "Account is temporarily locked. Please try again later." } 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Handle failed login attempt
      if (user.handleFailedLogin) {
        await user.handleFailedLogin();
      }
      logSecurityEvent("login_failed", { email, ip: req.ip });
      return res.status(401).json({ error: { message: "Invalid credentials" } });
    }

    // Update last login
    if (user.updateLastLogin) {
      await user.updateLastLogin(req.ip);
    }

    const accessToken = generateAccessToken(user);
    const refresh = await issueRefreshToken({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    setRefreshCookie(res, refresh.token);

    return res.json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        languagePreference: user.languagePreference || "en",
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return next(error);
  }
};

const logout = async (req, res) => {
  try {
    const token = req.signedCookies?.[cookieName];
    if (token) {
      const record = await findTokenRecord(token);
      if (record) {
        await revokeRefreshToken({ tokenRecord: record, ip: req.ip, reason: "logout" });
      }
    }
    clearRefreshCookie(res);
    res.json({ message: "Logged out" });
  } catch (error) {
    clearRefreshCookie(res);
    res.json({ message: "Logged out" });
  }
};

const profile = async (req, res) => {
  res.json({ user: req.user });
};

const refresh = async (req, res, next) => {
  try {
    const token = req.signedCookies?.[cookieName];
    if (!token) {
      return res.status(401).json({ error: { message: "Refresh token missing" } });
    }

    const record = await findTokenRecord(token);
    if (!record) {
      clearRefreshCookie(res);
      logSecurityEvent("refresh_token_invalid", { ip: req.ip });
      return res.status(401).json({ error: { message: "Invalid refresh token" } });
    }

    if (record.revokedAt || record.expiresAt < new Date()) {
      clearRefreshCookie(res);
      logSecurityEvent("refresh_token_reuse", { userId: record.userId.toString(), ip: req.ip });
      await revokeAllForUser({ userId: record.userId, reason: "refresh_token_reuse" });
      return res.status(401).json({ error: { message: "Refresh token expired" } });
    }

    const user = await User.findById(record.userId).select("role");
    const accessToken = generateAccessToken({ _id: record.userId, role: user?.role });
    const nextRefresh = await rotateRefreshToken({
      tokenRecord: record,
      userId: record.userId,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    setRefreshCookie(res, nextRefresh.token);

    return res.json({ token: accessToken });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  profile,
  refresh,
};
