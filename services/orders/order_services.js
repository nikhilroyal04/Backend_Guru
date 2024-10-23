const Order = require("../../models/orders/orderModel");
const consoleManager = require("../../utils/consoleManager");

class OrderService {
  // Create a new order
  async createOrder(data) {
    try {
      // Manually set createdOn and updatedOn to current date if not provided
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      const order = new Order(data);
      await order.save();
      consoleManager.log("Order created successfully");
      return order;
    } catch (err) {
      consoleManager.error(`Error creating order: ${err.message}`);
      throw err;
    }
  }

  // Get all orders for a specific user by userId
  async getAllOrdersByUserId(userId) {
    try {
      const orders = await Order.find({ userId }).exec();
      return orders;
    } catch (err) {
      consoleManager.error(
        `Error fetching orders for user ${userId}: ${err.message}`
      );
      throw err;
    }
  }

  // Get an order by its ID
  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        consoleManager.error("Order not found");
        return null;
      }
      return order;
    } catch (err) {
      consoleManager.error(`Error fetching order: ${err.message}`);
      throw err;
    }
  }

  // Update an existing order
  async updateOrder(orderId, data) {
    try {
      data.updatedOn = Date.now();
      const order = await Order.findByIdAndUpdate(orderId, data, { new: true });
      if (!order) {
        consoleManager.error("Order not found for update");
        return null;
      }
      consoleManager.log("Order updated successfully");
      return order;
    } catch (err) {
      consoleManager.error(`Error updating order: ${err.message}`);
      throw err;
    }
  }

  // Delete an order
  async deleteOrder(orderId) {
    try {
      const order = await Order.findByIdAndDelete(orderId);
      if (!order) {
        consoleManager.error("Order not found for deletion");
        return null;
      }
      consoleManager.log("Order deleted successfully");
      return order;
    } catch (err) {
      consoleManager.error(`Error deleting order: ${err.message}`);
      throw err;
    }
  }

  // Get all orders with optional filtering and pagination
  async getAllOrders(query = {}, page = 1, limit = 20) {
    try {
      // Build the query object for filtering
      const filterQuery = {};

      if (query.userId) {
        filterQuery.userId = { $regex: query.userId, $options: "i" };
      }

      if (query.orderStatus) {
        filterQuery.orderStatus = query.orderStatus;
      }

      if (query.createdOn) {
        const date = new Date(query.createdOn);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        filterQuery.createdOn = { $gte: date, $lt: nextDay };
      }

      // Fetch orders with pagination
      const orders = await Order.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

      // Get total number of orders for pagination
      const totalOrders = await Order.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalOrders / limit);

      return {
        orders,
        totalPages,
        currentPage: parseInt(page, 10),
        totalOrders,
      };
    } catch (err) {
      consoleManager.error(`Error fetching orders: ${err.message}`);
      throw err;
    }
  }

  // Toggle the order status (e.g., from 'Pending' to 'Shipped')
  async toggleOrderStatus(orderId, newStatus) {
    try {
      if (
        ![
          "Pending",
          "Shipped",
          "Delivered",
          "Cancelled",
          "Returned",
          "Refunded",
        ].includes(newStatus)
      ) {
        throw new Error("Invalid order status");
      }

      const order = await Order.findById(orderId);
      if (!order) {
        consoleManager.error("Order not found for status update");
        return null;
      }

      order.orderStatus = newStatus;
      order.updatedOn = Date.now();
      await order.save();

      consoleManager.log(`Order status updated to ${newStatus}`);
      return order;
    } catch (err) {
      consoleManager.error(`Error updating order status: ${err.message}`);
      throw err;
    }
  }

  // Get the total number of orders
  async getNumberOfOrders() {
    try {
      const count = await Order.countDocuments();
      consoleManager.log(`Total number of orders: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting orders: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new OrderService();
