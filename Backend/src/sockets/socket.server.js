const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const aiService = require("../services/ai.service");
const messageModel = require("../model/message.model");

function initSocket(httpServer) {
   const io = new Server(httpServer, {
      cors: {
         origin: "http://localhost:5173",
         credentials: true,
      },
   });

   // Auth middleware
   io.use((socket, next) => {
      const cookies = socket.handshake.headers.cookie;
      const { token } = cookies ? cookie.parse(cookies) : {};

      if (!token) return next(new Error("Authentication error"));

      try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         socket.user = decoded;
         next();
      } catch (err) {
         return next(new Error("Invalid token"));
      }
   });

   io.on("connection", (socket) => {
      console.log("User connected:", socket.user.id);

      // Handle AI messages
      socket.on("ai-message", async (msg) => {
         try {
            // Save user message
            const savedMessage = await messageModel.create({
               chat: msg.chat,
               user: socket.user.id,
               role: "user",
               text: msg.text,
            });

            // Generate AI response
            const aiRes = await aiService.generateResult(msg.text);

            // Emit AI response to frontend with same _id
            socket.emit("ai-response", {
               _id: savedMessage._id,
               text: aiRes,
            });
         } catch (err) {
            console.error("AI error:", err);
            socket.emit("ai-error", "Something went wrong while generating AI response.");
         }
      });

      socket.on("disconnect", () => console.log("User disconnected:", socket.user.id));
   });
}

module.exports = initSocket;
