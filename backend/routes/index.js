const express = require("express");
const healthController = require("../controllers/healthController");
const authRoutes = require("./authRoutes");
const aiRoutes = require("./aiRoutes");
const documentRoutes = require("./documentRoutes");
const chatRoutes = require("./chatRoutes");
const contractRoutes = require("./contractRoutes");
const tenantAssistantRoutes = require("./tenantAssistantRoutes");

const router = express.Router();

router.get("/health", healthController.check);
router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/documents", documentRoutes);
router.use("/chats", chatRoutes);
router.use("/contracts", contractRoutes);
router.use("/assistants/tenant", tenantAssistantRoutes);

module.exports = router;
