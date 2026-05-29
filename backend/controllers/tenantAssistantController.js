const Chat = require("../models/Chat");
const { generateTenantAnswer } = require("../services/tenantAssistantService");
const { calculateConfidence } = require("../utils/confidenceScorer");

/**
 * Split text into sentence chunks
 */
const buildChunks = (text) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return [text];
  }
  return sentences;
};

/**
 * Normalize language input to language code
 * @param {string} language - Language name or code
 * @returns {string} Language code (en, am, om)
 */
const normalizeLanguage = (language) => {
  if (!language) return "en";
  
  const lower = language.toLowerCase().trim();
  
  // If already a code, return it
  if (["en", "am", "om"].includes(lower)) {
    return lower;
  }
  
  // Map full names to codes
  const languageMap = {
    "english": "en",
    "amharic": "am",
    "አማርኛ": "am",
    "afaan oromo": "om",
    "afaan": "om",
    "oromo": "om",
    "oromiffa": "om"
  };
  
  return languageMap[lower] || "en";
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

    // Normalize language to code (en, am, om)
    const languageCode = normalizeLanguage(language);

    await Chat.create({
      userId: req.user._id,
      question: message,
      answer,
      language: languageCode,
      title: message.length > 50 ? `${message.substring(0, 50)}...` : message,
      category: "Tenant",
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
