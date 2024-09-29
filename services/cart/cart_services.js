const Cart = require("../../models/cart/cartModel");
const consoleManager = require("../../utils/consoleManager");

class CartService {
  // Create a new cart for a user
  async createCart(userId) {
    try {
      const cart = new Cart({
        userId: userId,
        items: [],
        createdOn: Date.now(),
        updatedOn: Date.now(),
        status: "Active",
      });
      await cart.save();
      consoleManager.log("Cart created successfully");
      return cart;
    } catch (err) {
      consoleManager.error(`Error creating cart: ${err.message}`);
      throw err;
    }
  }

  // Get a cart by user ID
  async getCartByUserId(userId) {
    try {
      const cart = await Cart.findOne({ userId: userId });
      if (!cart) {
        consoleManager.error("Cart not found");
        return null;
      }
      return cart;
    } catch (err) {
      consoleManager.error(`Error fetching cart: ${err.message}`);
      throw err;
    }
  }

  // Update a cart by user ID
  async updateCart(userId, data) {
    try {
      data.updatedOn = Date.now();
      const cart = await Cart.findOneAndUpdate({ userId: userId }, data, {
        new: true,
      });
      if (!cart) {
        consoleManager.error("Cart not found for update");
        return null;
      }
      consoleManager.log("Cart updated successfully");
      return cart;
    } catch (err) {
      consoleManager.error(`Error updating cart: ${err.message}`);
      throw err;
    }
  }

  // Delete a cart by user ID
  async deleteCart(userId) {
    try {
      const cart = await Cart.findOneAndDelete({ userId: userId });
      if (!cart) {
        consoleManager.error("Cart not found for deletion");
        return null;
      }
      consoleManager.log("Cart deleted successfully");
      return cart;
    } catch (err) {
      consoleManager.error(`Error deleting cart: ${err.message}`);
      throw err;
    }
  }

  // Add an item to the cart
  async addItemToCart(userId, items) {
    try {
        const cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            consoleManager.error("Cart not found");
            return null;
        }

        items.forEach(item => {
            // Check if the item with the same variantId already exists
            const existingItem = cart.items.find(cartItem => cartItem.variantId.toString() === item.variantId);
            
            if (existingItem) {
                // If it exists, increase the quantity
                existingItem.quantity += item.quantity; // Ensure the quantity is added
            } else {
                // If it doesn't exist, push the new item into the cart
                cart.items.push(item);
            }
        });

        cart.updatedOn = Date.now();
        
        await cart.save();
        consoleManager.log("Item(s) added to cart successfully");
        return cart;
    } catch (err) {
        consoleManager.error(`Error adding item to cart: ${err.message}`);
        throw err;
    }
}


  // Remove an item from the cart
  async removeItemFromCart(userId, productId, variantId) {
    try {
        const cart = await Cart.findOne({ userId: userId });
        if (!cart) {
            consoleManager.error("Cart not found");
            return null;
        }

        // Filter the item based on both productId and variantId
        cart.items = cart.items.filter(item => 
            item.productId.toString() !== productId || item.variantId.toString() !== variantId
        );

        cart.updatedOn = Date.now();
        await cart.save();
        consoleManager.log("Item variant removed from cart successfully");
        return cart;
    } catch (err) {
        consoleManager.error(`Error removing item from cart: ${err.message}`);
        throw new Error('Failed to remove item from cart');  // Re-throw error for better clarity
    }
}


  // Get all items in the cart
  async getCartItems(userId) {
    try {
      const cart = await Cart.findOne({ userId: userId });
      if (!cart) {
        consoleManager.error("Cart not found");
        return null;
      }
      return cart.items;
    } catch (err) {
      consoleManager.error(`Error fetching cart items: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new CartService();
