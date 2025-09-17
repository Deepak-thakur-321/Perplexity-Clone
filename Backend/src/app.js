const express = require("express");
const app = express();
const chats = require("./routes/chat.routes");
const authRoutes = require("./routes/auth.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   })
);

app.use("/api/auth", authRoutes);
app.use("/api/chats", chats);

module.exports = app;
