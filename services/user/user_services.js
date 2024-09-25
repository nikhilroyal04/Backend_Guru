const User = require("../../models/user/userModel");
const consoleManager = require("../../utils/consoleManager");

class UserService {
  async createUser(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      data.createdOn =  Date.now();
      data.updatedOn =  Date.now();

      const user = new User(data);
      await user.save();
      consoleManager.log("User created successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error creating user: ${err.message}`);
      throw err;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error("User not found");
        return null;
      }
      return user;
    } catch (err) {
      consoleManager.error(`Error fetching user: ${err.message}`);
      throw err;
    }
  }

  async updateUser(userId, data) {
    try {
      data.updatedOn = Date.now();
      const user = await User.findByIdAndUpdate(userId, data, { new: true });
      if (!user) {
        consoleManager.error("User not found for update");
        return null;
      }
      consoleManager.log("User updated successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error updating user: ${err.message}`);
      throw err;
    }
  }

  async deleteUser(userId) {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        consoleManager.error("User not found for deletion");
        return null;
      }
      consoleManager.log("User deleted successfully");
      return user;
    } catch (err) {
      consoleManager.error(`Error deleting user: ${err.message}`);
      throw err;
    }
  }

  async getAllUsers(query = {}, page = 1, limit = 20) {
    try {
      // Build the query object for filtering
      const filterQuery = {};
      if (query.name) {
        filterQuery.name = { $regex: query.name, $options: 'i' }; // Case-insensitive search
      }
      if (query.email) {
        filterQuery.email = { $regex: query.email, $options: 'i' }; // Case-insensitive search
      }
  
      // Fetch users with pagination
      const users = await User.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of users for pagination
      const totalUsers = await User.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalUsers / limit);
  
      return {
        users, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalUsers
      };
    } catch (err) {
      consoleManager.error(`Error fetching users: ${err.message}`);
      throw err;
    }
  }
  

  async toggleUserStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        consoleManager.error("User not found for status toggle");
        return null;
      }

      // Toggle the status between 'active' and 'inactive'
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`User status updated to ${newStatus}`);
      return updatedUser;
    } catch (err) {
      consoleManager.error(`Error toggling user status: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfUsers() {
    try {
      const count = await User.countDocuments();
      consoleManager.log(`Number of users: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting users: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new UserService();
