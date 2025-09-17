const express = require("express");
const router = express.Router();

const { createChat, getChats, deleteChat } = require("../controllers/chat.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { createChatValidation } = require("../middlewares/validation.middleware");

// Just use "/" here because the router is mounted at /api/chats
router.post("/", authMiddleware, createChatValidation, createChat);
router.get("/", authMiddleware, getChats);
router.delete("/:id", authMiddleware, deleteChat);

module.exports = router;
