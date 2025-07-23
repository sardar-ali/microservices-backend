const logger = require("../utils/logger");

const authenticateRequest = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  console.log("authenticateRequest ::", { userId });
  if (!userId) {
    logger.warn("Access attempted without user ID");
    res.status(401).json({
      success: false,
      message: "Unautherized request! Please login to continue",
    });
  }
  req.user = { _id: userId };
  next();
};
module.exports = authenticateRequest;
