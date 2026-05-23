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

const splitText = async (value, options = {}) => {
  const text = cleanText(value);
  if (!text) return [];

  const chunkSize = options.chunkSize || 1000;
  const chunkOverlap = options.chunkOverlap || 150;

  try {
    const module = await import("langchain/text_splitter");
    const splitter = new module.RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
    });
    return await splitter.splitText(text);
  } catch (error) {
    return splitTextFallback(text, chunkSize, chunkOverlap);
  }
};

module.exports = {
  splitText,
};
