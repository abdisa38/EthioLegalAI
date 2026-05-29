const User = require('../models/User');
const Chat = require('../models/Chat');
const Document = require('../models/Document');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get platform-wide statistics for landing page
 */
const getPlatformStats = asyncHandler(async (req, res) => {
  try {
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] }
          },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] }
          }
        }
      }
    ]);

    // Get chat statistics
    const chatStats = await Chat.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          totalQuestions: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratedChats: {
            $sum: { $cond: [{ $ne: ["$rating", null] }, 1, 0] }
          }
        }
      }
    ]);

    // Get document statistics
    const documentStats = await Document.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          analyzedDocuments: {
            $sum: { $cond: [{ $ne: ["$analysis", null] }, 1, 0] }
          },
          totalRiskAlertsDetected: {
            $sum: { $size: { $ifNull: ["$analysis.risks", []] } }
          }
        }
      }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Chat.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isDeleted: false }),
      Document.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isDeleted: false })
    ]);

    // Format response
    const stats = {
      users: {
        total: userStats[0]?.totalUsers || 0,
        active: userStats[0]?.activeUsers || 0,
        verified: userStats[0]?.verifiedUsers || 0,
        recent: recentActivity[0] || 0
      },
      chats: {
        total: chatStats[0]?.totalChats || 0,
        questions: chatStats[0]?.totalQuestions || 0,
        averageRating: chatStats[0]?.averageRating || 0,
        ratedCount: chatStats[0]?.ratedChats || 0,
        recent: recentActivity[1] || 0
      },
      documents: {
        total: documentStats[0]?.totalDocuments || 0,
        analyzed: documentStats[0]?.analyzedDocuments || 0,
        riskAlertsDetected: documentStats[0]?.totalRiskAlertsDetected || 0,
        recent: recentActivity[2] || 0
      },
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching platform statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch platform statistics',
      error: error.message
    });
  }
});

/**
 * Get user-specific dashboard statistics
 */
const getUserDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's chat statistics
    const userChatStats = await Chat.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          starredChats: {
            $sum: { $cond: [{ $eq: ["$starred", true] }, 1, 0] }
          },
          averageRating: { $avg: "$rating" },
          totalTokens: { $sum: "$tokens.totalTokens" },
          averageResponseTime: { $avg: "$responseTime" }
        }
      }
    ]);

    // Get user's document statistics
    const userDocStats = await Document.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
      {
        $group: {
          _id: null,
          totalDocuments: { $sum: 1 },
          analyzedDocuments: {
            $sum: { $cond: [{ $ne: ["$analysis", null] }, 1, 0] }
          },
          totalSize: { $sum: "$fileSize" },
          averageRiskScore: { $avg: "$riskScore" },
          totalViews: { $sum: "$views" }
        }
      }
    ]);

    // Get category breakdown
    const categoryStats = await Chat.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get language usage
    const languageStats = await Chat.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId), isDeleted: false } },
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      chats: userChatStats[0] || {
        totalChats: 0,
        starredChats: 0,
        averageRating: 0,
        totalTokens: 0,
        averageResponseTime: 0
      },
      documents: userDocStats[0] || {
        totalDocuments: 0,
        analyzedDocuments: 0,
        totalSize: 0,
        averageRiskScore: 0,
        totalViews: 0
      },
      categories: categoryStats,
      languages: languageStats,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching user dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

module.exports = {
  getPlatformStats,
  getUserDashboardStats
};