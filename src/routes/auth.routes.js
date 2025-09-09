const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/auth.controller")
const validation = require("../middlewares/validation.middleware")


const router = express.Router();


router.post("/register", validation.registerUserValidator, registerUser)
router.post("/login", validation.loginUserValidator, loginUser)
router.post("/logout", logoutUser)


module.exports = router