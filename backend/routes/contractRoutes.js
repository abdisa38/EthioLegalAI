const express = require("express");
const { analyzeContract, getContractAnalysis } = require("../controllers/contractController");
const { requireAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { analyzeSchema, getSchema } = require("../validators/contractSchemas");

const router = express.Router();

router.use(requireAuth);
router.post("/analyze", validate(analyzeSchema), analyzeContract);
router.get("/:id", validate(getSchema), getContractAnalysis);

module.exports = router;
