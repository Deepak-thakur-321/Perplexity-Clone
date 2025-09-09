const { Server } = require("socket.io")

async function socketServer(httpServer) {

   const io = new Server(httpServer)
   io.on("connection", (socket) => {
      console.log("Client Connected", socket.id)

      socket.on("disconnect", (data) => {
         console.log("A user Disconnect", data)
      })

      io.emit("message", "Hello All Client")
      io.on("disconnection", (socket) => {
         console.log("Client Disconnected", socket.id)
      })

   })
}

module.exports = socketServer

