const mongoose = require("mongoose");

// Define the Feature Schema
const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: [
    {
      category: {
        type: String,
        required: true,
      },
      features: {
        type: [String],
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
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

// Create the Feature model from the schema
const Feature = mongoose.model("Feature", featureSchema);

module.exports = Feature;
