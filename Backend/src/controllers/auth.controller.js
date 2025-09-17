const userModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function registerUser(req, res) {
   try {
      const { userName, email, password, fullName } = req.body;

      // Check if user exists
      const isUserAlreadyExist = await userModel.findOne({ email });
      if (isUserAlreadyExist) {
         return res.status(422).json({ message: "User Already Exist" });
      }

      // Hash password
      const hashPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await userModel.create({
         userName,
         email,
         password: hashPassword,
         fullName: {
            firstName: fullName?.firstName || "",
            lastName: fullName?.lastName || ""
         }
      });

      // Generate JWT
      const token = jwt.sign(
         {
            id: user._id,
            email: user.email,
            role: user.role
         },
         process.env.JWT_SECRET,
         { expiresIn: "1d" }
      );

      // Set cookie
      res.cookie("token", token, {
         httpOnly: true,
         secure: true,
         sameSite: "none"
      });

      return res.status(201).json({ message: "User Created Successfully" });
   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
   }
}

async function loginUser(req, res) {
   try {
      const { email, password } = req.body

      // User Find //
      const user = await userModel.findOne({ email })

      if (!user) {
         return res.status(400).json({ message: "User Not Found" })
      }

      // Password Compare //
      const isPasswordMatch = await bcrypt.compare(password, user.password)

      if (!isPasswordMatch) {
         return res.status(400).json({ message: "Invalid Password" })
      }

      // JWt Token generate //
      const token = jwt.sign({
         id: user._id,
         email: user.email,
         role: user.role
      }, process.env.JWT_SECRET,)

      // Cookie Set //
      res.cookie("token", token)

      // Success Response //
      return res.status(200).json({
         message: "Login Successfully",
         token,
         user: {
            id: user._id,
            userName: user.userName,
            email: user.email,
            role: user.role
         }
      })

   } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
   }
}


async function logoutUser(req, res) {
   const token = req.cookies.token
   if (token) {
      await redis.set(`blacklist:${token}`, "true", "EX", 60 * 60 * 24)
   }
   res.clearCookie("token")
   return res.status(200).json({ message: "Logout Successfully" })
}

module.exports = { registerUser, loginUser, logoutUser };
