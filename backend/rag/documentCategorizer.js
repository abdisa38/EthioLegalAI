/**
 * Legal Document Categorization Service
 */

const RENTAL_KEYWORDS = [
  "evict", "rent", "tenant", "landlord", "lease", "housing", "apartment", "dwelling",
  "አከራይ", "ተከራይ", "ኪራይ", "ቤት", "ኮንዶሚኒየም"
];

const LABOR_KEYWORDS = [
  "employ", "labor", "salary", "severance", "workplace", "wages", "overtime", "employee",
  "employer", "job", "recruitment", "dismissal", "termination", "ሠራተኛ", "አሠሪ", "ደመወዝ",
  "ቅጥር", "የሥራ ውል"
];

const NOTICE_KEYWORDS = [
  "notice", "warning", "default", "demand letter", "court order", "subpoena", "lawsuit",
  "eviction notice", "ማስጠንቀቂያ", "ማቋረጫ", "የክስ", "ፍርድ ቤት"
];

const CONTRACT_KEYWORDS = [
  "contract", "agreement", "clause", "signed", "memorandum", "mou", "terms", "ውል", "ስምምነት"
];

/**
 * Categorizes a document based on its filename and content text.
 * @param {string} filename - The name of the uploaded file.
 * @param {string} text - The extracted text content.
 * @returns {string} One of: "Rental", "Labor", "Notice", "Contract", "General".
 */
const categorizeDocument = (filename = "", text = "") => {
  const fileLower = filename.toLowerCase();
  const textLower = text.toLowerCase();

  // Helper to check match
  const matches = (keywords) => {
    return keywords.some(keyword => {
      const lowerKw = keyword.toLowerCase();
      return fileLower.includes(lowerKw) || textLower.includes(lowerKw);
    });
  };

  // Prioritize categorizations
  if (matches(RENTAL_KEYWORDS)) {
    return "Rental";
  }
  if (matches(LABOR_KEYWORDS)) {
    return "Labor";
  }
  if (matches(NOTICE_KEYWORDS)) {
    return "Notice";
  }
  if (matches(CONTRACT_KEYWORDS)) {
    return "Contract";
  }

  return "General";
};

module.exports = {
  categorizeDocument,
};
