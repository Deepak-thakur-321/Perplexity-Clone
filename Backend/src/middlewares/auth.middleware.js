// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const userModel = require("../model/user.model");
const redis = require("../DB/redis");

// ---------- HTTP Middleware ----------
async function authMiddleware(req, res, next) {
   const token = req.cookies?.token;

   if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
   }

   // Check blacklist in Redis
   const isBlacklisted = await redis.get(`blacklist:${token}`);
   if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized - Token blacklisted" });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
         return res.status(401).json({ message: "Unauthorized - User not found" });
      }

      req.user = user; // attach user to request
      next();
   } catch (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
   }
}

// ---------- Socket.IO Middleware ----------
async function socketAuthMiddleware(socket, next) {
   try {
      const cookies = socket.handshake.headers.cookie;
      const { token } = cookies ? cookie.parse(cookies) : {};

      if (!token) {
         return next(new Error("Authentication error - No token"));
      }

      // Check blacklist in Redis
      const isBlacklisted = await redis.get(`blacklist:${token}`);
      if (isBlacklisted) {
         return next(new Error("Authentication error - Token blacklisted"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
         return next(new Error("Authentication error - User not found"));
      }

      socket.user = user; // attach user to socket object
      next();
   } catch (err) {
      return next(new Error("Authentication error - Invalid token"));
   }
}

module.exports = {
   authMiddleware,
   socketAuthMiddleware,
};
