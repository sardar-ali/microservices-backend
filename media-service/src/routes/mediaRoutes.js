const express = require("express");
const multer = require("multer");
const authenticateRequest = require("../middlewares/authMiddleware");
const { uploadMedia, getAllMedia } = require("../controllers/mediaController");

const logger = require("../utils/logger");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single("file");
router.post(
  "/upload-media",
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        logger.error("Multer Error while uploading", err);
        res.status(400).json({
          success: false,
          message: "Multer Error while uploading",
          error: err.message,
          stack: error.stack,
        });
      } else if (err) {
        logger.error("Unknow Error while uploading", err);
        res.status(500).json({
          success: false,
          message: "Unknow Error while uploading",
          error: err.message,
          stack: error.stack,
        });
      }

      if (!req.file) {
        logger.error("File not found please upload file");
        res.status(400).json({
          success: false,
          message: "File not found please upload file",
        });
      }
      next();
    });
  },
  uploadMedia
);

router.get("/get-media", authenticateRequest, getAllMedia);
module.exports = router;
