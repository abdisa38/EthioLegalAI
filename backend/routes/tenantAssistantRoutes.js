const express = require("express");
const { askTenantAssistant } = require("../controllers/tenantAssistantController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/ask", askTenantAssistant);

module.exports = router;
