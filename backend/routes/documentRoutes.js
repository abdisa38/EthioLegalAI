const express = require("express");
const { uploadDocument, listDocuments, deleteDocument } = require("../controllers/documentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");
const { uploadLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(requireAuth);
router.post("/upload", uploadLimiter, upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

module.exports = router;
