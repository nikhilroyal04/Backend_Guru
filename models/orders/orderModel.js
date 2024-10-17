const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
    enum: [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Lakshadweep",
      "Delhi",
      "Puducherry",
    ],
  },
});

// Define the Order Schema
const orderSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  userId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  totalPaidAmount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  deliveryFee: {
    type: String,
    required: true,
    default: "NA",
  },
  couponApplied: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
    required: true,
  },
  code: {
    type: String,
    required: false,
  },
  orderStatus: {
    type: String,
    enum: [
      "Pending",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
      "Refunded",
    ],
    default: "Pending",
  },
  shippingAddress: {
    type: addressSchema,
    required: true,
  },
  billingAddress: {
    type: addressSchema,
    required: true,
  },
  createdOn: {
    type: String,
    default: Date.now,
  },
  updatedOn: {
    type: String,
    default: Date.now,
  },
});

// Create the Order model from the schema
const Order = mongoose.model("Order", orderSchema);

// Export the Order model so it can be used elsewhere in the app
module.exports = Order;
