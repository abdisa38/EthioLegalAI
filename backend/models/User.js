const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    languagePreference: {
      type: String,
      enum: ["en", "am", "om"],
      default: "en",
    },
    isActive: {
      type: Boolean,
      default: true,
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
    lastLoginAt: {
      type: Date,
      default: null,
      index: true,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    profile: {
      bio: { type: String, maxlength: 500 },
      avatarUrl: String,
      phone: String,
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ lastLoginAt: -1 });

// Virtual for account status
userSchema.virtual("accountStatus").get(function () {
  if (this.isDeleted) return "deleted";
  return this.isActive ? "active" : "inactive";
});

// Hash password before saving
userSchema.pre("save", async function handlePasswordHash(next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Get active users only query
userSchema.query.active = function () {
  return this.where({ isDeleted: false, isActive: true });
};

// Lean optimization for read-only queries
userSchema.query.lean = function () {
  return this.lean();
};

// Soft delete method
userSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Restore method
userSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  return this.save();
};

// Update last login
userSchema.methods.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  this.loginCount = (this.loginCount || 0) + 1;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
