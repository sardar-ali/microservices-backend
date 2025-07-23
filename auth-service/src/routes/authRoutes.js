const express = require("express");
const {
  LoginUser,
  logoutUser,
  resgisterUser,
  refreshTokenUser,
} = require("../controllers/authController");
const validateRequestMiddleware = require("../middleware/validateRequestMiddleware");
const {
  validationLogin,
  validationRegistration,
} = require("../utils/validation");
const router = express.Router();

router.post(
  "/register",
  validateRequestMiddleware(validationRegistration),
  resgisterUser
);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshTokenUser);
router.post("/login", validateRequestMiddleware(validationLogin), LoginUser);

module.exports = router;
