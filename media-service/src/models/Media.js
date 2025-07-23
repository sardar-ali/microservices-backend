const mongoose = require("mongoose");

const { model, Schema } = mongoose;

const mediaSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    orignalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
module.exports = model("Media", mediaSchema);
