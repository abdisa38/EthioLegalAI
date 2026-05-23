const express = require("express");
const { chat, listModels } = require("../controllers/aiController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat", requireAuth, chat);
router.get("/models", requireAuth, listModels);

module.exports = router;
