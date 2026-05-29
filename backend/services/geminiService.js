const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  buildChatPrompt,
  buildDocumentSimplificationPrompt,
  ensureStructuredResponse,
} = require("../ai/promptManager");

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

const generateAnswer = async ({ message, language, context, sources }) => {
  const client = getGeminiClient();
  
  // Build prompts with language (will be normalized to full name in promptManager)
  const { systemInstruction, prompt } = buildChatPrompt({ message, language, context, sources });
  
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
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          // Note: Do NOT pass language here - Gemini API doesn't support language codes
          // Language is handled in the prompt text itself
        },
      });
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      
      // Pass language to ensure proper response formatting
      return ensureStructuredResponse(response.text(), language);
    } catch (error) {
      const message = error?.message || String(error);
      lastError = error;
      
      // Log the error for debugging
      console.error(`Gemini API error with model ${modelName}:`, message);
      
      // Retry on these errors: 404 (model not found), 503 (service unavailable), 429 (rate limit)
      const shouldRetry = message.includes("404") || 
                         message.includes("503") || 
                         message.includes("429") ||
                         message.includes("high demand") ||
                         message.includes("Service Unavailable");
      
      if (!shouldRetry) {
        // For other errors, throw immediately
        throw error;
      }
      
      // Continue to next model in fallback list
      console.log(`Retrying with next model...`);
    }
  }

  throw lastError;
};

const generateSimplification = async ({ text, language }) => {
  const client = getGeminiClient();
  const { systemInstruction, prompt } = buildDocumentSimplificationPrompt({ text, language });
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
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
        },
      });
      const result = await model.generateContent(prompt);
      return ensureStructuredResponse(result.response.text(), language);
    } catch (error) {
      const message = error?.message || String(error);
      lastError = error;
      
      console.error(`Gemini API error with model ${modelName}:`, message);
      
      // Retry on these errors: 404 (model not found), 503 (service unavailable), 429 (rate limit)
      const shouldRetry = message.includes("404") || 
                         message.includes("503") || 
                         message.includes("429") ||
                         message.includes("high demand") ||
                         message.includes("Service Unavailable");
      
      if (!shouldRetry) {
        throw error;
      }
      
      console.log(`Retrying with next model...`);
    }
  }

  throw lastError;
};

module.exports = {
  generateAnswer,
  generateSimplification,
};
