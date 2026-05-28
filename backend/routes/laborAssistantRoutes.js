const express = require("express");
const { askLaborAssistant } = require("../controllers/laborAssistantController");
const { requireAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { askSchema } = require("../validators/assistantSchemas");
const { aiLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.use(requireAuth);
router.post("/ask", aiLimiter, validate(askSchema), askLaborAssistant);

module.exports = router;
