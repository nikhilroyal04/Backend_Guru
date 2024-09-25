const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  categoryImage: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
    required: false,
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

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
