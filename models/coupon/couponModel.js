const mongoose = require("mongoose");

// Define the coupon schema
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  shortDescription: {
    type: String,
    required: true,
    trim: true,
  },
  longDescription: {
    type: String,
    required: true,
    trim: true,
  },
  applicable: {
    type: [String],
    default: [],
  },
  discountType: {
    type: String,
    enum: ["percentage", "flat"],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minimumPurchase: {
    type: Number,
    default: 0,
  },
  createdOn: {
    type: String,
    required: true,
  },
  expiryDate: {
    type: String,
    required: true,
  },
  maxRedemptions: {
    type: String,
    default: 1,
  },
  currentRedemptions: {
    type: String,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: true,
  },
});

// Export the coupon model
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
