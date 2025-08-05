const mongoose = require("mongoose");
const logger = require("./logger");
const Search = require("../models/Search");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    const test = await Search.collection.dropIndexes();
    logger.info("Connected to mongodb!", test);
  })
  .catch((err) => {
    console.log("Mongodb connection failed!", err);
  });
