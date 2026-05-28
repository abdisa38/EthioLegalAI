/**
 * Database Initialization Script
 * Creates indexes and performs initial setup
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/db');

// Import all models
const User = require('../models/User');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const Activity = require('../models/Activity');
const AIUsage = require('../models/AIUsage');
const UserAnalytics = require('../models/UserAnalytics');
const RefreshToken = require('../models/RefreshToken');

const models = {
  User,
  Document,
  Chat,
  Activity,
  AIUsage,
  UserAnalytics,
  RefreshToken,
};

/**
 * Create indexes for all models
 */
async function createIndexes() {
  console.log('📊 Creating database indexes...\n');

  for (const [modelName, Model] of Object.entries(models)) {
    try {
      console.log(`Creating indexes for ${modelName}...`);
      await Model.createIndexes();
      
      // Get index information
      const indexes = await Model.collection.getIndexes();
      console.log(`✅ ${modelName}: ${Object.keys(indexes).length} indexes created`);
      
      // List indexes
      Object.keys(indexes).forEach((indexName) => {
        if (indexName !== '_id_') {
          console.log(`   - ${indexName}`);
        }
      });
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating indexes for ${modelName}:`, error.message);
    }
  }
}

/**
 * Verify database connection and collections
 */
async function verifyDatabase() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Get database stats
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    console.log('Database Statistics:');
    console.log(`- Database: ${db.databaseName}`);
    console.log(`- Collections: ${stats.collections}`);
    console.log(`- Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Indexes: ${stats.indexes}`);
    console.log(`- Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:');
    collections.forEach((col) => {
      console.log(`- ${col.name}`);
    });
    console.log('');

    return true;
  } catch (error) {
    console.error('❌ Error verifying database:', error.message);
    return false;
  }
}

/**
 * Create default admin user if none exists
 */
async function createDefaultAdmin() {
  console.log('👤 Checking for admin user...\n');

  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create default admin
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@ethiolegalai.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isActive: true,
      isEmailVerified: true,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        limits: {
          maxDocuments: 1000,
          maxChats: 10000,
          maxStorageBytes: 1073741824, // 1GB
        },
      },
    });

    console.log('✅ Default admin user created');
    console.log(`   Email: ${admin.email}`);
    console.log('   Password: (check ADMIN_PASSWORD env variable)');
    console.log('');
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

/**
 * Clean up old data
 */
async function cleanupOldData() {
  console.log('🧹 Cleaning up old data...\n');

  try {
    // Clean expired refresh tokens
    const tokenResult = await RefreshToken.cleanExpired();
    console.log(`✅ Cleaned ${tokenResult.deletedCount} expired refresh tokens`);

    // Clean old activities (older than 90 days)
    const activityResult = await Activity.cleanOldActivities(90);
    console.log(`✅ Cleaned ${activityResult.deletedCount} old activity logs`);

    console.log('');
  } catch (error) {
    console.error('❌ Error cleaning up data:', error.message);
  }
}

/**
 * Main initialization function
 */
async function initializeDatabase() {
  console.log('🚀 EthioLegalAI Database Initialization\n');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Connect to database
    await connectDatabase();
    console.log('');

    // Create indexes
    await createIndexes();

    // Verify database
    await verifyDatabase();

    // Create default admin (optional)
    if (process.env.CREATE_ADMIN === 'true') {
      await createDefaultAdmin();
    }

    // Cleanup old data (optional)
    if (process.env.CLEANUP_OLD_DATA === 'true') {
      await cleanupOldData();
    }

    console.log('='.repeat(50));
    console.log('✅ Database initialization completed successfully!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  createIndexes,
  verifyDatabase,
  createDefaultAdmin,
  cleanupOldData,
  initializeDatabase,
};
