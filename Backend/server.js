const app = require("../Backend/src/app")
const connectDB = require("./src/DB/database")
const socketServer = require("./src/sockets/socket.server")
const http = require("http")

connectDB()

const httpServer = http.createServer(app)
socketServer(httpServer)


const port = process.env.PORT || 8080
httpServer.listen(port, () => {
   console.log("Server is running on port 8080")
})

