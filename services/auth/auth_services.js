const User = require("../../models/user/userModel");
const jwt = require("jsonwebtoken");
const consoleManager = require("../../utils/consoleManager");
const RoleService = require("../role/role_Services");

class LoginService {
  async loginUser(email, password) {
    try {
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        consoleManager.error("User not found");
        throw new Error("User not found");
      }

      // Compare the provided password with the stored password
      if (user.password !== password) {
        consoleManager.error("Invalid password");
        throw new Error("Invalid password");
      }

      // Generate a JWT token with user details
      const roleAttribute = await RoleService.getRoleByName(user.role)

      const payload = {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        roleAttribute: roleAttribute,
        status: user.status,
        createdOn: user.createdOn,
        updatedOn: user.updatedOn,
        reason: user.createdBy,
      };

      // Use environment variables for secret and expiration time
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      consoleManager.log("User logged in successfully");

      return token; // Return only the token
    } catch (err) {
      consoleManager.error(`Error logging in user: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new LoginService();
