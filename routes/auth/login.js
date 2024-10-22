const express = require("express");
const LoginService = require("../../services/auth/auth_services");
const ResponseManager = require("../../utils/responseManager");

const router = express.Router();

// User login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return ResponseManager.handleBadRequestError(
        res,
        "Email and password are required"
      );
    }

    // Login the user and generate JWT token
    const token = await LoginService.loginUser(email, password);

    // Send success response with the token
    ResponseManager.sendSuccess(res, { token }, 200, "Login successful");
  } catch (err) {
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error logging in user"
    );
  }
});

module.exports = router;
