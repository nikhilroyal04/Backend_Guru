const express = require('express');
const AddressService = require('../../services/address/address_services');
const ResponseManager = require('../../utils/responseManager');
const consoleManager = require('../../utils/consoleManager');

const router = express.Router();

// Create a new address
router.post('/addAddress', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.userId) {
      return ResponseManager.handleBadRequestError(res, 'User ID is required');
    }
    if (!req.body.addressLine1) {
      return ResponseManager.handleBadRequestError(res, 'Address Line 1 is required');
    }
    if (!req.body.city) {
      return ResponseManager.handleBadRequestError(res, 'City is required');
    }
    if (!req.body.state) {
      return ResponseManager.handleBadRequestError(res, 'State is required');
    }
    if (!req.body.pincode) {
      return ResponseManager.handleBadRequestError(res, 'Pincode is required');
    }

    // Create the address
    const address = await AddressService.createAddress(req.body);
    return ResponseManager.sendSuccess(res, address, 201, 'Address created successfully');
  } catch (err) {
    consoleManager.error(`Error creating address: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating address');
  }
});

// Get all addresses for a specific user by userId
router.get('/getUserAddresses/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const addresses = await AddressService.getAllAddressesByUserId(userId);

    if (addresses.length === 0) {
      return ResponseManager.sendSuccess(res, [], 200, 'No addresses found for this user');
    }

    return ResponseManager.sendSuccess(res, addresses, 200, 'Addresses retrieved successfully');
  } catch (err) {
    consoleManager.error(`Error fetching addresses for user ${req.params.userId}: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching addresses');
  }
});

// Get a specific address by addressId
router.get('/getAddress/:addressId', async (req, res) => {
  try {
    const address = await AddressService.getAddressById(req.params.addressId);
    if (address) {
      return ResponseManager.sendSuccess(res, address, 200, 'Address retrieved successfully');
    } else {
      return ResponseManager.sendSuccess(res, [], 200, 'Address not found');
    }
  } catch (err) {
    consoleManager.error(`Error fetching address: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching address');
  }
});

// Update an address by addressId
router.put('/updateAddress/:addressId', async (req, res) => {
  try {
    const address = await AddressService.updateAddress(req.params.addressId, req.body);
    if (address) {
      return ResponseManager.sendSuccess(res, address, 200, 'Address updated successfully');
    } else {
      return ResponseManager.sendSuccess(res, [], 200, 'Address not found for update');
    }
  } catch (err) {
    consoleManager.error(`Error updating address: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating address');
  }
});

// Delete an address by addressId
router.delete('/deleteAddress/:addressId', async (req, res) => {
  try {
    const address = await AddressService.deleteAddress(req.params.addressId);
    if (address) {
      return ResponseManager.sendSuccess(res, address, 200, 'Address deleted successfully');
    } else {
      return ResponseManager.sendSuccess(res, [], 200, 'Address not found for deletion');
    }
  } catch (err) {
    consoleManager.error(`Error deleting address: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting address');
  }
});

// Get all addresses with pagination and filtering by city/state for a user
router.get('/getAllAddresses', async (req, res) => {
  try {
    const {name, city, state, page = 1, limit = 20 } = req.query;
    const result = await AddressService.getAllAddresses({ name, city, state }, page, limit);

    if (result.addresses.length === 0) {
      return ResponseManager.sendSuccess(res, [], 200, 'No addresses found');
    }

    // Format the response as needed
    return ResponseManager.sendSuccess(
      res,
      {
        addresses: result.addresses,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalAddresses: result.totalAddresses,
      },
      200,
      'Addresses retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching addresses: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching addresses');
  }
});

// Get the total number of addresses for a user
router.get('/getNumberOfAddresses/:userId', async (req, res) => {
  try {
    const count = await AddressService.getNumberOfAddresses(req.params.userId);
    return ResponseManager.sendSuccess(res, { count }, 200, 'Number of addresses retrieved successfully');
  } catch (err) {
    consoleManager.error(`Error counting addresses: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error counting addresses');
  }
});

module.exports = router;
