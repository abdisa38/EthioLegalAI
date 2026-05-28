/**
 * Database Migration Script
 * Migrates existing data to new schema structure
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/db');

// Import models
const User = require('../models/User');
const Document = require('../models/Document');
const Chat = require('../models/Chat');
const UserAnalytics = require('../models/UserAnalytics');

/**
 * Migrate User model
 * Adds new fields with default values
 */
async function migrateUsers() {
  console.log('👤 Migrating User model...');

  try {
    const result = await User.updateMany(
      {
        $or: [
          { 'subscription.plan': { $exists: false } },
          { permissions: { $exists: false } },
          { isEmailVerified: { $exists: false } },
        ],
      },
      {
        $set: {
          'subscription.plan': 'free',
          'subscription.status': 'active',
          'subscription.limits.maxDocuments': 10,
          'subscription.limits.maxChats': 50,
          'subscription.limits.maxStorageBytes': 10485760, // 10MB
          permissions: [],
          isEmailVerified: false,
          failedLoginAttempts: 0,
          twoFactorEnabled: false,
          'preferences.timezone': 'UTC',
          'preferences.dateFormat': 'MM/DD/YYYY',
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
  } catch (error) {
    console.error('❌ Error migrating users:', error.message);
  }
}

/**
 * Migrate Document model
 * Adds new tracking fields
 */
async function migrateDocuments() {
  console.log('📄 Migrating Document model...');

  try {
    const result = await Document.updateMany(
      {
        $or: [
          { views: { $exists: false } },
          { lastViewedAt: { $exists: false } },
          { chunksCount: { $exists: false } },
        ],
      },
      {
        $set: {
          views: 0,
          lastViewedAt: null,
          chunksCount: 0,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} documents`);
  } catch (error) {
    console.error('❌ Error migrating documents:', error.message);
  }
}

/**
 * Migrate Chat model
 * Adds new fields for threading and ratings
 */
async function migrateChats() {
  console.log('💬 Migrating Chat model...');

  try {
    const result = await Chat.updateMany(
      {
        $or: [
          { threadId: { $exists: false } },
          { rating: { $exists: false } },
          { sourcesCount: { $exists: false } },
          { model: { $exists: false } },
        ],
      },
      {
        $set: {
          threadId: null,
          parentChatId: null,
          rating: null,
          feedback: null,
          sourcesCount: 0,
          model: 'gemini-pro',
          hasError: false,
          errorMessage: null,
        },
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} chats`);

    // Update sourcesCount based on sources array
    const chatsWithSources = await Chat.find({ sources: { $exists: true, $ne: [] } });
    for (const chat of chatsWithSources) {
      chat.sourcesCount = chat.sources.length;
      await chat.save({ validateBeforeSave: false });
    }

    console.log(`✅ Updated sourcesCount for ${chatsWithSources.length} chats`);
  } catch (error) {
    console.error('❌ Error migrating chats:', error.message);
  }
}

/**
 * Create UserAnalytics for existing users
 */
async function createUserAnalytics() {
  console.log('📊 Creating UserAnalytics records...');

  try {
    const users = await User.find({ isDeleted: false }).select('_id');
    let created = 0;

    for (const user of users) {
      const exists = await UserAnalytics.findOne({ userId: user._id });
      if (!exists) {
        await UserAnalytics.create({ userId: user._id });
        created++;
      }
    }

    console.log(`✅ Created ${created} UserAnalytics records`);
  } catch (error) {
    console.error('❌ Error creating UserAnalytics:', error.message);
  }
}

/**
 * Populate UserAnalytics with existing data
 */
async function populateUserAnalytics() {
  console.log('📈 Populating UserAnalytics with existing data...');

  try {
    const users = await User.find({ isDeleted: false }).select('_id');

    for (const user of users) {
      const analytics = await UserAnalytics.findOne({ userId: user._id });
      if (!analytics) continue;

      // Count documents
      const documentCount = await Document.countDocuments({
        userId: user._id,
        isDeleted: false,
      });
      const totalDocSize = await Document.aggregate([
        { $match: { userId: user._id, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$fileSize' } } },
      ]);

      // Count chats
      const chatCount = await Chat.countDocuments({
        userId: user._id,
        isDeleted: false,
      });
      const starredCount = await Chat.countDocuments({
        userId: user._id,
        starred: true,
        isDeleted: false,
      });

      // Update analytics
      analytics.documents.current = documentCount;
      analytics.documents.uploaded = documentCount;
      analytics.documents.totalSizeBytes = totalDocSize[0]?.total || 0;
      analytics.chats.current = chatCount;
      analytics.chats.created = chatCount;
      analytics.chats.starred = starredCount;
      analytics.engagement.lastActiveAt = user.lastLoginAt;
      analytics.engagement.loginCount = user.loginCount || 0;

      await analytics.save();
    }

    console.log(`✅ Populated analytics for ${users.length} users`);
  } catch (error) {
    console.error('❌ Error populating UserAnalytics:', error.message);
  }
}

/**
 * Add deletedBy field to soft-deleted records
 */
async function addDeletedByField() {
  console.log('🗑️  Adding deletedBy field to soft-deleted records...');

  try {
    const models = [User, Document, Chat];
    let totalUpdated = 0;

    for (const Model of models) {
      const result = await Model.updateMany(
        {
          isDeleted: true,
          deletedBy: { $exists: false },
        },
        {
          $set: {
            deletedBy: null,
          },
        }
      );
      totalUpdated += result.modifiedCount;
    }

    console.log(`✅ Updated ${totalUpdated} soft-deleted records`);
  } catch (error) {
    console.error('❌ Error adding deletedBy field:', error.message);
  }
}

/**
 * Update token usage in chats
 */
async function updateChatTokens() {
  console.log('🔢 Updating chat token calculations...');

  try {
    const chats = await Chat.find({
      'tokens.totalTokens': { $exists: false },
      'tokens.inputTokens': { $exists: true },
      'tokens.outputTokens': { $exists: true },
    });

    for (const chat of chats) {
      chat.tokens.totalTokens = chat.tokens.inputTokens + chat.tokens.outputTokens;
      await chat.save({ validateBeforeSave: false });
    }

    console.log(`✅ Updated ${chats.length} chat token calculations`);
  } catch (error) {
    console.error('❌ Error updating chat tokens:', error.message);
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 EthioLegalAI Database Migration\n');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Connect to database
    await connectDatabase();
    console.log('');

    // Run migrations
    await migrateUsers();
    await migrateDocuments();
    await migrateChats();
    await createUserAnalytics();
    await populateUserAnalytics();
    await addDeletedByField();
    await updateChatTokens();

    console.log('');
    console.log('='.repeat(50));
    console.log('✅ Migration completed successfully!\n');

    // Create indexes after migration
    console.log('Creating indexes...');
    await User.createIndexes();
    await Document.createIndexes();
    await Chat.createIndexes();
    await UserAnalytics.createIndexes();
    console.log('✅ Indexes created\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  runMigration();
}

module.exports = {
  migrateUsers,
  migrateDocuments,
  migrateChats,
  createUserAnalytics,
  populateUserAnalytics,
  runMigration,
};
