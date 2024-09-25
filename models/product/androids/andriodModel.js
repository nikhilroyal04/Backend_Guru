const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  storage: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
});

const androidSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  releaseYear: {
    type: String,
    required: true,
  },
  variants: [variantSchema], // Each Android model has multiple variants
  features: {
    type: [String],
    required: true,
  },
  media: {
    type: [String], // Universal media field for the entire Android model
    required: false,
  },
  status: {
    type: String,
    enum: ["available", "soldout"],
    default: "available",
  },
  condition: {
    type: String,
    enum: ["new", "like new", "good", "fair", "poor"],
    required: true,
  },
  warranty: {
    type: String,
    default: "false",
  },
  addOn: {
    type: [String],
  },
  purchaseDate: {
    type: String,
  },
  age: {
    type: String,
    required: true,
  },
  repaired: {
    type: String,
    default: "false",
  },
  categoryName: {
    type: String,
    required: true,
  },
  createdOn: {
    type: String,
    required: false,
  },
  updatedOn: {
    type: String,
    required: false,
  },
});

const AndroidModel = mongoose.model("Android", androidSchema);

module.exports = AndroidModel;
