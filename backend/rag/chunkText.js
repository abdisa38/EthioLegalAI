const { cleanText } = require("../utils/textCleaner");

const splitTextFallback = (text, chunkSize, overlap) => {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start < 0) start = 0;
    if (start >= text.length) break;
  }
  return chunks;
};

const normalizeChunk = (chunk) =>
  chunk
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const splitText = async (value, options = {}) => {
  const text = cleanText(value);
  if (!text) return [];

  const chunkSize = options.chunkSize || 1000;
  const chunkOverlap = options.chunkOverlap || 150;
  const minChunkSize = options.minChunkSize || 200;
  const separators = options.separators || ["\n\n", "\n", ". ", "? ", "! ", " "];

  try {
    const module = await import("langchain/text_splitter");
    const splitter = new module.RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators,
    });
    const chunks = await splitter.splitText(text);
    const seen = new Set();
    return chunks
      .map(normalizeChunk)
      .filter((chunk) => chunk.length >= minChunkSize)
      .filter((chunk) => {
        const key = chunk.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  } catch (error) {
    const chunks = splitTextFallback(text, chunkSize, chunkOverlap);
    const seen = new Set();
    return chunks
      .map(normalizeChunk)
      .filter((chunk) => chunk.length >= minChunkSize)
      .filter((chunk) => {
        const key = chunk.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }
};

module.exports = {
  splitText,
};
