require("dotenv").config();
require("./utils/DBConnection");

const cors = require("cors");
const helmet = require("helmet");
const Redis = require("ioredis");
const express = require("express");
const logger = require("./utils/logger");
// const { rateLimit } = require("express-rate-limit");
// const { RateLimiterRedis } = require("rate-limiter-flexible");
const searchRoutes = require("./routes/searchRoutes");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
// const { connectToRabbitmq, consumeEvent } = require("./utils/rabbitmq");
const { connectToRabbitmq, consumeEvent } = require("./utils/rabbitmq");
const {
  createPostInSearchEventHandler,
  deletePostInSearchEventHandler,
} = require("./eventHandlers/postEvents/post-event-handler");

const app = express();
const PORT = process.env.PORT || 3004;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());
console.log("Search *************** triggered");
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

app.use(
  "/api/search",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  searchRoutes
);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToRabbitmq();
    await consumeEvent("post.created", createPostInSearchEventHandler);
    await consumeEvent("post.deleted", deletePostInSearchEventHandler);
    app.listen(PORT, () => {
      logger.info(`search service Server is running on ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect server");
    process.exit(1);
  }
};
startServer();
