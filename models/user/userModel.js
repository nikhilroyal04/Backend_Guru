const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false 
  },
  email: {
    type: String,
    required: false, 
    unique: true 
  },
  password: {
    type: String,
    required: false 
  },
  phoneNumber: {
    type: String,
    required: false 
  },
  role: {
    type: String,
    required: false 
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
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
  reason: {
    type: String,
    required: false 
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
