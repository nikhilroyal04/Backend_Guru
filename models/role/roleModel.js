const mongoose = require('mongoose');

// Define the Role schema
const roleSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: false 
  },
  createdBy: {
    type: String,
    required: false 
  },
  createdOn: {
    type: String,
    required: false 
  },
  updatedOn: {
    type: String,
    required: false 
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    required: false 
  },
  permission: {
    type: String,
    required: false 
  }
});

// Create and export the Role model
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
