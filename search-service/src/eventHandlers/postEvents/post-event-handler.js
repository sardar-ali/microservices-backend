// const Media = require("../../models/Media");
const Search = require("../../models/Search");
const logger = require("../../utils/logger");
// const { deleteMediaFromCloudinary } = require("../../utils/cloudinary");

const createPostInSearchEventHandler = async (event) => {
  try {
    const { post, userId } = event;
    console.log("search created event 2222::", userId, post);
    logger.info(`Processed searcg creation completed for post`);
    if (!post || !userId) {
      return logger.error("Post or User not found in event");
    }

    const result = await Search.create({
      userId,
      postId: post._id,
      content: post.content,
    });
    console.log(`post added in search collection ${result}`);
    logger.info(`post added in search collection ${result}`);
  } catch (err) {
    logger.error("Error in created post in search ", err);
  }
};

const deletePostInSearchEventHandler = async (event) => {
  try {
    const { postId, userId } = event;
    console.log("search deleted event 2222::", userId, postId);
    logger.info(`Processed searcg deleted completed for postId`);
    if (!postId || !userId) {
      return logger.error("Post or User not found in event");
    }

    const result = await Search.findOneAndDelete({ postId });
    console.log(`post deleted in search collection ${result}`);
    logger.info(`post deleted in search collection ${result}`);
  } catch (err) {
    logger.error("Error in deleted post in search ", err);
  }
};
module.exports = {
  deletePostInSearchEventHandler,
  createPostInSearchEventHandler,
};
