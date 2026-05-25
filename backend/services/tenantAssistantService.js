const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SYSTEM_PROMPT } = require("../ai/systemPrompt");

const buildPrompt = (message, language) => {
  const langHint = language ? `Respond in ${language}.` : "Respond in English.";
  return `
${SYSTEM_PROMPT}
You are a tenant-rights assistant for Ethiopia. Provide clear, practical guidance on eviction, deposits, repairs, rent increases, and landlord entry.
${langHint}
Rules:
- Ask 1-3 clarifying questions if key facts are missing (location, lease type, notice length, dates).
- Avoid legal citations unless you are confident; otherwise say "General guidance".
- Provide step-by-step next actions.
- Always include a short disclaimer at the end.

User question: ${message}
`.trim();
};

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateTenantAnswer = async ({ message, language }) => {
  const client = getGeminiClient();
  const prompt = buildPrompt(message, language);
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
      return result.response.text();
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
  generateTenantAnswer,
};
