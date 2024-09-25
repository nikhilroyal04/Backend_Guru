const express = require('express');
const CouponService = require('../../services/coupon/coupon_services');
const ResponseManager = require('../../utils/responseManager');
const consoleManager = require('../../utils/consoleManager');

const router = express.Router();

// Create a new coupon
router.post('/addCoupon', async (req, res) => {
    try {
        if (!req.body.code) {
            return ResponseManager.handleBadRequestError(res, 'Coupon code is required');
        }

        const coupon = await CouponService.createCoupon(req.body);
        return ResponseManager.sendSuccess(res, coupon, 201, 'Coupon created successfully');
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating coupon');
    }
});

// Get a coupon by ID
router.get('/getCoupon/:id', async (req, res) => {
    try {
        const coupon = await CouponService.getCouponById(req.params.id);
        if (coupon) {
            ResponseManager.sendSuccess(res, coupon, 200, 'Coupon retrieved successfully');
        } else {
            ResponseManager.sendSuccess(res, [], 200, 'Coupon not found');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching coupon');
    }
});

// Update a coupon by ID
router.put('/updateCoupon/:id', async (req, res) => {
    try {
        if (!req.body.code) {
            return ResponseManager.handleBadRequestError(res, 'Coupon code is required');
        }

        const coupon = await CouponService.updateCoupon(req.params.id, req.body);
        if (coupon) {
            return ResponseManager.sendSuccess(res, coupon, 200, 'Coupon updated successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Coupon not found for update');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating coupon');
    }
});

// Delete a coupon by ID
router.delete('/deleteCoupon/:id', async (req, res) => {
    try {
        const coupon = await CouponService.deleteCoupon(req.params.id);
        if (coupon) {
            ResponseManager.sendSuccess(res, coupon, 200, 'Coupon deleted successfully');
        } else {
            ResponseManager.sendSuccess(res, [], 200, 'Coupon not found for deletion');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting coupon');
    }
});

// Get all coupons
router.get('/getAllCoupons', async (req, res) => {
    try {
        const coupons = await CouponService.getAllCoupons();
        if (coupons.length === 0) {
            return ResponseManager.sendSuccess(res, [], 200, 'No coupons found');
        }

        return ResponseManager.sendSuccess(res, coupons, 200, 'Coupons retrieved successfully');
    } catch (err) {
        consoleManager.error(`Error fetching coupons: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching coupons');
    }
});

// Toggle coupon status
router.put('/removeCoupon/:id', async (req, res) => {
    try {
        const coupon = await CouponService.toggleCouponStatus(req.params.id);
        if (coupon) {
            ResponseManager.sendSuccess(res, coupon, 200, 'Coupon status updated successfully');
        } else {
            ResponseManager.sendSuccess(res, [], 200, 'Coupon not found for status update');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error toggling coupon status');
    }
});

// Get the total number of coupons
router.get('/countCoupons', async (req, res) => {
    try {
        const count = await CouponService.getNumberOfCoupons();
        ResponseManager.sendSuccess(res, { count }, 200, 'Number of coupons retrieved successfully');
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error counting coupons');
    }
});

router.post('/applyCoupon/:id', async (req, res) => {
    try {
        const coupon = await CouponService.getCouponById(req.params.id);
        if (!coupon) {
            return ResponseManager.sendError(res, 404, 'NOT_FOUND', 'Coupon not found');
        }

        // Check if the coupon is valid and applicable
        if (coupon.currentRedemptions >= coupon.maxRedemptions) {
            return ResponseManager.sendError(res, 400, 'LIMIT_EXCEEDED', 'Coupon usage limit exceeded');
        }

        // If the coupon is valid, increment its usage count
        await CouponService.incrementUsageCount(coupon._id);
        
        return ResponseManager.sendSuccess(res, coupon, 200, 'Coupon applied successfully');
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error applying coupon');
    }
});

module.exports = router;
