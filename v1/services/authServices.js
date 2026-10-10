const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AWS = require("aws-sdk");

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


// AWS S3 Config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Upload file/image to S3
const uploadToS3 = async (
  buffer,
  fileName,
  mimeType,
  folder = "customers"
) => {
  try {

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,

      Key: `${folder}/${fileName}`,

      Body: buffer,

      ContentType: mimeType,

      ACL: "public-read",
    };

    const { Location } =
      await s3.upload(params).promise();

    return Location;

  } catch (error) {

    console.error(
      "S3 Upload Error:",
      error
    );

    throw error;
  }
};
 

module.exports = {
  JwtCreate,
  CustomerJwtCreate,
  hashPassword,
  comparePassword,
  randomNumber,
  uploadToS3
};