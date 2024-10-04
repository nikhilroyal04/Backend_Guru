const express = require('express');
const CartService = require('../../services/cart/cart_services');
const ResponseManager = require('../../utils/responseManager');
const consoleManager = require('../../utils/consoleManager');

const router = express.Router();

// Create a new cart for a user
router.post('/createCart', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return ResponseManager.handleBadRequestError(res, 'User ID is required');
        }

        // Check if the cart already exists for the user
        const existingCart = await CartService.getCartByUserId(userId);

        if (existingCart) {
            return ResponseManager.handleBadRequestError(res, 'Cart already exists for this user');
        }

        // If no existing cart, create a new one
        const cart = await CartService.createCart(userId);
        return ResponseManager.sendSuccess(res, cart, 201, 'Cart created successfully');
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating cart');
    }
});

// Get a cart by user ID
router.get('/getCart/:userId', async (req, res) => {
    try {
        const cart = await CartService.getCartByUserId(req.params.userId);
        if (cart) {
            return ResponseManager.sendSuccess(res, cart, 200, 'Cart retrieved successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Cart not found');
        }
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching cart');
    }
});

// Update a cart by user ID
router.put('/updateCart/:userId', async (req, res) => {
    try {
        const cart = await CartService.updateCart(req.params.userId, req.body);
        if (cart) {
            return ResponseManager.sendSuccess(res, cart, 200, 'Cart updated successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Cart not found for update');
        }
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating cart');
    }
});

// Delete a cart by user ID
router.delete('/deleteCart/:userId', async (req, res) => {
    try {
        const cart = await CartService.deleteCart(req.params.userId);
        if (cart) {
            return ResponseManager.sendSuccess(res, cart, 200, 'Cart deleted successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Cart not found for deletion');
        }
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting cart');
    }
});

// Add an item to the cart
router.post('/addItem/:userId', async (req, res) => {
    try {
        const { items } = req.body;

        if (!items) {
            return ResponseManager.handleBadRequestError(res, 'Invalid items format');
        }

        // Directly use the items array as it is
        const cart = await CartService.addItemToCart(req.params.userId, items);
        return ResponseManager.sendSuccess(res, cart, 200, 'Item(s) added to cart successfully');
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error adding item to cart: ${err.message}`);
    }
});


// Remove an item from the cart
router.delete('/removeItem/:userId/:productId/:variantId', async (req, res) => {
    try {
        const { userId, productId, variantId } = req.params;

        const cart = await CartService.removeItemFromCart(userId, productId, variantId);
        if (cart) {
            return ResponseManager.sendSuccess(res, cart, 200, 'Item variant removed from cart successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Cart not found for item removal');
        }
    } catch (err) {
        console.error('Error removing item:', err);
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error removing item from cart');
    }
});


// Update the quantity of a cart item
router.put('/updateItemQuantity/:userId/:productId/:variantId', async (req, res) => {
    try {
        const { userId, productId, variantId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 0) {
            return ResponseManager.handleBadRequestError(res, 'Invalid quantity');
        }

        const cart = await CartService.updateItemQuantity(userId, productId, variantId, quantity);
        
        if (cart) {
            return ResponseManager.sendSuccess(res, cart, 200, 'Item quantity updated successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Cart or item not found for quantity update');
        }
    } catch (err) {
        consoleManager.error('Error updating item quantity:', err);
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating item quantity');
    }
});


// Get all items in the cart
router.get('/getCartItems/:userId', async (req, res) => {
    try {
        const items = await CartService.getCartItems(req.params.userId);
        if (items) {
            return ResponseManager.sendSuccess(res, items, 200, 'Cart items retrieved successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Cart not found for items retrieval');
        }
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching cart items');
    }
});

module.exports = router;
