const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_PROMPT } = require("../ai/systemPrompt");

const buildPrompt = (message, language, context) => {
  const langHint = language ? `Respond in ${language}.` : "";
  const contextBlock = context
    ? `\nContext (use if relevant and prioritize accuracy):\n${context}\n`
    : "";
  const guidance = "If context is missing or insufficient, say so and avoid making up legal citations.";
  return `${SYSTEM_PROMPT}\n${guidance}\n${langHint}${contextBlock}\nUser: ${message}`.trim();
};

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateAnswer = async ({ message, language, context }) => {
  const client = getGeminiClient();
  const prompt = buildPrompt(message, language, context);
  const modelEnv = process.env.GEMINI_MODEL;
  const modelFallbacks = [
    modelEnv,
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
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
