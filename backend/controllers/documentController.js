const streamifier = require("streamifier");
const pdfParse = require("pdf-parse");
const Document = require("../models/Document");
const cloudinary = require("../config/cloudinary");
const { cleanText } = require("../utils/textCleaner");
const { indexDocument } = require("../rag/ragService");

const uploadToCloudinary = (file, resourceType) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ethiolegalai",
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });

const extractText = async (file) => {
  if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
    try {
      const parsed = await pdfParse(file.buffer);
      return cleanText(parsed.text || "");
    } catch (error) {
      return "";
    }
  }
  return "";
};

const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: "File is required" } });
    }

    const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "raw";
    const uploadResult = await uploadToCloudinary(req.file, resourceType);
    const extractedText = await extractText(req.file);
    const textLength = extractedText.length;

    const document = await Document.create({
      userId: req.user._id,
      filename: req.file.originalname,
      cloudinaryUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      cloudinaryResourceType: resourceType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      extractedText,
      textLength,
      summary: "",
      riskScore: "",
    });

    if (extractedText) {
      try {
        await indexDocument({
          documentId: document._id.toString(),
          userId: req.user._id.toString(),
          text: extractedText,
        });
      } catch (error) {
        console.warn("RAG indexing failed:", error?.message || error);
      }
    }

    return res.status(201).json({ document });
  } catch (error) {
    return next(error);
  }
};

const listDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ documents });
  } catch (error) {
    return next(error);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!document) {
      return res.status(404).json({ error: { message: "Document not found" } });
    }

    if (document.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
        resource_type: document.cloudinaryResourceType || "raw",
      });
    }

    return res.json({ message: "Document deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadDocument,
  listDocuments,
  deleteDocument,
};
