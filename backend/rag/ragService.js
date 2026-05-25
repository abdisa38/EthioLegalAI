const crypto = require("crypto");
const { splitText } = require("./chunkText");
const { embedText, embedTexts } = require("../services/embeddingService");
const { addDocuments, queryDocuments } = require("./vectorStore");
const { categorizeDocument } = require("./documentCategorizer");
const { preprocessQuery } = require("./queryPreprocessor");
const { processAndRerankChunks } = require("./contextReranker");

const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getChunkOptions = () => ({
  chunkSize: parseNumber(process.env.RAG_CHUNK_SIZE, 1000),
  chunkOverlap: parseNumber(process.env.RAG_CHUNK_OVERLAP, 150),
  minChunkSize: parseNumber(process.env.RAG_MIN_CHUNK_SIZE, 200),
});

const getRetrieveK = (limit) => limit || parseNumber(process.env.RAG_RETRIEVE_K, 12);
const getTopK = (limit) => limit || parseNumber(process.env.RAG_TOP_K, 4);
const getMaxContextChars = () => parseNumber(process.env.RAG_MAX_CONTEXT_CHARS, 3500);
const getSimilarityThreshold = () => Number.parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.45");
const getMaxResults = () => parseNumber(process.env.RAG_MAX_RESULTS, 4);
const getMaxChunks = () => parseNumber(process.env.RAG_MAX_CHUNKS, 200);

const shouldLogDebug = () => process.env.RAG_DEBUG === "true";
const debugLog = (...args) => {
  if (shouldLogDebug()) {
    console.log("[RAG]", ...args);
  }
};

const buildChunkHash = (text) =>
  crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");

const indexDocument = async ({ documentId, userId, text, filename }) => {
  if (!process.env.CHROMA_URL) {
    return false;
  }
  if (!text) {
    return false;
  }

  const category = categorizeDocument(filename, text);
  const chunks = await splitText(text, getChunkOptions());
  if (!chunks.length) {
    return false;
  }

  const limitedChunks = chunks.slice(0, getMaxChunks());
  const embeddings = await embedTexts(limitedChunks);
  const ids = limitedChunks.map((_, index) => `${documentId}_${index}_${crypto.randomUUID()}`);
  const metadatas = limitedChunks.map((chunk, index) => ({
    documentId,
    userId,
    filename: filename || "",
    chunkIndex: index,
    chunkLength: chunk.length,
    chunkHash: buildChunkHash(chunk),
    category,
  }));

  await addDocuments({ ids, embeddings, documents: limitedChunks, metadatas });
  debugLog("Indexed document", {
    documentId,
    filename,
    category,
    chunks: limitedChunks.length,
  });
  return true;
};

const getRelevantContext = async ({ query, userId, limit }) => {
  if (!process.env.CHROMA_URL) {
    return { context: "", sources: [] };
  }

  const queryMeta = preprocessQuery(query);
  const queryText = queryMeta.predictedCategory !== "General"
    ? `${queryMeta.predictedCategory} ${queryMeta.normalizedQuery}`
    : queryMeta.normalizedQuery || query;

  const embedding = await embedText(queryText);
  const retrievalK = getRetrieveK(limit);
  const include = ["documents", "metadatas", "distances"];

  const baseFilter = { userId };
  const categoryFilter =
    queryMeta.predictedCategory && queryMeta.predictedCategory !== "General"
      ? { ...baseFilter, category: queryMeta.predictedCategory }
      : baseFilter;

  let result = await queryDocuments({
    embedding,
    where: categoryFilter,
    nResults: retrievalK,
    include,
  });

  const retrievedCount = (result.documents && result.documents[0] && result.documents[0].length) || 0;

  if (retrievedCount < Math.max(3, getTopK(limit))) {
    result = await queryDocuments({
      embedding,
      where: baseFilter,
      nResults: retrievalK,
      include,
    });
  }

  const reranked = processAndRerankChunks(result, queryMeta, {
    similarityThreshold: getSimilarityThreshold(),
    maxResults: getMaxResults(),
    maxCharLength: getMaxContextChars(),
  });

  debugLog("Query", {
    query,
    predictedCategory: queryMeta.predictedCategory,
    keywords: queryMeta.keywords?.slice(0, 6),
    retrievalK,
    retrievedCount: (result.documents && result.documents[0] && result.documents[0].length) || 0,
    selectedCount: reranked.selectedCount,
    threshold: getSimilarityThreshold(),
  });

  return {
    context: reranked.context,
    sources: reranked.sources,
    debug: shouldLogDebug() ? reranked : undefined,
  };
};

module.exports = {
  indexDocument,
  getRelevantContext,
};
