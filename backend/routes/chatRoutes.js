const express = require("express");
const { getChats, getChatById, toggleStar, deleteChat } = require("../controllers/chatController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(requireAuth);
router.get("/", getChats);
router.get("/:id", getChatById);
router.patch("/:id/star", toggleStar);
router.delete("/:id", deleteChat);

module.exports = router;
