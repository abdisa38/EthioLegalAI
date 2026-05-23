const crypto = require("crypto");
const { splitText } = require("./chunkText");
const { embedText, embedTexts } = require("../services/embeddingService");
const { addDocuments, queryDocuments } = require("./vectorStore");

const indexDocument = async ({ documentId, userId, text }) => {
  if (!process.env.CHROMA_URL) {
    return false;
  }
  if (!text) {
    return false;
  }

  const chunks = await splitText(text);
  if (!chunks.length) {
    return false;
  }

  const embeddings = await embedTexts(chunks);
  const ids = chunks.map((_, index) => `${documentId}_${index}_${crypto.randomUUID()}`);
  const metadatas = chunks.map(() => ({
    documentId,
    userId,
  }));

  await addDocuments({ ids, embeddings, documents: chunks, metadatas });
  return true;
};

const getRelevantContext = async ({ query, userId, limit }) => {
  if (!process.env.CHROMA_URL) {
    return "";
  }

  const embedding = await embedText(query);
  const result = await queryDocuments({
    embedding,
    where: { userId },
    nResults: limit || 4,
  });

  const docs = (result.documents && result.documents[0]) || [];
  return docs.join("\n\n");
};

module.exports = {
  indexDocument,
  getRelevantContext,
};
