const express = require("express");
const { chat, simplify, listModels } = require("../controllers/aiController");
const { requireAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { chatSchema, simplifySchema } = require("../validators/aiSchemas");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/chat", requireAuth, aiLimiter, validate(chatSchema), chat);
router.post("/simplify", requireAuth, aiLimiter, validate(simplifySchema), simplify);
router.get("/models", requireAuth, listModels);

module.exports = router;
