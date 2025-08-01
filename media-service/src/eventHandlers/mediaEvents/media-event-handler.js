const Media = require("../../models/Media");
const { deleteMediaFromCloudinary } = require("../../utils/cloudinary");
const logger = require("../../utils/logger");

const postDeleteEventHandler = async (event) => {
  try {
    const { postId, userId, mediaIds } = event;
    console.log({ postId, mediaIds, userId });
    const mediaToDeleting = await Media.find({ _id: { $in: mediaIds } });
    for (const media of mediaToDeleting) {
      if (mediaIds) {
        await deleteMediaFromCloudinary(media.publicId);
      }
      await Media.findByIdAndDelete(media._id);
      logger.info(
        `Deleted media ${media._id} associated with this deleted post ${postId}`
      );
    }
    logger.info(`Processed deletion completed for post id ${postId}`);
  } catch (err) {
    logger.error("Error in delete media ", err);
  }
};

module.exports = { postDeleteEventHandler };
