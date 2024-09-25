const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  material: {
    type: String,
    required: false,
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

const accessorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["charger", "case", "earbuds", "screen protector", "other"],
    required: true,
  },
  compatibility: {
    type: String,
    required: true,
  },
  variants: [variantSchema],
  media: {
    type: [String],
    required: false,
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
  status: {
    type: String,
    enum: ["available", "soldout"],
    default: "available",
  },
  categoryName: {
    type: String,
    required: true,
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

const AccessoryModel = mongoose.model("Accessory", accessorySchema);

module.exports = AccessoryModel;
