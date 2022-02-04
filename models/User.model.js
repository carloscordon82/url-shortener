const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },

  password: String,

  email: {
    type: String,
    required: true,
  },

  urls: [{ type: mongoose.Types.ObjectId, ref: "Url" }],
});

const User = model("User", userSchema);

module.exports = User;
