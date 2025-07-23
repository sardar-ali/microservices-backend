const express = require("express");
const authenticateRequest = require("../middlewares/authMiddleware");
const {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
} = require("../controllers/postController");
const validateRequestMiddleware = require("../middlewares/validateRequestMiddleware");
const { postValidation } = require("../utils/validations");

const router = express.Router();
router.use(authenticateRequest);
router.post(
  "/create-post",
  validateRequestMiddleware(postValidation),
  createPost
);
router.get("/post", getAllPost);
router.get("/post/:id", getSinglePost);
router.patch(
  "/post/:id",
  validateRequestMiddleware(postValidation),
  updatePost
);
router.delete("/post/:id", deletePost);

module.exports = router;
