const mongoose = require("mongoose");
const logger = require("./logger");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to mongodb!");
  })
  .catch((err) => {
    console.log("Mongodb connection failed!", err);
  });
