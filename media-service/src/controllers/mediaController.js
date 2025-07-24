const Media = require("../models/Media");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const logger = require("../utils/logger");

const uploadMedia = async (req, res) => {
  logger.info("Starting media upload");
  try {
    if (!req.file) {
      logger.error("No file found. please try adding a file!");
      res.status(400).json({
        success: false,
        message: "No file found. please try adding a file!",
      });
    }

    const { orignalName, mimeType, buffer } = req.file;
    logger.info(`File details name is ${orignalName} type is ${mimeType}`);

    logger.info("uploading to cloudinary start");
    const cloudinaryUploudResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfully. public id:${cloudinaryUploudResult.public_id}`
    );
    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploudResult.public_id,
      orignalName,
      mimeType,
      url: cloudinaryUploudResult.secure_url,
    });

    await newlyCreatedMedia.save();
    logger.info("save media in db successfully");

    res.status(201).json({
      success: true,
      message: "Media uploaded successfully",
      media: newlyCreatedMedia,
    });
  } catch (error) {
    logger.error("Error in uploading media!");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { uploadMedia };
