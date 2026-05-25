const express = require("express");
const { analyzeContract, getContractAnalysis } = require("../controllers/contractController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.post("/analyze", analyzeContract);
router.get("/:id", getContractAnalysis);

module.exports = router;
