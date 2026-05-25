/**
 * Query Intent Preprocessor Service for RAG Search
 */

const STOP_WORDS = new Set([
  "what", "how", "why", "when", "where", "who", "which", "whom", "whose",
  "does", "do", "did", "have", "has", "had", "been", "is", "am", "are", "was", "were",
  "with", "from", "your", "my", "our", "their", "this", "that", "these", "those",
  "they", "will", "would", "should", "could", "about", "above", "below", "after",
  "before", "then", "there", "here", "each", "both", "some", "any", "than", "then",
  "legal", "law", "ethiopia", "ethiopian", "rights", "rule", "code", "article",
  "የኢትዮጵያ", "ሕግ", "ምንድን", "ነው", "እንዴት", "ምን"
]);

const RENTAL_TRIGGERS = ["evict", "rent", "tenant", "landlord", "lease", "housing", "eviction", "deposit", "woreda", "አከራይ", "ተከራይ", "ኪራይ", "ቤት"];
const LABOR_TRIGGERS = ["employ", "labor", "salary", "severance", "workplace", "wages", "overtime", "employee", "employer", "terminate", "compensation", "ሠራተኛ", "አሠሪ", "ደመወዝ", "ሥራ"];
const NOTICE_TRIGGERS = ["notice", "warning", "default", "demand", "court", "ማስጠንቀቂያ", "ክስ"];
const CONTRACT_TRIGGERS = ["contract", "agreement", "clause", "terms", "sign", "ውል", "ስምምነት"];

/**
 * Preprocesses a query to extract clean keywords and predict the legal domain/category.
 * @param {string} query - The raw user input query.
 * @returns {object} Cleaned query metadata.
 */
const preprocessQuery = (query = "") => {
  if (!query) {
    return {
      normalizedQuery: "",
      keywords: [],
      predictedCategory: "General"
    };
  }

  const cleaned = query.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const normalizedQuery = cleaned.toLowerCase();

  // Extract clean keywords (filter stopwords)
  const words = normalizedQuery.split(/\s+/);
  const keywords = words.filter(word => {
    return word.length > 2 && !STOP_WORDS.has(word);
  });

  // Predict category
  let predictedCategory = "General";
  const matches = (triggers) => triggers.some(trig => normalizedQuery.includes(trig.toLowerCase()));

  if (matches(RENTAL_TRIGGERS)) {
    predictedCategory = "Rental";
  } else if (matches(LABOR_TRIGGERS)) {
    predictedCategory = "Labor";
  } else if (matches(NOTICE_TRIGGERS)) {
    predictedCategory = "Notice";
  } else if (matches(CONTRACT_TRIGGERS)) {
    predictedCategory = "Contract";
  }

  return {
    normalizedQuery,
    keywords,
    predictedCategory
  };
};

module.exports = {
  preprocessQuery,
};
