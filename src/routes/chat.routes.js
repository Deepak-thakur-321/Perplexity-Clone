const express = require("express");
const router = express.Router();

const {createChat} = require("../controllers/chat.controller")
const  {authMiddleware } = require("../middlewares/auth.middleware")
const { createChatValidation } = require("../middlewares/validation.middleware")



router.post("/",authMiddleware, createChatValidation, createChat)


module.exports = router