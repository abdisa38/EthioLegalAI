const express = require("express");
const healthController = require("../controllers/healthController");
const authRoutes = require("./authRoutes");
const aiRoutes = require("./aiRoutes");
const chatRoutes = require("./chatRoutes");

const router = express.Router();

router.get("/health", healthController.check);
router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/chats", chatRoutes);

module.exports = router;
