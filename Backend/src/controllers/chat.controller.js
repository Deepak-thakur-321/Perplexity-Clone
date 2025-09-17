const chatModel = require("../model/chat.model");

async function createChat(req, res) {
   try {
      const normalBody = JSON.parse(JSON.stringify(req.body));
      const { title } = normalBody;
      const chat = await chatModel.create({
         title,
         user: req.user.id,
      });

      res.status(201).json({ chat });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
}


async function getChats(req, res) {
   try {
      const chats = await chatModel.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.status(200).json({ chats });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
}


// ---------- New: Delete Chat ---------- //
async function deleteChat(req, res) {
   try {
      const chatId = req.params.id;

      // Check if chat exists and belongs to this user
      const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
      if (!chat) {
         return res.status(404).json({ message: "Chat not found or unauthorized" });
      }

      await chatModel.findByIdAndDelete(chatId);

      res.status(200).json({ message: "Chat deleted successfully", chatId });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
}

module.exports = { createChat, getChats, deleteChat };
