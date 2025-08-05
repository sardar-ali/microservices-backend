const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const searchPostSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
searchPostSchema.index({ content: "text" });
searchPostSchema.index({ createdAt: -1 });
module.exports = model("Search", searchPostSchema);
