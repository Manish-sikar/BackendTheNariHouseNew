const jwt = require("jsonwebtoken");

const customerAuth = (req, res, next) => {
  try {
    const token =
      req.headers["x-access-token"] ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    );

    if (decoded.Role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Customer access only"
      });
    }

    req.user = {
      _id: decoded.user_id,
      email: decoded.email
    };

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = customerAuth;