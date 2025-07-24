require("dotenv").config();
require("./utils/DBConnection");

const cors = require("cors");
const helmet = require("helmet");
const Redis = require("ioredis");
const express = require("express");
// const { rateLimit } = require("express-rate-limit");
// const { RateLimiterRedis } = require("rate-limiter-flexible");

const logger = require("./utils/logger");
const mediaRoutes = require("./routes/mediaRoutes");
const errorHandler = require("./middlewares/errorHandlerMiddleware");

const app = express();
const PORT = process.env.PORT || 3002;
// const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(`request body ${req.body}`);
  next();
});

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`media service Server is running on ${PORT}`);
});
