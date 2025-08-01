require("dotenv").config();
require("./utils/DBConnection");

const cors = require("cors");
const helmet = require("helmet");
const Redis = require("ioredis");
const express = require("express");
// const { rateLimit } = require("express-rate-limit");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const logger = require("./utils/logger");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middlewares/errorHandlerMiddleware");
const { connectToRabbitmq } = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT || 3002;
const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

//DDOS Protection and rate limiting
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch((err) => {
      logger.warn(`Rate limit exceeded for ip ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToRabbitmq();
    app.listen(PORT, () => {
      logger.info(`Post service Server is running on ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect server");
    process.exit(1);
  }
};
startServer();
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at`, promise, "reason :", reason);
  process.exit(1);
});
