const express = require("express");
const { uploadDocument, listDocuments, deleteDocument } = require("../controllers/documentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.use(requireAuth);
router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

module.exports = router;
