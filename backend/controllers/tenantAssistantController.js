const Chat = require("../models/Chat");
const { generateTenantAnswer } = require("../services/tenantAssistantService");
const { calculateConfidence } = require("../utils/confidenceScorer");

const buildChunks = (text) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return [text];
  }
  return sentences;
};

const askTenantAssistant = async (req, res, next) => {
  try {
    const { message, language } = req.body;
    if (!message) {
      return res.status(400).json({ error: { message: "Message is required" } });
    }

    const answer = await generateTenantAnswer({ message, language });
    const confidence = calculateConfidence(answer, false);
    const chunks = buildChunks(answer);

    await Chat.create({
      userId: req.user._id,
      question: message,
      answer,
      language: language || "English",
      title: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      category: "Tenant Rights",
    });

    return res.json({
      answer,
      chunks,
      confidence,
      contextUsed: false,
      sources: [],
      suggestedPrompts: [
        "My landlord gave me a 7-day eviction notice. What can I do?",
        "How do I get my security deposit back?",
        "Can my landlord enter without notice?",
        "What are my rights if repairs are ignored?",
      ],
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  askTenantAssistant,
};
