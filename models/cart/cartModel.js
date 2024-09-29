const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: false,
  },
  variantId: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    default: 1,
    required: false,
  },
  color: {
    type: String,
    required: false,
  },
  price: {
    type: String,
    required: false,
  },
  originalPrice: {
    type: String,
    required: false,
  },
  priceOff: {
    type: String,
    required: false,
  },
  media: {
    type: String,
    required: false,
  },
  storageOption: {
    type: String,
    required: false,
  },
});

// No changes needed in cartSchema
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users",
    unique: true,
  },
  items: [cartItemSchema],
  createdOn: {
    type: String,
    required: true,
  },
  updatedOn: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
