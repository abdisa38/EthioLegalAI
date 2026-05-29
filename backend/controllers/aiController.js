const { generateAnswer, generateSimplification } = require("../services/geminiService");
const https = require("https");
const Chat = require("../models/Chat");
const { getRelevantContext } = require("../rag/ragService");
const { calculateConfidence } = require("../utils/confidenceScorer");

/**
 * Split text into sentence chunks for streaming
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
 * Accepts both full names and codes
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

const chat = async (req, res, next) => {
  let savedChat = null;
  let responseData = null;
  let responseSent = false;
  
  try {
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: { message: "Message is required" } });
    }

    const { context, sources } = await getRelevantContext({
      query: message,
      userId: req.user._id.toString(),
    });
    
    // Pass language to generateAnswer - it will be normalized in promptManager
    const answer = await generateAnswer({ message, language, context, sources });
    const confidence = calculateConfidence(answer, Boolean(context));
    const chunks = buildChunks(answer);

    // Normalize language to code for database storage (en, am, om)
    const languageCode = normalizeLanguage(language);
    
    // Save chat to database
    savedChat = await Chat.create({
      userId: req.user._id,
      question: message,
      answer,
      language: languageCode,
      title: message.length > 50 ? message.substring(0, 50) + "..." : message,
    });

    // Prepare response data
    responseData = {
      id: savedChat._id,
      answer,
      chunks,
      contextUsed: Boolean(context),
      confidence,
      sources,
      suggestedPrompts: [
        "Explain this in simple terms",
        "What law covers this in Ethiopia?",
        "What should I do next?",
      ],
    };

    // Send response
    res.json(responseData);
    responseSent = true;
    
    console.log(`✅ Chat response sent successfully (ID: ${savedChat._id})`);
    return;
  } catch (error) {
    const errorMessage = error?.message || String(error);
    
    // If response was already sent, just log the error and return
    if (responseSent) {
      console.warn("⚠️  Post-response error (ignored, response already sent):", errorMessage);
      return;
    }
    
    // If we have a saved chat and response data, send it even if there's an error
    if (savedChat && responseData) {
      console.warn("⚠️  Error after save (ignored, sending successful response):", errorMessage);
      res.json(responseData);
      return;
    }
    
    // If we have a saved chat but no response data, reconstruct it
    if (savedChat) {
      console.warn("⚠️  Error after save (reconstructing response):", errorMessage);
      
      res.json({
        id: savedChat._id,
        answer: savedChat.answer,
        chunks: buildChunks(savedChat.answer),
        contextUsed: false,
        confidence: calculateConfidence(savedChat.answer, false),
        sources: [],
        suggestedPrompts: [
          "Explain this in simple terms",
          "What law covers this in Ethiopia?",
          "What should I do next?",
        ],
      });
      return;
    }
    
    // For other errors, log and pass to error handler
    console.error("Gemini chat failed:", errorMessage);
    error.statusCode = error.statusCode || 502;
    return next(error);
  }
};

const simplify = async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: { message: "Text is required" } });
    }

    const simplified = await generateSimplification({ text, language });
    const confidence = calculateConfidence(simplified, false);
    const chunks = buildChunks(simplified);

    return res.json({
      simplified,
      chunks,
      confidence,
    });
  } catch (error) {
    console.error("Gemini simplification failed:", error?.message || error);
    error.statusCode = error.statusCode || 502;
    return next(error);
  }
};

module.exports = {
  chat,
  simplify,
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
