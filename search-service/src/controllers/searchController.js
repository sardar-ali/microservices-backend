const Search = require("../models/Search");
const logger = require("../utils/logger");

const searchPost = async (req, res) => {
  logger.info("searching end point hit");
  try {
    const { query } = req.query;
    const cacheKey = "posts:search-post";
    const cachedPosts = JSON.parse(await req.redisClient.get(cacheKey));
    if (cachedPosts) {
      logger.info("search post fetched successfully from cache", cachedPosts);
      return res.status(200).json({
        success: true,
        message: "Search Post get successfully",
        posts: cachedPosts,
      });
    }
    const results = await Search.find(
      {
        $text: { $search: query },
      },
      {
        score: { $meta: "textScore" },
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10);
    req.redisClient.setex(cacheKey, 300, JSON.stringify(results));
    logger.info("search post fetched successfully from db");
    return res.status(200).json({
      success: true,
      message: "Searching results fetched",
      results,
    });
  } catch (error) {
    logger.error("Error in searching post!");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = { searchPost };
