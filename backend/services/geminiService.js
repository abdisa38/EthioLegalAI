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
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
  const model = client.getGenerativeModel({ model: modelName });
  const prompt = buildPrompt(message, language);
  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
};

module.exports = {
  generateAnswer,
};
