const mongoose = require("mongoose");

/**
 * Enhanced MongoDB Connection Configuration
 * Implements enterprise-level connection management
 */

// Connection options for production optimization
const getConnectionOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    // Automatic index creation (disable in production for performance)
    autoIndex: !isProduction,
    
    // Connection pool settings
    maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE, 10) || 10,
    minPoolSize: 2,
    
    // Timeout settings
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Compression
    compressors: ["zlib"],
    
    // Read preference for replica sets
    readPreference: "primaryPreferred",
  };
};

// Configure mongoose settings
const configureMongoose = () => {
  // Sanitize filter to prevent query injection
  mongoose.set("sanitizeFilter", true);
  
  // Strict query mode
  mongoose.set("strictQuery", true);
  
  // Strict populate mode
  mongoose.set("strictPopulate", true);
  
  // Enable query debugging in development
  if (process.env.NODE_ENV === "development") {
    mongoose.set("debug", true);
  }
  
  // Optimize for JSON
  mongoose.set("toJSON", {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  });
};

// Connection event handlers
const setupConnectionHandlers = () => {
  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("🔄 MongoDB reconnected");
  });

  // Graceful shutdown
  process.on("SIGINT", async () => {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
      process.exit(1);
    }
  });
};

// Main connection function
const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    // Configure mongoose
    configureMongoose();

    // Setup event handlers
    setupConnectionHandlers();

    // Connect to MongoDB
    const options = getConnectionOptions();
    await mongoose.connect(mongoUri, options);

    // Create indexes in production if needed
    if (process.env.NODE_ENV === "production" && process.env.CREATE_INDEXES === "true") {
      console.log("Creating indexes...");
      await Promise.all(
        Object.values(mongoose.models).map((model) => model.createIndexes())
      );
      console.log("✅ Indexes created successfully");
    }

    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    
    // Retry connection in production
    if (process.env.NODE_ENV === "production") {
      console.log("Retrying connection in 5 seconds...");
      setTimeout(connectDatabase, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    if (state === 1) {
      // Ping database
      await mongoose.connection.db.admin().ping();
      return {
        status: "healthy",
        state: states[state],
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      };
    }

    return {
      status: "unhealthy",
      state: states[state],
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  }
};

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      avgObjSize: stats.avgObjSize,
    };
  } catch (error) {
    console.error("Error getting database stats:", error);
    return null;
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth,
  getDatabaseStats,
};
