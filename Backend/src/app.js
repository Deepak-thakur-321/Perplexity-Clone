const express = require("express");
const app = express();
const chats = require("../src/routes/chat.routes")
const authRoutes = require("../src/routes/auth.routes")
require("dotenv").config()


// Middlewares //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes mount //
app.use("/api/auth", authRoutes)
app.use("/api/chats", chats)


module.exports = app