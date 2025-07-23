const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log({ authHeader, token: req.headers.authorization });

  const token = authHeader && authHeader.split(" ")[1];
  console.log("token::", token);
  if (!token) {
    logger.error("Unauthorized request: token not found!");
    return res.status(401).json({
      success: false,
      message: "Unauthorized request: token is required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error("Invalid Token!");
      return res.status(429).json({
        success: false,
        message: "Invalid Token!",
      });
    }
    console.log("Decoded and verified token ::", user);
    req.user = user;
    next();
  });
};

module.exports = { validateToken };
