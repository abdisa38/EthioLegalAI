const BASE_IDENTITY = `You are EthioLegal AI, an Ethiopian legal educational assistant.
You provide general legal information only, not legal advice.
You must never claim to be a lawyer or provide official legal representation.`;

const LANGUAGE_PROFILES = {
  English: {
    name: "English",
    sections: {
      summary: "Summary",
      explanation: "Explanation",
      notes: "Important Notes",
      risks: "Risks",
      recommendations: "Recommendations",
    },
    disclaimer:
      "⚠️ Educational information only — not official legal advice. Consult a licensed Ethiopian attorney for legal representation.",
    defaults: {
      notes: "This guidance is general and may change with your exact contract or local practice.",
      risks: "Missing facts or deadlines can change your legal options.",
      recommendations: "Share the exact document terms and dates for a more accurate answer.",
    },
  },
  Amharic: {
    name: "Amharic",
    sections: {
      summary: "ማጠቃለያ",
      explanation: "ማብራሪያ",
      notes: "አስፈላጊ ማስታወሻዎች",
      risks: "አደጋዎች",
      recommendations: "ምክሮች",
    },
    disclaimer:
      "⚠️ ይህ መረጃ ትምህርታዊ ብቻ ነው፤ የሕግ ምክር አይደለም። ለየተለዩ ጉዳዮች በተፈቃደ ኢትዮጵያዊ ጠበቃ ያግኙ።",
    defaults: {
      notes: "መረጃው አጠቃላይ ነው፤ የውል ዝርዝር ነገር ሊለውጠው ይችላል።",
      risks: "ቀናት ወይም ሁኔታዎች ባልተገለፁ ሲሆኑ መፍትሄዎች ሊለውጡ ይችላሉ።",
      recommendations: "የውሉን አይነት እና ዋና ቀናት ግልጽ ያድርጉ።",
    },
  },
  "Afaan Oromo": {
    name: "Afaan Oromo",
    sections: {
      summary: "Cuunfaa",
      explanation: "Ibsa",
      notes: "Yaadachiisa Muhimmaa",
      risks: "Balaa",
      recommendations: "Gorsa",
    },
    disclaimer:
      "⚠️ Odeeffannoon kun barnoota qofaaf; gorsa seeraa miti. Haala kee irratti abbaa seeraa hayyama qabu waliin dubbadhu.",
    defaults: {
      notes: "Odeeffannoon kun waliigala; haala sirrii irratti ni jijjiiramti.",
      risks: "Odeeffannoo dhabuun filannoo seeraa jijjiiruu danda'a.",
      recommendations: "Walii galtee fi yeroo barbaachisaa ifa godhi.",
    },
  },
};

const normalizeLanguage = (language) => {
  if (!language) return "English";
  if (language.toLowerCase().includes("amharic")) return "Amharic";
  if (language.toLowerCase().includes("afaan")) return "Afaan Oromo";
  return "English";
};

const getLanguageProfile = (language) => LANGUAGE_PROFILES[normalizeLanguage(language)] || LANGUAGE_PROFILES.English;

const buildStructuredResponseInstructions = (language) => {
  const profile = getLanguageProfile(language);
  const { summary, explanation, notes, risks, recommendations } = profile.sections;
  return `
Format your response with these sections using markdown headings:
## ${summary}
## ${explanation}
## ${notes}
## ${risks}
## ${recommendations}

Rules:
- Use short sentences and simple words suitable for ordinary citizens.
- Ask 1-3 clarifying questions if key facts are missing.
- Highlight exact legal clause text by wrapping it in ==double equals==.
- If you are unsure, say so and avoid making up citations.
- Always include the educational disclaimer at the end.
`.trim();
};

const buildContextBlock = (context, sources = []) => {
  if (!context) {
    return "No verified legal context was provided. Do not invent citations.";
  }

  const sourceLines = sources
    .map((source, index) => {
      const name = source?.filename || source?.documentId || `Source ${index + 1}`;
      const chunk = Number.isFinite(source?.chunkIndex) ? ` (chunk ${source.chunkIndex + 1})` : "";
      return `- ${name}${chunk}`;
    })
    .join("\n");

  return `Verified context (prioritize this over general knowledge):
${context}

Sources:
${sourceLines || "- Uploaded document"}`.trim();
};

const buildChatPrompt = ({ message, language, context, sources }) => {
  const profile = getLanguageProfile(language);
  return `
${BASE_IDENTITY}
Respond in ${profile.name}.
${buildStructuredResponseInstructions(profile.name)}

${buildContextBlock(context, sources)}

User question: ${message}
`.trim();
};

const buildTenantPrompt = ({ message, language }) => {
  const profile = getLanguageProfile(language);
  return `
${BASE_IDENTITY}
You are a tenant-rights assistant for Ethiopia.
Respond in ${profile.name}.
Focus on eviction notice, deposits, repairs, rent increases, and landlord entry.
${buildStructuredResponseInstructions(profile.name)}

User question: ${message}
`.trim();
};

const buildLaborPrompt = ({ message, language }) => {
  const profile = getLanguageProfile(language);
  return `
${BASE_IDENTITY}
You are an Ethiopian labor law assistant.
Respond in ${profile.name}.
Focus on wages, overtime, termination, severance, leave, and workplace safety.
${buildStructuredResponseInstructions(profile.name)}

User question: ${message}
`.trim();
};

const buildContractAnalysisPrompt = ({ text, filename, language }) => {
  const profile = getLanguageProfile(language);
  return `
${BASE_IDENTITY}
You are analyzing an Ethiopian legal contract for risk. Respond in ${profile.name}.
Return JSON only, no markdown or extra text.

Required JSON shape:
{
  "docType": "string",
  "summary": "string",
  "riskScore": 0,
  "aiConfidence": 0,
  "warnings": ["string"],
  "suggestedActions": ["string"],
  "keyFacts": [{ "label": "string", "value": "string", "risk": true }],
  "risks": [
    {
      "id": 1,
      "severity": "high|medium|low",
      "clause": "string",
      "explanation": "string",
      "article": "string",
      "safer": "string or null",
      "confidence": 0
    }
  ],
  "timeline": [{ "date": "string", "label": "string", "type": "start|payment|milestone|deadline|end|other", "urgent": true }],
  "sideBySide": [{ "original": "string", "simplified": "string", "risk": "high|medium|low" }],
  "riskBreakdown": [{ "subject": "string", "score": 0 }],
  "financialRisks": [{ "label": "string", "value": "string", "note": "string", "risk": true }]
}

Rules:
- Be conservative: do not invent legal citations. If unsure, use "General guidance" for article.
- Summaries must be concise (3-5 sentences).
- riskScore is 0-100 where higher means more risk to the user.
- aiConfidence is 0-100.
- Include 4-8 risks max.
- Include 3-6 keyFacts and 3-6 suggestedActions.
- Include a warning that this is educational information, not legal advice.

File name: ${filename || "Unknown"}
Contract text:
${text}
`.trim();
};

const buildDocumentSimplificationPrompt = ({ text, language }) => {
  const profile = getLanguageProfile(language);
  return `
${BASE_IDENTITY}
You simplify legal documents for ordinary citizens.
Respond in ${profile.name}.
${buildStructuredResponseInstructions(profile.name)}

Document text:
${text}
`.trim();
};

const ensureStructuredResponse = (answer, language) => {
  if (!answer) return answer;
  const profile = getLanguageProfile(language);
  const { summary, explanation, notes, risks, recommendations } = profile.sections;
  const lower = answer.toLowerCase();

  const hasSummary = lower.includes(`## ${summary.toLowerCase()}`);
  if (hasSummary) {
    return ensureDisclaimer(answer, language);
  }

  const paragraphs = answer.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const summaryText = paragraphs.shift() || answer.trim();
  const explanationText = paragraphs.join("\n\n") || summaryText;
  const fallbackNotes = profile.defaults.notes;
  const fallbackRisks = profile.defaults.risks;
  const fallbackRecs = profile.defaults.recommendations;

  const structured = [
    `## ${summary}`,
    summaryText,
    `## ${explanation}`,
    explanationText,
    `## ${notes}`,
    `- ${fallbackNotes}`,
    `## ${risks}`,
    `- ${fallbackRisks}`,
    `## ${recommendations}`,
    `- ${fallbackRecs}`,
  ].join("\n\n");

  return ensureDisclaimer(structured, language);
};

const ensureDisclaimer = (answer, language) => {
  const profile = getLanguageProfile(language);
  if (answer.includes(profile.disclaimer)) {
    return answer;
  }
  return `${answer}\n\n${profile.disclaimer}`.trim();
};

module.exports = {
  getLanguageProfile,
  buildChatPrompt,
  buildTenantPrompt,
  buildLaborPrompt,
  buildContractAnalysisPrompt,
  buildDocumentSimplificationPrompt,
  ensureStructuredResponse,
  ensureDisclaimer,
};
