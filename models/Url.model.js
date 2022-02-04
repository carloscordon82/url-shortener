const { Schema, model } = require("mongoose");

const urlSchema = new Schema(
  {
    destinationLink: {
      type: String,
      required: true,
    },
    shortLink: {
      type: String,
      required: true,
      unique: true,
    },

    clicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Url = model("Url", urlSchema);

module.exports = Url;
