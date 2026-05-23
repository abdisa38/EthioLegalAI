const express = require("express");
const healthController = require("../controllers/healthController");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.get("/health", healthController.check);
router.use("/auth", authRoutes);

module.exports = router;
