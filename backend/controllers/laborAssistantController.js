const Chat = require("../models/Chat");
const { generateLaborAnswer } = require("../services/laborAssistantService");
const { calculateConfidence } = require("../utils/confidenceScorer");

const buildChunks = (text) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return [text];
  }
  return sentences;
};

const askLaborAssistant = async (req, res, next) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: { message: "Message is required" } });
    }

    const answer = await generateLaborAnswer({ message, language });
    const confidence = calculateConfidence(answer, false);
    const chunks = buildChunks(answer);

    await Chat.create({
      userId: req.user._id,
      question: message,
      answer,
      language: language || "English",
      title: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      category: "Labor Law",
    });

    return res.json({
      answer,
      chunks,
      confidence,
      contextUsed: false,
      sources: [],
      suggestedPrompts: [
        "My salary is delayed for two months. What should I do?",
        "Am I entitled to overtime pay for weekend work?",
        "Can my employer terminate me without notice?",
        "What severance pay am I entitled to?",
      ],
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  askLaborAssistant,
};
