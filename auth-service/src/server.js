require("dotenv").config();
require("./utils/DBConnection");
const cors = require("cors");
const helmet = require("helmet");
const Redis = require("ioredis");
const express = require("express");
const logger = require("./utils/logger");
const { RedisStore } = require("rate-limit-redis");
const { rateLimit } = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const { RateLimiterRedis } = require("rate-limiter-flexible");

const app = express();
const PORT = process.env.PORT || 3001;
const redisClient = new Redis(process.env.REDIS_URL);
// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

//logging request details
app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

//DDOS Protection and rate limiting
const rateLimiterFlexible = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

//rateLimiterFlexible consume
app.use((req, res, next) => {
  rateLimiterFlexible
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

const sensitiveEndpoinsExpressRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  standardHeaders: true, // ('draft-8') draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: (req, res, _next) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for Ip ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

// use this sensitiveEndpoinsExpressRateLimiter middleware with routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/register", sensitiveEndpoinsExpressRateLimiter);

//use error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at`, promise, "reason :", reason);
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1); // Let process manager restart the app
});
