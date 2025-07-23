const mongoose = require("mongoose");
const argon2 = require("argon2");

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (condidatePassword) {
  try {
    const isMatch = await argon2.verify(this.password, condidatePassword);
    console.log({ isMatch });
    return isMatch;
  } catch (error) {
    throw error;
  }
};

userSchema.index({ username: "text" });
module.exports = model("User", userSchema);
