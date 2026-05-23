const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateAnswer } = require("../services/geminiService");

const buildChunks = (text) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 1) {
    return [text];
  }
  return sentences;
};

const chat = async (req, res, next) => {
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: { message: "Message is required" } });
    }

    const answer = await generateAnswer({ message, language });
    const chunks = buildChunks(answer);

    return res.json({
      answer,
      chunks,
      suggestedPrompts: [
        "Explain this in simple terms",
        "What law covers this in Ethiopia?",
        "What should I do next?",
      ],
    });
  } catch (error) {
    console.error("Gemini chat failed:", error?.message || error);
    error.statusCode = error.statusCode || 502;
    return next(error);
  }
};

module.exports = {
  chat,
  listModels: async (req, res, next) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: { message: "GEMINI_API_KEY is not set" } });
      }
      const client = new GoogleGenerativeAI(apiKey);
      const response = await client.listModels();
      return res.json({ models: response.models || response });
    } catch (error) {
      return next(error);
    }
  },
};
