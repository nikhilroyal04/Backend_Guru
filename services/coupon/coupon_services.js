const Coupon = require("../../models/coupon/couponModel");
const consoleManager = require("../../utils/consoleManager");

class CouponService {
  // Create a new coupon
  async createCoupon(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      const coupon = new Coupon(data);
      await coupon.save();
      consoleManager.log("Coupon created successfully");
      return coupon;
    } catch (err) {
      consoleManager.error(`Error creating coupon: ${err.message}`);
      throw err;
    }
  }

  // Get a coupon by ID
  async getCouponById(couponId) {
    try {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        consoleManager.error("Coupon not found");
        return null;
      }
      return coupon;
    } catch (err) {
      consoleManager.error(`Error fetching coupon: ${err.message}`);
      throw err;
    }
  }

  // Update a coupon by ID
  async updateCoupon(couponId, data) {
    try {
      data.updatedOn = Date.now();
      const coupon = await Coupon.findByIdAndUpdate(couponId, data, {
        new: true,
      });
      if (!coupon) {
        consoleManager.error("Coupon not found for update");
        return null;
      }
      consoleManager.log("Coupon updated successfully");
      return coupon;
    } catch (err) {
      consoleManager.error(`Error updating coupon: ${err.message}`);
      throw err;
    }
  }

  // Delete a coupon by ID
  async deleteCoupon(couponId) {
    try {
      const coupon = await Coupon.findByIdAndDelete(couponId);
      if (!coupon) {
        consoleManager.error("Coupon not found for deletion");
        return null;
      }
      consoleManager.log("Coupon deleted successfully");
      return coupon;
    } catch (err) {
      consoleManager.error(`Error deleting coupon: ${err.message}`);
      throw err;
    }
  }

  // Get all coupons
  async getAllCoupons() {
    try {
      const coupons = await Coupon.find();
      consoleManager.log(`Fetched ${coupons.length} coupons`);
      return coupons;
    } catch (err) {
      consoleManager.error(`Error fetching coupons: ${err.message}`);
      throw err;
    }
  }

  //Get Active Coupon

  async getActiveCoupons() {
    try {
        // Fetch only active coupons
        const coupons = await Coupon.find({ status: 'Active' });
        consoleManager.log(`Fetched ${coupons.length} coupons`);
        return coupons;
    } catch (err) {
        consoleManager.error(`Error fetching coupons: ${err.message}`);
        throw err;
    }
}


  // Toggle coupon status between Active and Inactive
  async toggleCouponStatus(couponId) {
    try {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        consoleManager.error("Coupon not found for status toggle");
        return null;
      }

      // Toggle the status between 'Active' and 'Inactive'
      const newStatus = coupon.status === "Active" ? "Inactive" : "Active";
      const updatedCoupon = await Coupon.findByIdAndUpdate(
        couponId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`Coupon status updated to ${newStatus}`);
      return updatedCoupon;
    } catch (err) {
      consoleManager.error(`Error toggling coupon status: ${err.message}`);
      throw err;
    }
  }

  // Get the total number of coupons
  async getNumberOfCoupons() {
    try {
      const count = await Coupon.countDocuments();
      consoleManager.log(`Number of coupons: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting coupons: ${err.message}`);
      throw err;
    }
  }

  async incrementUsageCount(couponId) {
    try {
      const coupon = await Coupon.findById(couponId);

      if (!coupon) {
        consoleManager.error("Coupon not found for incrementing usage count");
        return null;
      }

      // Check if the current redemptions exceed the maximum allowed
      if (coupon.currentRedemptions >= coupon.maxRedemptions) {
        consoleManager.error("Coupon usage limit exceeded");
        throw new Error("Coupon usage limit exceeded");
      }

      // Increment the currentRedemptions and usageCount
      coupon.currentRedemptions += 1;
      coupon.usageCount += 1;
      await coupon.save();

      consoleManager.log(`Coupon usage count incremented: ${coupon.code}`);
      return coupon;
    } catch (err) {
      consoleManager.error(
        `Error incrementing coupon usage count: ${err.message}`
      );
      throw err;
    }
  }
}

module.exports = new CouponService();
