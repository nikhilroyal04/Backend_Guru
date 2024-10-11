const express = require('express');
const LoginService = require('../../services/auth/auth_services');
const ResponseManager = require('../../utils/responseManager');
const CookieManager = require('../../utils/cookieManager'); 

const router = express.Router();

// User login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return ResponseManager.handleBadRequestError(res, 'Email and password are required');
    }

    // Login the user
    const token = await LoginService.loginUser(email, password);

    // Set the JWT token in a cookie
    CookieManager.setCookie(res, 'authToken', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 1 week

    // Send success response with token only
    ResponseManager.sendSuccess(res, { token }, 200, 'Login successful');
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error logging in user');
  }
});

module.exports = router;
