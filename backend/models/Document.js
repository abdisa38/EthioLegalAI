const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    riskScore: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
