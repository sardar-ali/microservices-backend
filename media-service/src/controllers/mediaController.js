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
    // console.log({ FileBody: req });

    const { originalname, mimetype, buffer } = req.file;
    logger.info(`File details name is ${originalname} type is ${mimetype}`);

    logger.info("uploading to cloudinary start");
    const cloudinaryUploudResult = await uploadMediaToCloudinary(req.file);
    logger.info(
      `Cloudinary upload successfully. public id:${cloudinaryUploudResult.public_id}`
    );

    const newlyCreatedMedia = new Media({
      publicId: cloudinaryUploudResult.public_id,
      orignalName: originalname,
      mimeType: mimetype,
      url: cloudinaryUploudResult.secure_url,
      userId: req.user._id,
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

const getAllMedia = async (req, res) => {
  try {
    const media = await Media.find({});
    res.status(200).json({
      success: true,
      media,
      message: "Media fetched successfully",
    });
  } catch (error) {
    logger.error("Error in delete media!");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { uploadMedia, getAllMedia };
