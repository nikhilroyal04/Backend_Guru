const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "charger",
      "case",
      "earbuds",
      "screen protector",
      "android",
      "iphone",
      "other",
    ],
    required: true,
  },
  color: {
    type: [String],
    required: false,
  },
  storage: {
    type: String,
    required: false,
  },
  material: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: false,
  },
  priceOff: {
    type: Number,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  batteryHealth: {
    type: Number,
    required: false,
  },
  releaseYear: {
    type: Number,
    required: true,
  },
  features: {
    type: String,
    required: false,
  },
  media: {
    type: [String],
    required: false,
  },
  compatibility: {
    type: [String],
    required: false,
  },
  condition: {
    type: String,
    enum: ["new", "like new", "good", "fair", "poor"],
    required: false,
  },
  warranty: {
    type: String,
    default: "false",
  },
  addOn: {
    type: [String],
    required: false,
  },
  purchaseDate: {
    type: String,
    required: false,
  },
  age: {
    type: Number,
    required: false,
  },
  repaired: {
    type: [String],
    required: "false",
  },
  categoryName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "soldout", "inactive"],
    default: "available",
  },
  createdOn: {
    type: String,
    required: true,
  },
  updatedOn: {
    type: String,
    required: true,
  },
});

const ProductModel = mongoose.model("Product", productSchema);

module.exports = ProductModel;
