const { GoogleGenerativeAI } = require("@google/generative-ai");
const { cleanText } = require("../utils/textCleaner");
const { buildContractAnalysisPrompt, getLanguageProfile } = require("../ai/promptManager");

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

const splitSentences = (text) =>
  String(text || '')
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

const detectDocumentType = (filename = '', text = '') => {
  const source = `${filename} ${text}`.toLowerCase();
  if (source.includes('rental') || source.includes('lease') || source.includes('tenant')) return 'Residential Lease Agreement';
  if (source.includes('employment') || source.includes('labor') || source.includes('worker')) return 'Employment Contract';
  if (source.includes('service agreement') || source.includes('services')) return 'Service Agreement';
  if (source.includes('sale') || source.includes('purchase')) return 'Sale Agreement';
  return 'Legal Contract';
};

const buildFallbackAnalysis = ({ text, filename, language }) => {
  const cleaned = cleanText(text || '');
  const sentences = splitSentences(cleaned);
  const excerpt = sentences.slice(0, 3).join(' ') || cleaned.slice(0, 280) || 'The uploaded document contains too little readable text for a detailed analysis.';
  const docType = detectDocumentType(filename, cleaned);
  const disclaimer = getLanguageProfile(language).disclaimer;
  const lower = cleaned.toLowerCase();

  const matches = [
    { severity: 'high', keyword: 'termination', clause: /termination[^.\n]{0,120}[.\n]/i },
    { severity: 'high', keyword: 'eviction', clause: /eviction[^.\n]{0,120}[.\n]/i },
    { severity: 'high', keyword: 'penalty', clause: /penalt(y|ies)[^.\n]{0,120}[.\n]/i },
    { severity: 'medium', keyword: 'deposit', clause: /deposit[^.\n]{0,120}[.\n]/i },
    { severity: 'medium', keyword: 'fee', clause: /fee[^.\n]{0,120}[.\n]/i },
    { severity: 'medium', keyword: 'liability', clause: /liabilit(y|ies)[^.\n]{0,120}[.\n]/i },
    { severity: 'low', keyword: 'payment', clause: /payment[^.\n]{0,120}[.\n]/i },
    { severity: 'low', keyword: 'notice', clause: /notice[^.\n]{0,120}[.\n]/i },
  ];

  const risks = [];
  for (const item of matches) {
    const sentence = sentences.find((entry) => entry.toLowerCase().includes(item.keyword));
    if (!sentence) continue;
    risks.push({
      id: risks.length + 1,
      severity: item.severity,
      clause: sentence,
      explanation: `This clause mentions ${item.keyword}. Review the exact wording carefully against your agreement and Ethiopian law before signing or relying on it.`,
      article: 'General guidance',
      safer: item.severity === 'high' ? 'Rewrite this clause to be more specific, balanced, and legally reviewed before signing.' : null,
      confidence: item.severity === 'high' ? 78 : item.severity === 'medium' ? 70 : 62,
    });
    if (risks.length >= 4) break;
  }

  const riskScore = Math.min(100, Math.max(10, risks.length ? risks.reduce((sum, risk) => sum + (risk.severity === 'high' ? 28 : risk.severity === 'medium' ? 18 : 10), 12) : 22));

  const sideBySide = sentences.slice(0, 4).map((sentence) => ({
    original: sentence,
    simplified: sentence,
    risk: sentence.toLowerCase().includes('termination') || sentence.toLowerCase().includes('eviction') ? 'high' : sentence.toLowerCase().includes('deposit') || sentence.toLowerCase().includes('fee') ? 'medium' : 'low',
  }));

  return normalizeAnalysis({
    docType,
    summary: `${excerpt} ${cleaned.length < 180 ? 'The document is very short or partially unreadable, so this is a conservative analysis based on the visible text only.' : ''}`.trim(),
    riskScore,
    aiConfidence: cleaned.length < 180 ? 58 : 72,
    warnings: [
      disclaimer,
      'This analysis is based only on the extracted document text and does not replace a licensed lawyer review.',
    ],
    suggestedActions: risks.length
      ? [
          'Review every clause marked as higher risk before signing.',
          'Compare notice, payment, and termination terms against Ethiopian legal requirements.',
          'Ask for a revised draft if any clause looks one-sided or unclear.',
        ]
      : [
          'Upload a clearer copy if this file was scanned poorly or only partially extracted.',
          'Check that the uploaded file includes the full agreement text.',
          'Ask a licensed Ethiopian attorney to review the final document before signing.',
        ],
    keyFacts: [
      { label: 'Document Type', value: docType, risk: false },
      { label: 'Text Length', value: `${cleaned.length} characters`, risk: cleaned.length < 180 },
      { label: 'Detected Clauses', value: `${risks.length}`, risk: risks.length > 0 },
    ],
    risks,
    timeline: [],
    sideBySide,
    riskBreakdown: [
      { subject: 'Payment', score: lower.includes('payment') ? 65 : 20 },
      { subject: 'Termination', score: lower.includes('termination') || lower.includes('eviction') ? 75 : 20 },
      { subject: 'Liability', score: lower.includes('liability') ? 60 : 20 },
    ],
    financialRisks: [],
  }, { filename, documentId, language });
};

const normalizeAnalysis = (analysis, { filename, documentId, language }) => {
  const safeArray = (value) => (Array.isArray(value) ? value : []);
  const disclaimer = getLanguageProfile(language).disclaimer;

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

  const warnings = [
    ...safeArray(analysis.warnings).map((item) => String(item).trim()).filter(Boolean),
  ];
  if (disclaimer && !warnings.some((item) => item.includes(disclaimer))) {
    warnings.push(disclaimer);
  }

  return {
    documentId,
    fileName: filename || "",
    docType: String(analysis.docType || "Legal Contract").trim(),
    summary: String(analysis.summary || "Summary not available.").trim(),
    riskScore,
    aiConfidence: clamp(toNumber(analysis.aiConfidence, 90), 0, 100),
    warnings,
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
    return buildFallbackAnalysis({ text, filename, language });
  }

  const cleaned = cleanText(text);
  const trimmed = cleaned.length > 14000 ? cleaned.slice(0, 14000) : cleaned;
  const { systemInstruction, prompt } = buildContractAnalysisPrompt({ text: trimmed, filename, language });
  const client = new GoogleGenerativeAI(apiKey);

  let lastError;
  for (const modelName of DEFAULT_MODEL_FALLBACKS) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: {
          temperature: 0.2,
        },
      });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const raw = parseJsonResponse(responseText);
      return normalizeAnalysis(raw, { filename, documentId, language });
    } catch (error) {
      const message = error?.message || String(error);
      lastError = error;
      console.warn(`[contractAnalysis] Model ${modelName} failed: ${message}`);
    }
  }

  console.warn("[contractAnalysis] Falling back to local analysis", lastError?.message || lastError);
  return buildFallbackAnalysis({ text, filename, language });
};

module.exports = {
  generateContractAnalysis,
};
