const { generateAnswer } = require("../services/geminiService");
const https = require("https");
const Chat = require("../models/Chat");
const { getRelevantContext } = require("../rag/ragService");

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

    const { context, sources } = await getRelevantContext({
      query: message,
      userId: req.user._id.toString(),
    });
    const answer = await generateAnswer({ message, language, context });
    const chunks = buildChunks(answer);

    const savedChat = await Chat.create({
      userId: req.user._id,
      question: message,
      answer,
      language: language || "English",
      title: message.length > 50 ? message.substring(0, 50) + "..." : message,
    });

    return res.json({
      id: savedChat._id,
      answer,
      chunks,
      contextUsed: Boolean(context),
      sources,
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`;

      https.get(url, (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode && response.statusCode >= 400) {
            return res.status(response.statusCode).json({ error: { message: body } });
          }

          try {
            const data = JSON.parse(body);
            const models = (data.models || []).map((model) => ({
              name: model.name,
              supportedMethods: model.supportedGenerationMethods || [],
            }));
            return res.json({ models });
          } catch (error) {
            return res.status(500).json({ error: { message: "Failed to parse model list" } });
          }
        });
      }).on("error", (error) => {
        return next(error);
      });
    } catch (error) {
      return next(error);
    }
  },
};
