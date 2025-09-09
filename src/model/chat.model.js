const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
   },
   title: {
      type: String,
     default: "New Chat"
   }
})

const chatModel = mongoose.model("chat", chatsSchema)

module.exports = chatModel