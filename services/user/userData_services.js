const UserData = require("../../models/user/userDataModel"); 
const User = require('../../models/user/userModel'); // Users collection model
const consoleManager = require("../../utils/consoleManager");

class UserDataService {
  // Addresses

  async addAddress(userId, addressData) {
    try {
      // Verify if user exists in Users collection
      const userExists = await User.findById(userId);
      if (!userExists) {
        consoleManager.log('User not found in Users collection');
        return null;
      }

      // Check if UserData entry exists for the user
      let userData = await UserData.findOne({ userId: userId });
      if (!userData) {
        // If no UserData entry, create a new one
        userData = new UserData({
          userId: userId,
          addresses: [],
          orders: [],
        });
      }

      // Add the new address to the UserData addresses array
      userData.addresses.push(addressData);
      userData.updatedOn = Date.now(); // Update timestamp

      // Save the updated UserData
      await userData.save();
      return userData;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  async updateAddress(userId, addressId, addressData) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }

      const addressIndex = userData.addresses.findIndex(addr => addr._id.toString() === addressId);
      if (addressIndex === -1) {
        throw new Error("Address not found");
      }

      userData.addresses[addressIndex] = { ...userData.addresses[addressIndex], ...addressData };
      userData.updatedOn = Date.now(); // Update timestamp
      await userData.save();
      consoleManager.log("Address updated successfully");
      return userData;
    } catch (err) {
      consoleManager.error(`Error updating address: ${err.message}`);
      throw err;
    }
  }

  async deleteAddress(userId, addressId) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }

      userData.addresses = userData.addresses.filter(addr => addr._id.toString() !== addressId);
      userData.updatedOn = Date.now(); // Update timestamp
      await userData.save();
      consoleManager.log("Address deleted successfully");
      return userData;
    } catch (err) {
      consoleManager.error(`Error deleting address: ${err.message}`);
      throw err;
    }
  }

  async getAddresses(userId) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }

      return userData.addresses;
    } catch (err) {
      consoleManager.error(`Error fetching addresses: ${err.message}`);
      throw err;
    }
  }

  // Orders

  async addOrder(userId, orderData) {
    try {
      // Check if UserData exists for the user
      let userData = await UserData.findOne({ userId });

      if (!userData) {
        // If UserData doesn't exist, create a new UserData entry
        userData = new UserData({
          userId: userId,
          addresses: [], // Initialize addresses as empty
          orders: [],    // Initialize orders as empty
        });
        consoleManager.log(`New UserData created for user ${userId}`);
      }

      // Create a new order object
      const newOrder = {
        productId: orderData.productId,
        productName: orderData.productName,
        amount: orderData.amount,
        quantity: orderData.quantity,
        orderStatus: orderData.orderStatus || "Pending",
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        createdOn: Date.now(),
        updatedOn: Date.now(),
      };

      // Push the new order to the orders array
      userData.orders.push(newOrder);
      userData.updatedOn = Date.now(); // Update timestamp

      // Save the updated UserData
      await userData.save();
      consoleManager.log("Order added successfully");
      return userData;
    } catch (err) {
      consoleManager.error(`Error adding order: ${err.message}`);
      throw err;
    }
  }

  async updateOrder(userId, orderId, { orderStatus }) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }
  
      // Find the order by its ID
      const orderIndex = userData.orders.findIndex(order => order._id.toString() === orderId);
      if (orderIndex === -1) {
        throw new Error("Order not found");
      }
  
      // Update only the order status
      userData.orders[orderIndex].orderStatus = orderStatus; // Update order status
      userData.orders[orderIndex].updatedOn = Date.now(); // Update timestamp
  
      await userData.save();
      consoleManager.log("Order status updated successfully");
      return userData;
    } catch (err) {
      consoleManager.error(`Error updating order: ${err.message}`);
      throw err;
    }
  }
  
  

  async deleteOrder(userId, orderId) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }

      // Check if the order exists by its ID
      const orderIndex = userData.orders.findIndex(order => order._id.toString() === orderId);
      if (orderIndex === -1) {
        throw new Error("Order not found");
      }

      userData.orders.splice(orderIndex, 1); 
      userData.updatedOn = Date.now(); // Update timestamp
      await userData.save();
      consoleManager.log("Order deleted successfully");
      return userData;
    } catch (err) {
      consoleManager.error(`Error deleting order: ${err.message}`);
      throw err;
    }
  }

  async getOrders(userId) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }

      return userData.orders;
    } catch (err) {
      consoleManager.error(`Error fetching orders: ${err.message}`);
      throw err;
    }
  }

  async getUserDataById(id) {
    try {
      const userData = await UserData.findById(id);
      if (!userData) {
        throw new Error("User data not found");
      }
      return userData;
    } catch (err) {
      consoleManager.error(`Error fetching user data by ID: ${err.message}`);
      throw err;
    }
  }

  async getUserDataByUserId(userId) {
    try {
      const userData = await UserData.findOne({ userId });
      if (!userData) {
        throw new Error("User data not found");
      }
      return userData;
    } catch (err) {
      consoleManager.error(`Error fetching user data by user ID: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new UserDataService();
