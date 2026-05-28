const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "English",
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    category: {
      type: String,
      default: "General",
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
