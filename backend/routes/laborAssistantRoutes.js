const express = require("express");
const { askLaborAssistant } = require("../controllers/laborAssistantController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/ask", askLaborAssistant);

module.exports = router;
