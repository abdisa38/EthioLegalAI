const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildLaborPrompt, ensureStructuredResponse } = require("../ai/promptManager");

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateLaborAnswer = async ({ message, language }) => {
  const client = getGeminiClient();
  const prompt = buildLaborPrompt({ message, language });
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
      return ensureStructuredResponse(result.response.text(), language);
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
  generateLaborAnswer,
};
