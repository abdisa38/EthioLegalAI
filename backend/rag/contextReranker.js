/**
 * Post-retrieval reranking, similarity filtering, deduplication, and context compression engine
 */

const crypto = require("crypto");

/**
 * Normalizes L2 distance to a 0-1 similarity score.
 * Lower distance means higher similarity.
 */
const calculateSimilarity = (distance) => {
  if (typeof distance !== "number") return 0.5;
  // Normalized L2 similarity
  return 1 / (1 + distance);
};

/**
 * Processes, filters, deduplicates, and reranks retrieved chunks.
 * @param {object} rawResults - Chroma query result object.
 * @param {object} queryMeta - Preprocessed query metadata.
 * @param {object} options - Options (similarityThreshold, maxContextLength).
 * @returns {object} Cleaned context string and structured source logs.
 */
const processAndRerankChunks = (rawResults, queryMeta, options = {}) => {
  const threshold = options.similarityThreshold || 0.45;
  const maxResults = options.maxResults || 4;
  const maxCharLength = options.maxCharLength || 3500;

  const rawDocs = (rawResults.documents && rawResults.documents[0]) || [];
  const rawMetas = (rawResults.metadatas && rawResults.metadatas[0]) || [];
  const rawDistances = (rawResults.distances && rawResults.distances[0]) || [];

  const processed = [];
  const seenTexts = new Set();

  for (let i = 0; i < rawDocs.length; i++) {
    const text = rawDocs[i];
    const meta = rawMetas[i] || {};
    const distance = rawDistances[i];

    // Deduplication check
    const normalizedText = text.trim().toLowerCase().replace(/\s+/g, " ");
    if (seenTexts.has(normalizedText)) {
      continue;
    }
    seenTexts.add(normalizedText);

    // Similarity score check
    const similarity = calculateSimilarity(distance);
    if (similarity < threshold) {
      continue;
    }

    // Scoring & Boosts calculation
    let score = similarity;

    // 1. Legal Category Match Boost
    if (meta.category && queryMeta.predictedCategory && meta.category === queryMeta.predictedCategory) {
      score += 0.15; // Boost score if category matches predicted intent
    }

    // 2. Keyword Match Boost
    let matchCount = 0;
    if (queryMeta.keywords && queryMeta.keywords.length > 0) {
      for (const keyword of queryMeta.keywords) {
        if (normalizedText.includes(keyword)) {
          matchCount++;
        }
      }
      score += Math.min(matchCount * 0.02, 0.1); // Max keyword boost of 0.1
    }

    processed.push({
      text,
      meta,
      distance,
      originalSimilarity: similarity,
      finalScore: Math.min(score, 1.0),
      matchCount
    });
  }

  // Sort by finalScore descending
  processed.sort((a, b) => b.finalScore - a.finalScore);

  // Compress & construct final context
  const selected = [];
  let currentLength = 0;

  for (const item of processed) {
    if (selected.length >= maxResults) break;
    if (currentLength + item.text.length > maxCharLength) {
      // If we already have at least 1 high-quality chunk, don't exceed the token budget
      if (selected.length > 0) break;
    }

    selected.push(item);
    currentLength += item.text.length;
  }

  // Build final structured context string
  const context = selected
    .map((item, index) => {
      const label = item.meta.filename || item.meta.documentId || `Document Source`;
      const chunkInfo = typeof item.meta.chunkIndex === "number" ? ` (chunk ${item.meta.chunkIndex + 1})` : "";
      const scorePercentage = Math.round(item.originalSimilarity * 100);
      return `Source: ${label}${chunkInfo} [Similarity: ${scorePercentage}%]\n${item.text}`.trim();
    })
    .join("\n\n---\n\n");

  // Format sources array
  const sources = selected.map((item) => ({
    documentId: item.meta.documentId,
    filename: item.meta.filename,
    chunkIndex: item.meta.chunkIndex,
    distance: item.distance,
    similarity: item.originalSimilarity,
    category: item.meta.category || "General"
  }));

  return {
    context,
    sources,
    originalCount: rawDocs.length,
    selectedCount: selected.length,
    skippedCount: rawDocs.length - selected.length
  };
};

module.exports = {
  processAndRerankChunks,
};
