const chatModel = require("../model/chat.model");

async function createChat(req, res) {
   try {
      const { title } = req.body;
      const chat = await chatModel.create({
         title,
         user: req.user.id,
      });

      res.status(201).json({ chat });
   } catch (error) {
      res.status(500).json({ message: error.message });
   }
}

module.exports = { createChat };
