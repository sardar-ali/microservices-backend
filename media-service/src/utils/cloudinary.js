const cloudinary = require("cloudinary").v2;
const logger = require("../utils/logger");

cloudinary.config({
  cloud_name: process.env.CLOUDE_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          logger.error("Error while upload media to cloudinary", error);
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(uploadStream);
  });
};
