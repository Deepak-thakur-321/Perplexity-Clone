const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");
const redis = require("../DB/redis");

async function authMiddleware(req, res, next) {
   const token = req.cookies.token;
   console.log(req.cookies);
   

   if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
   }

   // Check if token is blacklisted
   const isBlackListToken = await redis.get(`blacklist:${token}`);
   if (isBlackListToken) {
      return res.status(401).json({ message: "Unauthorized - Token blacklisted" });
   }

   try {
      // ✅ Use actual token, not string
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID
      const user = await userModel.findById(decoded.id);
      if (!user) {
         return res.status(401).json({ message: "Unauthorized - User not found" });
      }

      // Attach user to request
      req.user = user;
      next();

   } catch (error) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
   }
}

module.exports = { authMiddleware };
