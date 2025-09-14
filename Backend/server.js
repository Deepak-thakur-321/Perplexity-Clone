const app = require("../Perplexity/src/app")
const connectDB = require("./src/DB/database")
const socketServer = require("./src/sockets/socket.server")
const http = require("http")

connectDB()

const httpServer = http.createServer(app)
socketServer(httpServer)

httpServer.listen(8080, () => {
   console.log("Server is running on port 8080")
})

