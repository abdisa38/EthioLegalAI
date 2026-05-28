const { GoogleGenerativeAI } = require("@google/generative-ai");

const getEmbedClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
};

const embedText = async (text) => {
  const client = getEmbedClient();
  const modelName = process.env.GEMINI_EMBED_MODEL || "gemini-embedding-001";
  const model = client.getGenerativeModel({ model: modelName });
  const result = await model.embedContent(text);
  const embedding = result.embedding || {};
  return embedding.values || embedding.value || embedding;
};

const embedTexts = async (texts) => {
  const embeddings = [];
  for (const text of texts) {
    embeddings.push(await embedText(text));
  }
  return embeddings;
};

module.exports = {
  embedText,
  embedTexts,
};
