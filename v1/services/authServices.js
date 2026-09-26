const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Admin JWT
const JwtCreate = (user) => {
  const PayloadData = {
    user_id: user._id, // User ID
    UserName: user.UserName,
    Role: "ADMIN",

    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = jwt.sign(
    PayloadData,
    process.env.JWT_SECRET_KEY
  );

  return token;
};


// Customer JWT
const CustomerJwtCreate = (user) => {
  const PayloadData = {
    user_id: user._id, // Customer ID
    email: user.email,
    Role: "CUSTOMER",

    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };

  const token = jwt.sign(
    PayloadData,
    process.env.JWT_SECRET_KEY
  );

  return token;
};


// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  return hashedPassword;
};


// Compare password
const comparePassword = async (
  enteredPassword,
  hashedPassword
) => {
  return await bcrypt.compare(
    enteredPassword,
    hashedPassword
  );
};


// Random number
async function randomNumber(length = 6) {
  const numbers = "1234567890";
  let result = "";

  for (let i = length; i > 0; i--) {
    result += numbers[
      Math.floor(Math.random() * numbers.length)
    ];
  }

  return result;
}


module.exports = {
  JwtCreate,
  CustomerJwtCreate,
  hashPassword,
  comparePassword,
  randomNumber,
};