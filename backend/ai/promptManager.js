/**
 * Centralized AI Prompt Compiler and Response Formatting Engine
 */

const { SYSTEM_RULES, LANGUAGE_PROFILES, TEMPLATES } = require("./promptTemplates");

const normalizeLanguage = (language) => {
  if (!language) return "English";
  const lower = language.toLowerCase();
  if (lower.includes("amharic")) return "Amharic";
  if (lower.includes("afaan") || lower.includes("oromo")) return "Afaan Oromo";
  return "English";
};

const getLanguageProfile = (language) => {
  const norm = normalizeLanguage(language);
  return LANGUAGE_PROFILES[norm] || LANGUAGE_PROFILES.English;
};

/**
 * Interpolates variables into a template string.
 */
const interpolate = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value || "");
  }
  return result;
};

/**
 * Builds a structured system prompt combining rules, language rules, and formatting directives.
 */
const getSystemInstruction = (language) => {
  const profile = getLanguageProfile(language);
  const { summary, explanation, notes, risks, recommendations } = profile.sections;

  const sectionRules = `
FORMATTING REQUIREMENTS:
You MUST structure your response using these exact markdown headers:
## ${summary}
[Provide a clear, brief 2-3 sentence overview of the issue]

## ${explanation}
[Provide a detailed, plain-language explanation of the legal situation, concepts, or rules. Highlight literal law codes or articles by wrapping them in double equals, e.g., ==Civil Code Art. 2975==]

## ${notes}
[Provide key details, local woreda practices, or assumptions]

## ${risks}
[Highlight potential legal risks, missing deadlines, or penalties]

## ${recommendations}
[Provide 2-3 actionable, citizen-friendly recommendations]
`.trim();

  return `
${SYSTEM_RULES}

${sectionRules}

LANGUAGE STYLE GUIDELINES (${profile.name}):
- You MUST respond in ${profile.name}.
- ${profile.styleInstructions}
`.trim();
};

/**
 * Compiles prompt for general RAG chat.
 */
const buildChatPrompt = ({ message, language, context, sources }) => {
  const profile = getLanguageProfile(language);
  const systemInstruction = getSystemInstruction(profile.name);

  let contextStr = "No verified legal context was provided. Do not invent citations.";
  if (context) {
    const sourceLines = (sources || [])
      .map((source, index) => {
        const name = source?.filename || source?.documentId || `Source ${index + 1}`;
        const chunk = typeof source?.chunkIndex === "number" ? ` (chunk ${source.chunkIndex + 1})` : "";
        return `- ${name}${chunk}`;
      })
      .join("\n");

    contextStr = `
Verified legal context:
${context}

Sources:
${sourceLines || "- Uploaded document"}
`.trim();
  }

  const prompt = interpolate(TEMPLATES.generalChat, {
    context: contextStr,
    message,
  });

  return { systemInstruction, prompt };
};

/**
 * Compiles prompt for Tenant Rights assistant.
 */
const buildTenantPrompt = ({ message, language }) => {
  const profile = getLanguageProfile(language);
  const systemInstruction = getSystemInstruction(profile.name);
  const prompt = interpolate(TEMPLATES.tenantRights, { message });

  return { systemInstruction, prompt };
};

/**
 * Compiles prompt for Labor Law assistant.
 */
const buildLaborPrompt = ({ message, language }) => {
  const profile = getLanguageProfile(language);
  const systemInstruction = getSystemInstruction(profile.name);
  const prompt = interpolate(TEMPLATES.laborPrompt || TEMPLATES.laborLaw, { message });

  return { systemInstruction, prompt };
};

/**
 * Compiles prompt for Contract Analysis.
 * Note: Contract analysis expects JSON output, so system instructions are tailored for JSON formatting.
 */
const buildContractAnalysisPrompt = ({ text, filename, language }) => {
  const profile = getLanguageProfile(language);

  const systemInstruction = `
You are an expert Ethiopian contract risk analyst.
You must output ONLY valid, parsable JSON matching the requested schema.
Do NOT include markdown formatting, code block ticks (\`\`\`json), or leading/trailing commentary.

SAFETY COMPLIANCE:
- Never claim to provide official legal counsel.
- Always include the mandatory educational disclaimer: "${profile.disclaimer}" inside the warnings array.
- Rely on verified laws where possible (e.g. Civil Code, Labor Proclamation, Housing Proclamations).
- Identify risks conservatively.
`.trim();

  const prompt = interpolate(TEMPLATES.contractAnalysis, {
    text,
    filename: filename || "Unknown Contract",
  });

  return { systemInstruction, prompt };
};

/**
 * Compiles prompt for Document Simplification.
 */
const buildDocumentSimplificationPrompt = ({ text, language }) => {
  const profile = getLanguageProfile(language);
  const systemInstruction = getSystemInstruction(profile.name);
  const prompt = interpolate(TEMPLATES.documentSimplification, { text });

  return { systemInstruction, prompt };
};

/**
 * Ensures that the generated text adheres to the structured sections and includes the disclaimer.
 */
const ensureStructuredResponse = (answer, language) => {
  if (!answer) return "";
  const profile = getLanguageProfile(language);
  const { summary, explanation, notes, risks, recommendations } = profile.sections;
  const lower = answer.toLowerCase();

  const hasSummary = lower.includes(`## ${summary.toLowerCase()}`);
  
  let structured = answer;
  if (!hasSummary) {
    // If structured headings are missing, split paragraphs and reconstruct them
    const paragraphs = answer.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const summaryText = paragraphs.shift() || "No summary available.";
    const explanationText = paragraphs.join("\n\n") || summaryText;
    const fallbackNotes = profile.defaults.notes;
    const fallbackRisks = profile.defaults.risks;
    const fallbackRecs = profile.defaults.recommendations;

    structured = [
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
  }

  return ensureDisclaimer(structured, language);
};

/**
 * Appends the educational disclaimer at the end of the text if not present.
 */
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
