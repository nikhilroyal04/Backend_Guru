const Address = require("../../models/address/addressModel");
const consoleManager = require("../../utils/consoleManager");

class AddressService {
  async createAddress(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      const address = new Address(data);
      await address.save();
      consoleManager.log("Address created successfully");
      return address;
    } catch (err) {
      consoleManager.error(`Error creating address: ${err.message}`);
      throw err;
    }
  }

  // Get all addresses for a single user by userId
  async getAllAddressesByUserId(userId) {
    try {
      const addresses = await Address.find({ userId }).exec();
      return addresses;
    } catch (err) {
      consoleManager.error(
        `Error fetching addresses for user ${userId}: ${err.message}`
      );
      throw err;
    }
  }

  async getAddressById(addressId) {
    try {
      const address = await Address.findById(addressId);
      if (!address) {
        consoleManager.error("Address not found");
        return null;
      }
      return address;
    } catch (err) {
      consoleManager.error(`Error fetching address: ${err.message}`);
      throw err;
    }
  }

  async updateAddress(addressId, data) {
    try {
      data.updatedOn = Date.now();
      const address = await Address.findByIdAndUpdate(addressId, data, {
        new: true,
      });
      if (!address) {
        consoleManager.error("Address not found for update");
        return null;
      }
      consoleManager.log("Address updated successfully");
      return address;
    } catch (err) {
      consoleManager.error(`Error updating address: ${err.message}`);
      throw err;
    }
  }

  async deleteAddress(addressId) {
    try {
      const address = await Address.findByIdAndDelete(addressId);
      if (!address) {
        consoleManager.error("Address not found for deletion");
        return null;
      }
      consoleManager.log("Address deleted successfully");
      return address;
    } catch (err) {
      consoleManager.error(`Error deleting address: ${err.message}`);
      throw err;
    }
  }

  async getAllAddresses(query = {}, page = 1, limit = 20) {
    try {
      // Build the query object for filtering (e.g., by city or state)
      const filterQuery = {};  // Initialize filter query
  
      if (query.name) {
        filterQuery.name = { $regex: query.name, $options: "i" }; // Case-insensitive search for city
      }
      if (query.city) {
        filterQuery.city = { $regex: query.city, $options: "i" }; // Case-insensitive search for city
      }
      if (query.state) {
        filterQuery.state = query.state; // Exact match for state
      }
  
      // Fetch addresses with pagination
      const addresses = await Address.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of addresses for pagination
      const totalAddresses = await Address.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalAddresses / limit);
  
      return {
        addresses,
        totalPages,
        currentPage: parseInt(page, 10),
        totalAddresses,
      };
    } catch (err) {
      consoleManager.error(`Error fetching addresses: ${err.message}`);
      throw err;
    }
  }
  

  async getNumberOfAddresses(userId) {
    try {
      const count = await Address.countDocuments({ userId });
      consoleManager.log(`Number of addresses: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting addresses: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new AddressService();
