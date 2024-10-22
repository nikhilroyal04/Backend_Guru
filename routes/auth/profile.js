const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/user/userModel");
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

    // Send success response with user profile details
    ResponseManager.sendSuccess(
      res,
      user,
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
