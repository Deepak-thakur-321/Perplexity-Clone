const { body, validationResult } = require("express-validator");

function validateResult(req, res, next) {
   const errors = validationResult(req);

   if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
   }
   next()
}


const registerUserValidator = [
   body("userName").isString().withMessage("User Name is required").isLength({ min: 3, max: 20 }).withMessage("User Name must be between 3 and 20 characters"),

   body("email").isEmail().withMessage("Email is required"),

   body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

   body("fullName.firstName").isString().withMessage("First Name is required").notEmpty().withMessage("First Name is required"),

   body("fullName.lastName").isString().withMessage("Last Name is required"),

   validateResult
]

const loginUserValidator = [
   body("email")
      .isEmail()
      .withMessage("Valid email is required"),

   body("password")
      .notEmpty()
      .withMessage("Password is required"),

   validateResult
];

const createChatValidation = [
   body("title").isString().withMessage("Title must be string").isLength({ min: 3, max: 20 }).withMessage("Title must be between 3 and 20 characters").notEmpty(),

   validateResult
]

module.exports = { registerUserValidator, loginUserValidator, createChatValidation }