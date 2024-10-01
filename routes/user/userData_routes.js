const express = require("express");
const router = express.Router();
const userDataService = require("../../services/user/userData_services"); 
const ResponseManager = require("../../utils/responseManager");
const consoleManager = require("../../utils/consoleManager");



router.post("/userData/create/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Call the createUserData service method
    const userData = await userDataService.createUserData(userId);
    
    if (userData) {
      ResponseManager.sendSuccess(res, userData, 201, "User data created successfully");
    } else {
      ResponseManager.sendSuccess(res, null, 404, "User not found, UserData not created");
    }
  } catch (err) {
    consoleManager.error(`Error creating user data: ${err.message}`);
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error creating user data");
  }
});


// Add Address for a user
router.post("/addresses/addAddress/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const addressData = req.body;

    // Validate input (you can add more specific validations as needed)
    if (!addressData.name || !addressData.phoneNumber) {
      return ResponseManager.handleBadRequestError(
        res,
        "Name and phone are required for address"
      );
    }

    const userData = await userDataService.addAddress(userId, addressData);
    ResponseManager.sendSuccess(
      res,
      userData,
      201,
      "Address added successfully"
    );
  } catch (err) {
    consoleManager.error(`Error adding address: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error adding address"
    );
  }
});

// Update Address for a user
router.put("/addresses/updateAddress/:userId/:addressId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const addressData = req.body;

    const userData = await userDataService.updateAddress(
      userId,
      addressId,
      addressData
    );
    if (userData) {
      ResponseManager.sendSuccess(
        res,
        userData,
        200,
        "Address updated successfully"
      );
    } else {
      ResponseManager.sendSuccess(
        res,
        null,
        404,
        "Address not found for update"
      );
    }
  } catch (err) {
    consoleManager.error(`Error updating address: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error updating address"
    );
  }
});

// Delete Address for a user
router.delete("/addresses/deleteAddress/:userId/:addressId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const userData = await userDataService.deleteAddress(userId, addressId);
    if (userData) {
      ResponseManager.sendSuccess(
        res,
        userData,
        200,
        "Address deleted successfully"
      );
    } else {
      ResponseManager.sendSuccess(
        res,
        null,
        200,
        "Address not found for deletion"
      );
    }
  } catch (err) {
    consoleManager.error(`Error deleting address: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error deleting address"
    );
  }
});

// Get all addresses for a user
router.get("/addresses/getAddress/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const addresses = await userDataService.getAddresses(userId);
    ResponseManager.sendSuccess(
      res,
      addresses,
      200,
      "Addresses retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching addresses: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error fetching addresses"
    );
  }
});

/** 
 * Orders Routes
 * Base URL: /api/v1/orders
 */

// Add Order for a user
router.post("/orders/addOrder/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderData = req.body;

    // Validate input
    if (!orderData.productId || !orderData.productName) {
      return ResponseManager.handleBadRequestError(
        res,
        "Product ID, name, and amount are required"
      );
    }

    const userData = await userDataService.addOrder(userId, orderData);
    ResponseManager.sendSuccess(res, userData, 201, "Order added successfully");
  } catch (err) {
    consoleManager.error(`Error adding order: ${err.message}`);
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error adding order");
  }
});

// Update Order for a user
router.put("/orders/updateOrder/:userId/:orderId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    const { orderStatus } = req.body; // Destructure only orderStatus from request body

    // Validate input
    if (typeof orderStatus !== "string" || orderStatus.trim() === "") {
      return ResponseManager.handleBadRequestError(
        res,
        "Order status must be provided as a non-empty string"
      );
    }

    const userData = await userDataService.updateOrder(userId, orderId, { orderStatus });
    if (userData) {
      ResponseManager.sendSuccess(
        res,
        userData,
        200,
        "Order status updated successfully"
      );
    } else {
      ResponseManager.sendSuccess(res, null, 404, "Order not found for update");
    }
  } catch (err) {
    consoleManager.error(`Error updating order: ${err.message}`);
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error updating order");
  }
});


// Delete Order for a user
router.delete("/orders/deleteOrder/:userId/:orderId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orderId = req.params.orderId;
    const userData = await userDataService.deleteOrder(userId, orderId);
    if (userData) {
      ResponseManager.sendSuccess(
        res,
        userData,
        200,
        "Order deleted successfully"
      );
    } else {
      ResponseManager.sendSuccess(
        res,
        null,
        404,
        "Order not found for deletion"
      );
    }
  } catch (err) {
    consoleManager.error(`Error deleting order: ${err.message}`);
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error deleting order");
  }
});

// Get all orders for a user
router.get("/orders/getOrders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await userDataService.getOrders(userId);
    ResponseManager.sendSuccess(
      res,
      orders,
      200,
      "Orders retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching orders: ${err.message}`);
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error fetching orders");
  }
});

// Get User Data by ID
router.get("/getData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const userData = await userDataService.getUserDataById(id);
    ResponseManager.sendSuccess(
      res,
      userData,
      200,
      "User data retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching user data: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error fetching user data"
    );
  }
});

// Get User Data by User ID
router.get("/userId/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userData = await userDataService.getUserDataByUserId(userId);
    ResponseManager.sendSuccess(
      res,
      userData,
      200,
      "User data retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching user data: ${err.message}`);
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error fetching user data"
    );
  }
});

module.exports = router;
