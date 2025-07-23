const RefreshToken = require("../models/RefreshToken");
const User = require("../models/User");
const { createJwtToken } = require("../utils/gernerateJwtToken");
const logger = require("../utils/logger");
const {
  validationRegistration,
  validationLogin,
} = require("../utils/validation");

// user registeration
const resgisterUser = async (req, res) => {
  logger.info("Registration endpoint hit ...");
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (user) {
      logger.warn("User already exist");
      return res.status(400).json({
        success: false,
        message: "User already exist",
      });
    }

    user = new User({
      username,
      email,
      password,
    });
    await user.save();

    logger.warn("User registered succcessfully");
    const { token, refreshToken } = await createJwtToken(user);
    return res.status(201).json({
      success: true,
      message: "User register successfully!",
      user: { username: user.username, email: user.email, _id: user._id },
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error("User registered Failed!", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// user login
const LoginUser = async (req, res) => {
  logger.info("Login route hit");
  console.log({ login: req.body });
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log({ loginUser: user });
    if (!user) {
      logger.error("User notfound!");
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.error("Invalid Credentials");
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const { token, refreshToken } = await createJwtToken(user);
    logger.info("User login successfully");
    return res.status(201).json({
      success: true,
      message: "User Login successfully!",
      user: { username: user.username, email: user.email },
      token,
      refreshToken,
    });
  } catch (error) {
    logger.error("User Login Failed!", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// refresh token
const refreshTokenUser = async (req, res) => {
  logger.info("Refresh token route hit");
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.error("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt <= new Date()) {
      logger.error("Invalid or expired refresh token");
      return res.status(400).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById({ _id: storedToken.user });

    if (!user) {
      logger.error("User notfound!");
      return res.status(400).json({
        success: false,
        message: "User notfound!",
      });
    }

    const { refreshToken: newRefreshToken, token } = await createJwtToken(user);

    await RefreshToken.findByIdAndDelete({ _id: storedToken._id });

    logger.info("Refresh token generated successfully");
    return res.status(201).json({
      success: true,
      message: "Refresh token generated successfully!",
      user: { username: user.username, email: user.email },
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    logger.error("User Login Failed!", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
// logout
const logoutUser = async (req, res) => {
  try {
    logger.info("Logout route hit!");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.error("Refresh token missing");
      return res.status(400).json({
        success: false,
        message: "Refresh token missing",
      });
    }
    await RefreshToken.findOneAndDelete({ token: refreshToken });
    logger.info("Refresh Token deleted for logout!");

    return res.status(201).json({
      success: true,
      message: "User Logout successfully!",
    });
  } catch (error) {
    logger.error("User Logout Failed!", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  resgisterUser,
  LoginUser,
  refreshTokenUser,
  logoutUser,
};
