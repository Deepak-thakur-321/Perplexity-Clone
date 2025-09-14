   const { Server } = require("socket.io");
   const cookie = require("cookie");
   const jwt = require("jsonwebtoken");
   const aiService = require("../services/ai.service");
   const messageModel = require("../model/message.model");

   function initSocket(httpServer) {
      const io = new Server(httpServer);

      io.use((socket, next) => {
         const cookies = socket.handshake.headers.cookie;
         const { token } = cookies ? cookie.parse(cookies) : {};

         if (!token) {
            return next(new Error("Authentication error"));
         }

         try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
         } catch (err) {
            return next(new Error("Invalid token"));
         }
      });

      io.on("connection", (socket) => {
         console.log("A user connected");
         console.log(socket.user);

         socket.on("ai-message", async (message) => {
            try {
               // Generate AI response
               const response = await aiService.generateResult(message);

               // Save user message
               const savedMessage = await messageModel.create({
                  chat: message.chat,
                  user: socket.user.id,
                  role: "user",
                  text: message.text
               });

               // Fetch chat history
               const history = (await messageModel.find({ chat: message.chat }))
                  .map((msg) => ({
                     role: msg.role,
                     parts: [{ text: msg.text }]
                  }));

               // Emit AI response back
               socket.emit("ai-response", response);

            } catch (err) {
               console.error("AI stream error:", err);
               socket.emit("ai-error", "Something went wrong while generating response.");
            }
         });

         socket.on("disconnect", () => {
            console.log("A user disconnected");
         });
      });
   }

   module.exports = initSocket;
