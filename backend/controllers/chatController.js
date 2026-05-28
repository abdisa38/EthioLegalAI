const Chat = require("../models/Chat");

const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ chats });
  } catch (error) {
    next(error);
  }
};

const toggleStar = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ error: { message: "Chat not found" } });
    }
    chat.starred = !chat.starred;
    await chat.save();
    res.json({ chat });
  } catch (error) {
    next(error);
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ error: { message: "Chat not found" } });
    }
    res.json({ message: "Chat deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChats,
  toggleStar,
  deleteChat,
};
