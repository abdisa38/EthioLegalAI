const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_PROMPT } = require("../ai/systemPrompt");

const buildPrompt = (message, language) => {
  const langHint = language ? `Respond in ${language}.` : "";
  return `${SYSTEM_PROMPT}\n${langHint}\nUser: ${message}`.trim();
};

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateAnswer = async ({ message, language }) => {
  const client = getGeminiClient();
  const prompt = buildPrompt(message, language);
  const modelEnv = process.env.GEMINI_MODEL;
  const modelFallbacks = [
    modelEnv,
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gemini-1.0-pro",
  ].filter(Boolean);

  let lastError;

  for (const modelName of modelFallbacks) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      const message = error?.message || String(error);
      lastError = error;
      if (!message.includes("404")) {
        throw error;
      }
    }
  }

  throw lastError;
};

module.exports = {
  generateAnswer,
};
