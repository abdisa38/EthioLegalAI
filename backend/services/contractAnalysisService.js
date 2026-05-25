const { GoogleGenerativeAI } = require("@google/generative-ai");
const { cleanText } = require("../utils/textCleaner");
const { buildContractAnalysisPrompt } = require("../ai/promptManager");

const DEFAULT_MODEL_FALLBACKS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
].filter(Boolean);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeSeverity = (value) => {
  const lowered = String(value || "").toLowerCase();
  if (["high", "medium", "low"].includes(lowered)) return lowered;
  if (["critical", "severe"].includes(lowered)) return "high";
  if (["moderate"].includes(lowered)) return "medium";
  return "low";
};

const parseJsonResponse = (text) => {
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini response did not include JSON");
  }
  const jsonText = text.slice(start, end + 1);
  return JSON.parse(jsonText);
};

const normalizeAnalysis = (analysis, { filename, documentId }) => {
  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const risks = safeArray(analysis.risks).map((risk, index) => ({
    id: Number.isFinite(risk?.id) ? Number(risk.id) : index + 1,
    severity: normalizeSeverity(risk?.severity),
    clause: String(risk?.clause || "").trim(),
    explanation: String(risk?.explanation || "").trim(),
    article: String(risk?.article || "General guidance").trim(),
    safer: risk?.safer ? String(risk.safer).trim() : null,
    confidence: clamp(toNumber(risk?.confidence, 80), 0, 100),
  }));

  const riskScore = clamp(
    toNumber(analysis.riskScore, 0) || Math.round(
      risks.length
        ? risks.reduce((acc, item) => acc + (item.severity === "high" ? 85 : item.severity === "medium" ? 55 : 25), 0) / risks.length
        : 0
    ),
    0,
    100
  );

  return {
    documentId,
    fileName: filename || "",
    docType: String(analysis.docType || "Legal Contract").trim(),
    summary: String(analysis.summary || "Summary not available.").trim(),
    riskScore,
    aiConfidence: clamp(toNumber(analysis.aiConfidence, 90), 0, 100),
    warnings: safeArray(analysis.warnings).map((item) => String(item).trim()).filter(Boolean),
    suggestedActions: safeArray(analysis.suggestedActions).map((item) => String(item).trim()).filter(Boolean),
    keyFacts: safeArray(analysis.keyFacts).map((fact) => ({
      label: String(fact?.label || "").trim(),
      value: String(fact?.value || "").trim(),
      risk: Boolean(fact?.risk),
    })).filter((fact) => fact.label || fact.value),
    risks,
    timeline: safeArray(analysis.timeline).map((event) => ({
      date: String(event?.date || "").trim(),
      label: String(event?.label || "").trim(),
      type: String(event?.type || "other").trim(),
      urgent: Boolean(event?.urgent),
    })).filter((event) => event.label || event.date),
    sideBySide: safeArray(analysis.sideBySide).map((pair) => ({
      original: String(pair?.original || "").trim(),
      simplified: String(pair?.simplified || "").trim(),
      risk: normalizeSeverity(pair?.risk),
    })).filter((pair) => pair.original || pair.simplified),
    riskBreakdown: safeArray(analysis.riskBreakdown).map((item) => ({
      subject: String(item?.subject || "").trim(),
      score: clamp(toNumber(item?.score, 0), 0, 100),
    })).filter((item) => item.subject),
    financialRisks: safeArray(analysis.financialRisks).map((item) => ({
      label: String(item?.label || "").trim(),
      value: String(item?.value || "").trim(),
      note: String(item?.note || "").trim(),
      risk: Boolean(item?.risk),
    })).filter((item) => item.label || item.value),
    generatedAt: new Date(),
  };
};

const generateContractAnalysis = async ({ text, filename, language, documentId }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const cleaned = cleanText(text);
  const trimmed = cleaned.length > 14000 ? cleaned.slice(0, 14000) : cleaned;
  const prompt = buildContractAnalysisPrompt({ text: trimmed, filename, language });
  const client = new GoogleGenerativeAI(apiKey);

  let lastError;
  for (const modelName of DEFAULT_MODEL_FALLBACKS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.2,
        },
      });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const raw = parseJsonResponse(responseText);
      return normalizeAnalysis(raw, { filename, documentId });
    } catch (error) {
      const message = error?.message || String(error);
      lastError = error;
      if (!message.includes("404")) {
        break;
      }
    }
  }

  throw lastError || new Error("Gemini analysis failed");
};

module.exports = {
  generateContractAnalysis,
};
