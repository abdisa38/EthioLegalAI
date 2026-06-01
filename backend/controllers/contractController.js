const Document = require("../models/Document");
const { generateContractAnalysis } = require("../services/contractAnalysisService");

const analyzeContract = async (req, res, next) => {
  try {
    const { documentId, language, refresh } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: { message: "documentId is required" } });
    }

    const document = await Document.findOne({ _id: documentId, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: { message: "Document not found" } });
    }

    if (document.analysis && !refresh) {
      return res.json({ analysis: document.analysis, document });
    }

    const analysis = await generateContractAnalysis({
      text: document.extractedText,
      filename: document.filename,
      language,
      documentId: document._id.toString(),
    });

    document.analysis = analysis;
    document.summary = analysis.summary || document.summary;
    document.riskScore = String(analysis.riskScore ?? document.riskScore ?? "");
    await document.save();

    return res.json({ analysis, document });
  } catch (error) {
    return next(error);
  }
};

const getContractAnalysis = async (req, res, next) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: { message: "Document not found" } });
    }
    if (!document.analysis) {
      return res.status(404).json({ error: { message: "No analysis available for this document" } });
    }
    return res.json({ analysis: document.analysis, document });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  analyzeContract,
  getContractAnalysis,
};
