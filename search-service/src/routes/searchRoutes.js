const express = require("express");
const authenticateRequest = require("../middlewares/authMiddleware");
const { searchPost } = require("../controllers/searchController");

const router = express.Router();
router.use(authenticateRequest);
router.get("/post", searchPost);

module.exports = router;
