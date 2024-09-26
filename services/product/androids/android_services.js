const AndroidModel = require("../../../models/product/androids/andriodModel");
const consoleManager = require("../../../utils/consoleManager");
const { calculateDiscount } = require("../../../utils/calculateDiscount");

class AndroidService {
  async createAndroid(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      // Validate that variants contain quantity and price
      if (!data.variants || data.variants.length === 0) {
        throw new Error("At least one variant is required.");
      }

      // Calculate discount for each variant
      data.variants = data.variants.map((variant) => {
        if (variant.originalPrice && variant.price) {
          variant.priceOff = calculateDiscount(
            variant.originalPrice,
            variant.price
          );
        }
        return variant;
      });

      const newAndroid = new AndroidModel(data);
      await newAndroid.save();
      consoleManager.log("Android device created successfully");
      return newAndroid;
    } catch (err) {
      consoleManager.error(`Error creating Android device: ${err.message}`);
      throw err;
    }
  }

  async getAndroidById(androidId) {
    try {
      const android = await AndroidModel.findById(androidId);
      if (!android) {
        consoleManager.error("Android device not found");
        return null;
      }
      return android;
    } catch (err) {
      consoleManager.error(`Error fetching Android device: ${err.message}`);
      throw err;
    }
  }

  async updateAndroid(androidId, data) {
    try {
      data.updatedOn = Date.now();

      if (data.variants && data.variants.length === 0) {
        throw new Error("Variants cannot be empty.");
      }

      // Calculate discount for each variant if variants are present
      if (data.variants) {
        data.variants = data.variants.map((variant) => {
          if (variant.originalPrice && variant.price) {
            variant.priceOff = calculateDiscount(
              variant.originalPrice,
              variant.price
            );
          }
          return variant;
        });
      }

      const updatedAndroid = await AndroidModel.findByIdAndUpdate(
        androidId,
        data,
        { new: true }
      );
      if (!updatedAndroid) {
        consoleManager.error("Android device not found for update");
        return null;
      }
      consoleManager.log("Android device updated successfully");
      return updatedAndroid;
    } catch (err) {
      consoleManager.error(`Error updating Android device: ${err.message}`);
      throw err;
    }
  }

  async deleteAndroid(androidId) {
    try {
      const deletedAndroid = await AndroidModel.findByIdAndDelete(androidId);
      if (!deletedAndroid) {
        consoleManager.error("Android device not found for deletion");
        return null;
      }
      consoleManager.log("Android device deleted successfully");
      return deletedAndroid;
    } catch (err) {
      consoleManager.error(`Error deleting Android device: ${err.message}`);
      throw err;
    }
  }

  async getAllAndroids(query = {}, skip = 0, limit = 20) {
    try {
      const androids = await AndroidModel.find(query).skip(skip).limit(limit);
      consoleManager.log(`Fetched ${androids.length} Android devices`);
      return androids;
    } catch (err) {
      consoleManager.error(`Error fetching Android devices: ${err.message}`);
      throw err;
    }
  }

  async getActiveAndroids(query = {}, skip = 0, limit = 20) {
    try {
      // Add filter for active status
      const activeQuery = { ...query, status: "Active" };

      // Fetch active Android devices with pagination
      const androids = await AndroidModel.find(activeQuery)
        .skip(skip)
        .limit(limit);
      consoleManager.log(`Fetched ${androids.length} Android devices`);
      return androids;
    } catch (err) {
      consoleManager.error(`Error fetching Android devices: ${err.message}`);
      throw err;
    }
  }

  async getTotalCount(query = {}) {
    try {
      const count = await AndroidModel.countDocuments(query);
      consoleManager.log(`Total Android devices count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting Android devices: ${err.message}`);
      throw err;
    }
  }

  async toggleAndroidStatus(androidId) {
    try {
      const android = await AndroidModel.findById(androidId);
      if (!android) {
        consoleManager.error("Android device not found for status toggle");
        return null;
      }

      const newStatus = android.status === "Active" ? "Inactive" : "Active";
      android.status = newStatus;
      android.updatedOn = Date.now();

      const updatedAndroid = await android.save();
      consoleManager.log(`Android device status updated to ${newStatus}`);
      return updatedAndroid;
    } catch (err) {
      consoleManager.error(`Error toggling Android status: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfAndroids() {
    try {
      const count = await AndroidModel.countDocuments();
      consoleManager.log(`Number of Android devices: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting Android devices: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new AndroidService();
