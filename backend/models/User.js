const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {
  softDeletePlugin,
  timestampPlugin,
  paginationPlugin,
  validationHelpersPlugin,
  jsonTransformPlugin,
} = require("../utils/baseSchema");

/**
 * Enhanced User Schema
 * Implements enterprise-level user management with optimized indexing
 */
const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // Role and Permissions
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "moderator"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
      enum: [
        "read:documents",
        "write:documents",
        "delete:documents",
        "read:chats",
        "write:chats",
        "delete:chats",
        "analyze:contracts",
        "export:data",
        "manage:users",
      ],
    },

    // Preferences
    languagePreference: {
      type: String,
      enum: {
        values: ["en", "am", "om"],
        message: "{VALUE} is not a supported language",
      },
      default: "en",
      index: true,
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Security
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },

    // Activity Tracking
    lastLoginAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastLoginIp: {
      type: String,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    lastActivityAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Profile
    profile: {
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        trim: true,
      },
      avatarUrl: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
        match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, "Invalid phone format"],
      },
      organization: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      location: {
        type: String,
        trim: true,
        maxlength: 200,
      },
    },

    // User Preferences
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      dateFormat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
        default: "MM/DD/YYYY",
      },
    },

    // Subscription & Limits
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled", "expired"],
        default: "active",
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      limits: {
        maxDocuments: { type: Number, default: 10 },
        maxChats: { type: Number, default: 50 },
        maxStorageBytes: { type: Number, default: 10485760 }, // 10MB
      },
    },

    // Soft Delete (added by plugin but defined for clarity)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.twoFactorSecret;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
// Compound indexes for common queries
userSchema.index({ email: 1, isDeleted: 1 }, { unique: true });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });
userSchema.index({ lastActivityAt: -1 });
userSchema.index({ "subscription.plan": 1, "subscription.status": 1 });

// Text index for search
userSchema.index({ name: "text", email: "text" });

// ==================== VIRTUALS ====================
userSchema.virtual("accountStatus").get(function () {
  if (this.isDeleted) return "deleted";
  if (!this.isActive) return "inactive";
  if (this.lockUntil && this.lockUntil > Date.now()) return "locked";
  return "active";
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual("fullProfile").get(function () {
  return {
    name: this.name,
    email: this.email,
    role: this.role,
    ...this.profile,
  };
});

// Virtual populate for related data
userSchema.virtual("documents", {
  ref: "Document",
  localField: "_id",
  foreignField: "userId",
});

userSchema.virtual("chats", {
  ref: "Chat",
  localField: "_id",
  foreignField: "userId",
});

userSchema.virtual("analytics", {
  ref: "UserAnalytics",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

// ==================== MIDDLEWARE ====================
// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000;
    }
    
    return next();
  } catch (err) {
    return next(err);
  }
});

// Update lastActivityAt on any update
userSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.lastActivityAt = new Date();
  }
  next();
});

// ==================== INSTANCE METHODS ====================
// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Update last login
userSchema.methods.updateLastLogin = async function (ip = null) {
  this.lastLoginAt = new Date();
  this.lastActivityAt = new Date();
  this.loginCount = (this.loginCount || 0) + 1;
  this.failedLoginAttempts = 0;
  if (ip) this.lastLoginIp = ip;
  return this.save({ validateBeforeSave: false });
};

// Handle failed login
userSchema.methods.handleFailedLogin = async function () {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  
  // Lock account after 5 failed attempts
  if (this.failedLoginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
  }
  
  return this.save({ validateBeforeSave: false });
};

// Unlock account
userSchema.methods.unlock = async function () {
  this.lockUntil = null;
  this.failedLoginAttempts = 0;
  return this.save({ validateBeforeSave: false });
};

// Check subscription limits
userSchema.methods.canUploadDocument = function (currentCount) {
  return currentCount < this.subscription.limits.maxDocuments;
};

userSchema.methods.canCreateChat = function (currentCount) {
  return currentCount < this.subscription.limits.maxChats;
};

userSchema.methods.hasStorageSpace = function (currentUsage, newFileSize) {
  return currentUsage + newFileSize <= this.subscription.limits.maxStorageBytes;
};

// ==================== QUERY HELPERS ====================
userSchema.query.active = function () {
  return this.where({ isDeleted: false, isActive: true });
};

userSchema.query.verified = function () {
  return this.where({ isEmailVerified: true });
};

userSchema.query.byRole = function (role) {
  return this.where({ role, isDeleted: false });
};

userSchema.query.recentlyActive = function (days = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.where({ lastActivityAt: { $gte: date } });
};

// ==================== STATIC METHODS ====================
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase(), isDeleted: false });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, isDeleted: false });
};

userSchema.statics.getUserStats = async function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] },
        },
        deletedUsers: {
          $sum: { $cond: [{ $eq: ["$isDeleted", true] }, 1, 0] },
        },
      },
    },
  ]);
};

// ==================== PLUGINS ====================
userSchema.plugin(softDeletePlugin);
userSchema.plugin(timestampPlugin);
userSchema.plugin(paginationPlugin);
userSchema.plugin(validationHelpersPlugin);

module.exports = mongoose.model("User", userSchema);
