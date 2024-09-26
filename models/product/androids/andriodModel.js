const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true, 
  },
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
  originalPrice: {
    type: String,       
    required: false,
  },
  priceOff: {
    type: String,       
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["available", "soldout"],
    default: "available",
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
  variants: [variantSchema], 
  features: {
    type: [String],
    required: true,
  },
  media: {
    type: [String], 
    required: false,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
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
