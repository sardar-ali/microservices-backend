const Post = require("../models/Post");
const { inValidateCache } = require("../utils/invalidateCache");
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");

// create post
const createPost = async (req, res) => {
  logger.info("Create post end point hit");
  try {
    const { content, mediaIds } = req.body;
    const createdPost = await Post.create({
      content,
      mediaIds: mediaIds || [],
      user: req.user._id,
    });
    if (!createPost) {
      logger.error("post is not created!");
      return res.status(400).json({
        success: false,
        message: "post is not created",
      });
    }

    await inValidateCache(req, "posts:*"); // invalidate redis cache
    await publishEvent("post.created", {
      post: createdPost,
      userId: req.user._id,
    }); //create Rabbitmq event to add post in search collection
    logger.info("post created successfully", createdPost);
    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: createdPost,
    });
  } catch (error) {
    logger.error("Error in creating post!");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllPost = async (req, res) => {
  try {
    // Query Params for pagination
    console.log("query ::", req.query);
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const skip = (page - 1) * limit;

    //redis cache
    const cacheKey = `posts:${page}:${limit}`;

    const cachedPosts = JSON.parse(await req.redisClient.get(cacheKey));

    if (cachedPosts) {
      logger.info("post fetched successfully from cache", cachedPosts);
      return res.status(200).json({
        success: true,
        message: "Post get successfully",
        posts: cachedPosts,
      });
    }
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPosts = await Post.countDocuments();

    const result = {
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      count: totalPosts,
      currentPage: page,
    };

    // save result in cacheKey
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));

    logger.info("post fetched from db successfully", posts);
    return res.status(200).json({
      success: true,
      message: "Post get successfully",
      ...result,
    });
  } catch (error) {
    logger.error("Something went worng!");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(404).json({
        success: false,
        message: "Post notfound invalid post id",
      });
    }

    //redis cache post here
    const cacheKey = `posts:${id}`;
    const cachedPost = JSON.parse(await req.redisClient.get(cacheKey));
    if (cachedPost) {
      logger.info("post fetched successfully from cache", cachedPost);
      return res.status(200).json({
        success: true,
        message: "Post get successfully",
        post: cachedPost,
      });
    }

    const post = await Post.findOne({ _id: id, user: req.user._id });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    logger.info("single post get from db successfully", post);
    // cache the post
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(post));
    return res.status(200).json({
      success: true,
      message: "Post get successfully",
      post,
    });
  } catch (error) {
    logger.error("Something went worng!");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { content, mediaIds } = req.body;
    const { id } = req.params;
    const updatePost = await Post.findByIdAndUpdate(
      { _id: id },
      {
        content,
        mediaIds: mediaIds || [],
        user: req.user._id,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatePost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    logger.info("post updated successfully", updatePost);
    await inValidateCache(req, "posts:*"); // invalidate redis cache
    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: updatePost,
    });
  } catch (error) {
    logger.error("Something went worng!");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete({ _id: id });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    // logger.info("post deleted successfully", post);
    // publish event on delete post using rabbitmq
    await publishEvent("post.deleted", {
      postId: post._id.toString(),
      userId: req.user._id,
      mediaIds: post.mediaIds,
    });

    await inValidateCache(req, "posts:*"); // invalidate redis cache
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
      post,
    });
  } catch (error) {
    logger.error("Something went worng!");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
};
