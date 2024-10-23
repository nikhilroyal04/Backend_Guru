const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/user/userModel");
const RoleService = require("../../services/role/role_Services"); // Import your RoleService
const ResponseManager = require("../../utils/responseManager");
const consoleManager = require("../../utils/consoleManager");
const { decrypt } = require("../../utils/encryptionUtils");

const router = express.Router();

// Middleware to verify JWT token from Authorization header
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return ResponseManager.handleUnauthorizedError(res, "No token provided");

  // Decrypt the token
  let decryptedToken;
  try {
    decryptedToken = decrypt(token);
  } catch (error) {
    consoleManager.error("Failed to decrypt token");
    return ResponseManager.handleUnauthorizedError(res, "Invalid token");
  }

  // Verify the decrypted token
  jwt.verify(decryptedToken, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      consoleManager.error("Invalid token");
      return ResponseManager.handleUnauthorizedError(res, "Invalid token");
    }
    req.user = user;
    next();
  });
};

// Get profile route
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // Fetch user details from database using the decoded token's user ID
    const user = await User.findById(req.user.id);
    if (!user) {
      consoleManager.error("User not found");
      return ResponseManager.handleNotFoundError(res, "User not found");
    }

    // Fetch role details using the role ID from user
    const roleAttribute = await RoleService.getRoleByName(user.role);
    if (!roleAttribute) {
      consoleManager.error("Role not found for user");
      return ResponseManager.handleNotFoundError(res, "Role not found");
    }

    // Prepare user profile response including role attributes
    const userProfile = {
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

    // Send success response with user profile details
    ResponseManager.sendSuccess(
      res,
      userProfile,
      200,
      "Profile details retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching user profile: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error fetching user profile"
    );
  }
});

module.exports = router;
