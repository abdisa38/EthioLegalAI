const crypto = require("crypto");
const { splitText } = require("./chunkText");
const { embedText, embedTexts } = require("../services/embeddingService");
const { addDocuments, queryDocuments } = require("./vectorStore");

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getChunkOptions = () => ({
  chunkSize: parseNumber(process.env.RAG_CHUNK_SIZE, 1000),
  chunkOverlap: parseNumber(process.env.RAG_CHUNK_OVERLAP, 150),
});

const getTopK = (limit) => limit || parseNumber(process.env.RAG_TOP_K, 4);

const formatSourceLabel = (meta) => {
  if (meta?.filename) return meta.filename;
  if (meta?.documentId) return `Document ${meta.documentId}`;
  return "Uploaded document";
};

const indexDocument = async ({ documentId, userId, text, filename }) => {
  if (!process.env.CHROMA_URL) {
    return false;
  }
  if (!text) {
    return false;
  }

  const chunks = await splitText(text, getChunkOptions());
  if (!chunks.length) {
    return false;
  }

  const embeddings = await embedTexts(chunks);
  const ids = chunks.map((_, index) => `${documentId}_${index}_${crypto.randomUUID()}`);
  const metadatas = chunks.map((chunk, index) => ({
    documentId,
    userId,
    filename: filename || "",
    chunkIndex: index,
    chunkLength: chunk.length,
  }));

  await addDocuments({ ids, embeddings, documents: chunks, metadatas });
  return true;
};

const getRelevantContext = async ({ query, userId, limit }) => {
  if (!process.env.CHROMA_URL) {
    return { context: "", sources: [] };
  }

  const embedding = await embedText(query);
  const result = await queryDocuments({
    embedding,
    where: { userId },
    nResults: getTopK(limit),
    include: ["documents", "metadatas", "distances"],
  });

  const docs = (result.documents && result.documents[0]) || [];
  const metadatas = (result.metadatas && result.metadatas[0]) || [];
  const distances = (result.distances && result.distances[0]) || [];

  const context = docs
    .map((doc, index) => {
      const meta = metadatas[index];
      const label = formatSourceLabel(meta);
      const chunkLabel = Number.isFinite(meta?.chunkIndex) ? ` (chunk ${meta.chunkIndex + 1})` : "";
      return `Source: ${label}${chunkLabel}\n${doc}`.trim();
    })
    .join("\n\n---\n\n");

  const sources = docs.map((_, index) => {
    const meta = metadatas[index] || {};
    return {
      documentId: meta.documentId,
      filename: meta.filename,
      chunkIndex: meta.chunkIndex,
      distance: distances[index],
    };
  });

  return { context, sources };
};

module.exports = {
  indexDocument,
  getRelevantContext,
};
