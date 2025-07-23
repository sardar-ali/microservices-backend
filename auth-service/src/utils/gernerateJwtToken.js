const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const RefreshToken = require("../models/RefreshToken");

const createJwtToken = async (user) => {
  const token = await jwt.sign(
    { user: { _id: user._id, username: user.username } },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFE_TIME }
  );

  const refreshToken = await createRefreshToken(user);
  return {
    token,
    refreshToken,
  };
};

const createRefreshToken = async (user) => {
  const refreshToken = crypto.randomBytes(40).toString("hex");

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  });

  return refreshToken;
};

module.exports = {
  createJwtToken,
};
