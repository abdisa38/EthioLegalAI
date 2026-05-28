/**
 * Database Migration and Index Management Utilities
 * Handles schema migrations, index creation, and data consistency
 */

const mongoose = require("mongoose");

/**
 * Create all required indexes
 */
async function createAllIndexes() {
  try {
    const models = [
      require("../models/User"),
      require("../models/Chat"),
      require("../models/Document"),
      require("../models/RefreshToken"),
      require("../models/Activity"),
      require("../models/UserAnalytics"),
      require("../models/AIUsage"),
    ];

    for (const model of models) {
      try {
        await model.collection.createIndex(
          { createdAt: 1 },
          { background: true }
        );
        
        // Create model-specific indexes
        await model.syncIndexes();
        
        console.log(`✓ Indexes created for ${model.modelName}`);
      } catch (err) {
        console.error(`✗ Failed to create indexes for ${model.modelName}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Error creating indexes:", err.message);
    throw err;
  }
}

/**
 * Migrate user data (add soft delete fields)
 */
async function migrateUserData() {
  try {
    const User = require("../models/User");
    
    // Add soft delete fields to existing users
    const result = await User.updateMany(
      {
        isDeleted: { $exists: false },
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          isActive: true,
          lastLoginAt: null,
          loginCount: 0,
          profile: {},
          preferences: {
            emailNotifications: true,
            marketingEmails: false,
            theme: "light",
          },
        },
      }
    );

    console.log(`✓ User migration completed: ${result.modifiedCount} documents updated`);
    return result;
  } catch (err) {
    console.error("Error migrating user data:", err.message);
    throw err;
  }
}

/**
 * Migrate chat data (add tracking fields)
 */
async function migrateChatData() {
  try {
    const Chat = require("../models/Chat");
    
    // Add tracking fields to existing chats
    const result = await Chat.updateMany(
      {
        isDeleted: { $exists: false },
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          aiConfidence: null,
          sources: [],
          responseTime: null,
          tokens: {
            inputTokens: 0,
            outputTokens: 0,
          },
        },
      }
    );

    console.log(`✓ Chat migration completed: ${result.modifiedCount} documents updated`);
    return result;
  } catch (err) {
    console.error("Error migrating chat data:", err.message);
    throw err;
  }
}

/**
 * Migrate document data (add tracking fields)
 */
async function migrateDocumentData() {
  try {
    const Document = require("../models/Document");
    
    const result = await Document.updateMany(
      {
        isDeleted: { $exists: false },
      },
      {
        $set: {
          isDeleted: false,
          deletedAt: null,
          views: 0,
          lastViewedAt: null,
          chunks: [],
          chunksCount: 0,
        },
      }
    );

    console.log(`✓ Document migration completed: ${result.modifiedCount} documents updated`);
    return result;
  } catch (err) {
    console.error("Error migrating document data:", err.message);
    throw err;
  }
}

/**
 * Initialize analytics for existing users
 */
async function initializeUserAnalytics() {
  try {
    const User = require("../models/User");
    const UserAnalytics = require("../models/UserAnalytics");
    
    // Get all users without analytics
    const users = await User.find({
      _id: { $nin: await UserAnalytics.distinct("userId") },
    });

    const analyticsData = users.map((user) => ({
      userId: user._id,
      chatsCreated: 0,
      documentsUploaded: 0,
      totalAiRequests: 0,
    }));

    if (analyticsData.length > 0) {
      const result = await UserAnalytics.insertMany(analyticsData);
      console.log(`✓ Analytics initialized for ${result.length} users`);
      return result;
    }

    console.log("✓ All users already have analytics records");
    return [];
  } catch (err) {
    console.error("Error initializing user analytics:", err.message);
    throw err;
  }
}

/**
 * Cleanup soft-deleted records older than threshold
 */
async function cleanupSoftDeletedRecords(daysOld = 90) {
  try {
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() - daysOld);

    const models = [
      { Model: require("./models/User"), name: "User" },
      { Model: require("./models/Chat"), name: "Chat" },
      { Model: require("./models/Document"), name: "Document" },
    ];

    const results = {};

    for (const { Model, name } of models) {
      const result = await Model.deleteMany({
        isDeleted: true,
        deletedAt: { $lt: deletionDate },
      });

      results[name] = result.deletedCount;
      console.log(`✓ Cleaned up ${result.deletedCount} soft-deleted ${name} records`);
    }

    return results;
  } catch (err) {
    console.error("Error cleaning up soft-deleted records:", err.message);
    throw err;
  }
}

/**
 * Run all migrations
 */
async function runAllMigrations() {
  console.log("Starting database migrations...\n");

  try {
    // Step 1: Create indexes
    console.log("1️⃣  Creating indexes...");
    await createAllIndexes();
    console.log();

    // Step 2: Migrate user data
    console.log("2️⃣  Migrating user data...");
    await migrateUserData();
    console.log();

    // Step 3: Migrate chat data
    console.log("3️⃣  Migrating chat data...");
    await migrateChatData();
    console.log();

    // Step 4: Migrate document data
    console.log("4️⃣  Migrating document data...");
    await migrateDocumentData();
    console.log();

    // Step 5: Initialize analytics
    console.log("5️⃣  Initializing user analytics...");
    await initializeUserAnalytics();
    console.log();

    console.log("✅ All migrations completed successfully!");
    return { success: true };
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Database health check
 */
async function performHealthCheck() {
  try {
    const db = mongoose.connection;
    
    const health = {
      timestamp: new Date().toISOString(),
      connection: {
        readyState: db.readyState,
        name: db.name,
        host: db.host,
      },
      collections: {},
    };

    // Check each model
    const models = [
      { Model: require("./models/User"), name: "User" },
      { Model: require("./models/Chat"), name: "Chat" },
      { Model: require("./models/Document"), name: "Document" },
      { Model: require("./models/Activity"), name: "Activity" },
      { Model: require("./models/UserAnalytics"), name: "UserAnalytics" },
      { Model: require("./models/AIUsage"), name: "AIUsage" },
    ];

    for (const { Model, name } of models) {
      const count = await Model.countDocuments();
      const indexes = await Model.collection.getIndexes();
      
      health.collections[name] = {
        documents: count,
        indexes: Object.keys(indexes).length,
      };
    }

    return health;
  } catch (err) {
    console.error("Health check error:", err.message);
    return { error: err.message };
  }
}

module.exports = {
  createAllIndexes,
  migrateUserData,
  migrateChatData,
  migrateDocumentData,
  initializeUserAnalytics,
  cleanupSoftDeletedRecords,
  runAllMigrations,
  performHealthCheck,
};
