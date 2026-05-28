/**
 * Utility to calculate a realistic AI confidence score based on text analysis
 * and context usage.
 */

const UNCERTAINTY_INDICATORS = [
  // English
  "unsure",
  "not clear",
  "not specified",
  "do not have context",
  "cannot verify",
  "unavailable",
  "unknown",
  "insufficient details",
  "lacks details",
  "may vary",
  "depends on",
  "no direct mention",
  "not fully detailed",
  
  // Amharic
  "እርግጠኛ አይደለሁም",
  "አልተገለጸም",
  "አልተቻለም",
  "መረጃ የለም",
  "ሊለያይ ይችላል",
  "በግልጽ አልተቀመጠም",
  "አልተብራራም",
  "ግልጽ አይደለም",

  // Afaan Oromo
  "hin beekamu",
  "hin ibsamne",
  "qulqulluu miti",
  "jijjiiramuu danda'a",
  "ibsi hin jiru"
];

/**
 * Calculates a confidence score (0-100) for a given AI response.
 * @param {string} text - The AI generated response text.
 * @param {boolean} contextUsed - Whether RAG context was used.
 * @returns {number} The calculated confidence score.
 */
const calculateConfidence = (text, contextUsed) => {
  if (!text) return 50;

  // Base score
  let score = contextUsed ? 92 : 75;

  const lowerText = text.toLowerCase();

  // Scorer penalties
  let matchedCount = 0;
  for (const indicator of UNCERTAINTY_INDICATORS) {
    if (lowerText.includes(indicator.toLowerCase())) {
      matchedCount++;
    }
  }

  // Deduct 7 points per unique uncertainty matched
  score -= matchedCount * 7;

  // Additional fine-tuning based on length of response or citation indicators
  // If we have citations or legal section tags, we gain slightly higher confidence
  if (lowerText.includes("==civil code") || lowerText.includes("==proclamation") || lowerText.includes("==አዋጅ")) {
    score += 5;
  }

  // Ensure confidence is clamped between 40 and 98
  return Math.min(Math.max(Math.round(score), 40), 98);
};

module.exports = {
  calculateConfidence
};
