const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set");
    }

    mongoose.set("sanitizeFilter", true);
    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
