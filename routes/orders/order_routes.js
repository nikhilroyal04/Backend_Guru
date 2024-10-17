const express = require('express');
const OrderService = require('../../services/orders/order_services');
const ResponseManager = require('../../utils/responseManager');
const consoleManager = require('../../utils/consoleManager');

const router = express.Router();

// Create a new order
router.post('/addOrder', async (req, res) => {
  try {
    // Ensure the required fields are present
    if (!req.body.userId) {
      return ResponseManager.handleBadRequestError(res, 'User ID is required');
    }

    if (!req.body.productId) {
      return ResponseManager.handleBadRequestError(res, 'Product ID is required');
    }

    if (!req.body.productName) {
      return ResponseManager.handleBadRequestError(res, 'Product name is required');
    }

    if (!req.body.quantity) {
      return ResponseManager.handleBadRequestError(res, 'Quantity is required');
    }

    if (!req.body.amount) {
      return ResponseManager.handleBadRequestError(res, 'Amount is required');
    }

    if (!req.body.shippingAddress || !req.body.billingAddress) {
      return ResponseManager.handleBadRequestError(res, 'Shipping and billing addresses are required');
    }

    // Create the order
    const order = await OrderService.createOrder(req.body);
    return ResponseManager.sendSuccess(res, order, 201, 'Order created successfully');
  } catch (err) {
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating order');
  }
});

// Get all orders for a specific user by userId
router.get('/getUserOrders/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const orders = await OrderService.getAllOrdersByUserId(userId);
  
      if (orders.length === 0) {
        return ResponseManager.sendSuccess(res, [], 200, 'No orders found for this user');
      }
  
      return ResponseManager.sendSuccess(res, orders, 200, 'Orders retrieved successfully');
    } catch (err) {
      consoleManager.error(`Error fetching orders for user ${req.params.userId}: ${err.message}`);
      return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching orders');
    }
  });

// Get an order by ID
router.get('/getOrder/:id', async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    if (order) {
      ResponseManager.sendSuccess(res, order, 200, 'Order retrieved successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'Order not found');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching order');
  }
});

// Update an order by ID
router.put('/updateOrder/:id', async (req, res) => {
  try {
    const order = await OrderService.updateOrder(req.params.id, req.body);
    if (order) {
      return ResponseManager.sendSuccess(res, order, 200, 'Order updated successfully');
    } else {
      return ResponseManager.sendSuccess(res, [], 200, 'Order not found for update');
    }
  } catch (err) {
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating order');
  }
});

// Delete an order by ID
router.delete('/deleteOrder/:id', async (req, res) => {
  try {
    const order = await OrderService.deleteOrder(req.params.id);
    if (order) {
      ResponseManager.sendSuccess(res, order, 200, 'Order deleted successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'Order not found for deletion');
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting order');
  }
});

// Get all orders with optional filters
router.get('/getAllOrders', async (req, res) => {
  try {
    const { productName, orderStatus, page = 1, limit = 20 } = req.query;
    const result = await OrderService.getAllOrders({ productName, orderStatus }, page, limit);

    if (result.orders.length === 0) {
      return ResponseManager.sendSuccess(res, [], 200, 'No orders found');
    }

    return ResponseManager.sendSuccess(
      res,
      {
        orders: result.orders,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalOrders: result.totalOrders
      },
      200,
      'Orders retrieved successfully'
    );
  } catch (err) {
    consoleManager.error(`Error fetching orders: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching orders');
  }
});

// Update order status by ID
router.put('/updateOrderStatus/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return ResponseManager.handleBadRequestError(res, 'Order status is required');
    }

    const order = await OrderService.updateOrderStatus(req.params.id, status);
    if (order) {
      ResponseManager.sendSuccess(res, order, 200, 'Order status updated successfully');
    } else {
      ResponseManager.sendSuccess(res, [], 200, 'Order not found for status update');
    }
  } catch (err) {
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating order status');
  }
});

// Get the count of orders
router.get('/getOrderCount', async (req, res) => {
  try {
    const count = await OrderService.getOrderCount();
    ResponseManager.sendSuccess(res, { orderCount: count }, 200, 'Order count retrieved successfully');
  } catch (err) {
    consoleManager.error(`Error counting orders: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching order count');
  }
});

module.exports = router;
