/**
 * RAG (Retrieval-Augmented Generation) Service
 * 
 * Core service for document indexing and context retrieval using vector similarity search.
 * Implements a sophisticated pipeline: chunking → embedding → storage → retrieval → reranking
 * 
 * @module rag/ragService
 * @requires crypto - For generating unique chunk hashes
 * @requires ./chunkText - Text chunking with overlap
 * @requires ../services/embeddingService - Gemini embedding generation
 * @requires ./vectorStore - ChromaDB vector storage
 * @requires ./documentCategorizer - Document category detection
 * @requires ./queryPreprocessor - Query intent analysis
 * @requires ./contextReranker - Result reranking and filtering
 */

const crypto = require("crypto");
const { splitText } = require("./chunkText");
const { embedText, embedTexts } = require("../services/embeddingService");
const { addDocuments, queryDocuments } = require("./vectorStore");
const { categorizeDocument } = require("./documentCategorizer");
const { preprocessQuery } = require("./queryPreprocessor");
const { processAndRerankChunks } = require("./contextReranker");

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Safely parse integer from environment variable with fallback
 * @param {string} value - Environment variable value
 * @param {number} fallback - Default value if parsing fails
 * @returns {number} Parsed integer or fallback
 */
const parseNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Get text chunking configuration from environment
 * @returns {Object} Chunk options { chunkSize, chunkOverlap, minChunkSize }
 */
const getChunkOptions = () => ({
  chunkSize: parseNumber(process.env.RAG_CHUNK_SIZE, 1000),
  chunkOverlap: parseNumber(process.env.RAG_CHUNK_OVERLAP, 150),
  minChunkSize: parseNumber(process.env.RAG_MIN_CHUNK_SIZE, 200),
});

/** Get number of chunks to retrieve before reranking */
const getRetrieveK = (limit) => limit || parseNumber(process.env.RAG_RETRIEVE_K, 12);

/** Get number of top chunks to return after reranking */
const getTopK = (limit) => limit || parseNumber(process.env.RAG_TOP_K, 4);

/** Get maximum context length in characters */
const getMaxContextChars = () => parseNumber(process.env.RAG_MAX_CONTEXT_CHARS, 3500);

/** Get minimum similarity threshold for filtering results */
const getSimilarityThreshold = () => Number.parseFloat(process.env.RAG_SIMILARITY_THRESHOLD || "0.45");

/** Get maximum number of results after reranking */
const getMaxResults = () => parseNumber(process.env.RAG_MAX_RESULTS, 4);

/** Get maximum chunks per document to prevent memory issues */
const getMaxChunks = () => parseNumber(process.env.RAG_MAX_CHUNKS, 200);

/** Check if debug logging is enabled */
const shouldLogDebug = () => process.env.RAG_DEBUG === "true";

/**
 * Log debug information if RAG_DEBUG=true
 * @param {...any} args - Arguments to log
 */
const debugLog = (...args) => {
  if (shouldLogDebug()) {
    console.log("[RAG]", ...args);
  }
};

/**
 * Generate SHA-256 hash of normalized text for deduplication
 * @param {string} text - Text to hash
 * @returns {string} Hex-encoded hash
 */
const buildChunkHash = (text) =>
  crypto.createHash("sha256").update(text.trim().toLowerCase()).digest("hex");

// ============================================================================
// Document Indexing
// ============================================================================

/**
 * Index a document for RAG retrieval
 * 
 * Pipeline:
 * 1. Categorize document (Rental, Labor, Contract, etc.)
 * 2. Split text into overlapping chunks
 * 3. Generate embeddings for each chunk (Gemini)
 * 4. Store in ChromaDB with metadata
 * 
 * @param {Object} params - Indexing parameters
 * @param {string} params.documentId - Unique document identifier
 * @param {string} params.userId - User who owns the document
 * @param {string} params.text - Extracted document text
 * @param {string} params.filename - Original filename
 * @returns {Promise<boolean>} True if indexed successfully, false otherwise
 * 
 * @example
 * const success = await indexDocument({
 *   documentId: 'doc_123',
 *   userId: 'user_456',
 *   text: 'This is a rental agreement...',
 *   filename: 'rental_agreement.pdf'
 * });
 */
const indexDocument = async ({ documentId, userId, text, filename }) => {
  // Skip if ChromaDB is not configured
  if (!process.env.CHROMA_URL) {
    debugLog("ChromaDB not configured, skipping indexing");
    return false;
  }
  
  // Validate input
  if (!text) {
    debugLog("No text provided for indexing");
    return false;
  }

  // Step 1: Categorize document for better retrieval
  const category = categorizeDocument(filename, text);
  
  // Step 2: Split text into chunks with overlap
  const chunks = await splitText(text, getChunkOptions());
  if (!chunks.length) {
    debugLog("No chunks generated from text");
    return false;
  }

  // Step 3: Limit chunks to prevent memory issues
  const limitedChunks = chunks.slice(0, getMaxChunks());
  
  // Step 4: Generate embeddings for all chunks (batch processing)
  const embeddings = await embedTexts(limitedChunks);
  
  // Step 5: Create unique IDs for each chunk
  const ids = limitedChunks.map((_, index) => `${documentId}_${index}_${crypto.randomUUID()}`);
  
  // Step 6: Build metadata for each chunk
  const metadatas = limitedChunks.map((chunk, index) => ({
    documentId,
    userId,
    filename: filename || "",
    chunkIndex: index,
    chunkLength: chunk.length,
    chunkHash: buildChunkHash(chunk), // For deduplication
    category,
  }));

  // Step 7: Store in ChromaDB
  await addDocuments({ ids, embeddings, documents: limitedChunks, metadatas });
  
  debugLog("Indexed document", {
    documentId,
    filename,
    category,
    chunks: limitedChunks.length,
  });
  
  return true;
};

// ============================================================================
// Context Retrieval
// ============================================================================

/**
 * Retrieve relevant context for a user query using RAG
 * 
 * Pipeline:
 * 1. Preprocess query (intent detection, keyword extraction)
 * 2. Generate query embedding
 * 3. Vector similarity search in ChromaDB
 * 4. Rerank results (category boost, keyword matching)
 * 5. Filter by similarity threshold
 * 6. Return top-k chunks with source attribution
 * 
 * @param {Object} params - Retrieval parameters
 * @param {string} params.query - User's question
 * @param {string} params.userId - User ID for filtering documents
 * @param {number} [params.limit] - Optional limit for results
 * @returns {Promise<Object>} { context: string, sources: Array, debug?: Object }
 * 
 * @example
 * const { context, sources } = await getRelevantContext({
 *   query: 'What are my tenant rights?',
 *   userId: 'user_456'
 * });
 * // context: "According to Ethiopian law..."
 * // sources: [{ documentId, filename, relevanceScore, ... }]
 */
const getRelevantContext = async ({ query, userId, limit }) => {
  // Skip if ChromaDB is not configured
  if (!process.env.CHROMA_URL) {
    debugLog("ChromaDB not configured, returning empty context");
    return { context: "", sources: [] };
  }

  // Step 1: Preprocess query to detect intent and extract keywords
  const queryMeta = preprocessQuery(query);
  
  // Step 2: Enhance query with predicted category for better retrieval
  const queryText = queryMeta.predictedCategory !== "General"
    ? `${queryMeta.predictedCategory} ${queryMeta.normalizedQuery}`
    : queryMeta.normalizedQuery || query;

  // Step 3: Generate embedding for the query
  const embedding = await embedText(queryText);
  const retrievalK = getRetrieveK(limit);
  const include = ["documents", "metadatas", "distances"];

  // Step 4: Build filters for vector search
  const baseFilter = { userId }; // Always filter by user
  const categoryFilter =
    queryMeta.predictedCategory && queryMeta.predictedCategory !== "General"
      ? { ...baseFilter, category: queryMeta.predictedCategory }
      : baseFilter;

  // Step 5: First attempt - search with category filter
  let result = await queryDocuments({
    embedding,
    where: categoryFilter,
    nResults: retrievalK,
    include,
  });

  const retrievedCount = (result.documents && result.documents[0] && result.documents[0].length) || 0;

  // Step 6: Fallback - if too few results, retry without category filter
  if (retrievedCount < Math.max(3, getTopK(limit))) {
    debugLog("Insufficient results with category filter, retrying without category");
    result = await queryDocuments({
      embedding,
      where: baseFilter,
      nResults: retrievalK,
      include,
    });
  }

  // Step 7: Rerank and filter results
  const reranked = processAndRerankChunks(result, queryMeta, {
    similarityThreshold: getSimilarityThreshold(),
    maxResults: getMaxResults(),
    maxCharLength: getMaxContextChars(),
  });

  // Step 8: Log debug information
  debugLog("Query", {
    query,
    predictedCategory: queryMeta.predictedCategory,
    keywords: queryMeta.keywords?.slice(0, 6),
    retrievalK,
    retrievedCount: (result.documents && result.documents[0] && result.documents[0].length) || 0,
    selectedCount: reranked.selectedCount,
    threshold: getSimilarityThreshold(),
  });

  // Step 9: Return context and sources
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
