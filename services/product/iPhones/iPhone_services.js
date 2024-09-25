const iPhoneModel = require("../../../models/product/iPhones/iPhoneModel");
const consoleManager = require("../../../utils/consoleManager");

class iPhoneService {
  async createiPhone(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      // Validate that variants contain quantity and price
      if (!data.variants || data.variants.length === 0) {
        throw new Error("At least one variant is required.");
      }

      const newIPhone = new iPhoneModel(data);
      await newIPhone.save();
      consoleManager.log("iPhone created successfully");
      return newIPhone;
    } catch (err) {
      consoleManager.error(`Error creating iPhone: ${err.message}`);
      throw err;
    }
  }

  async getiPhoneById(iPhoneId) {
    try {
      const iPhone = await iPhoneModel.findById(iPhoneId);
      if (!iPhone) {
        consoleManager.error("iPhone not found");
        return null;
      }
      return iPhone;
    } catch (err) {
      consoleManager.error(`Error fetching iPhone: ${err.message}`);
      throw err;
    }
  }

  async updateiPhone(iPhoneId, data) {
    try {
      data.updatedOn = Date.now();

      if (data.variants && data.variants.length === 0) {
        throw new Error("Variants cannot be empty.");
      }

      const updatedIPhone = await iPhoneModel.findByIdAndUpdate(iPhoneId, data, {
        new: true,
      });
      if (!updatedIPhone) {
        consoleManager.error("iPhone not found for update");
        return null;
      }
      consoleManager.log("iPhone updated successfully");
      return updatedIPhone;
    } catch (err) {
      consoleManager.error(`Error updating iPhone: ${err.message}`);
      throw err;
    }
  }

  async deleteiPhone(iPhoneId) {
    try {
      const deletedIPhone = await iPhoneModel.findByIdAndDelete(iPhoneId);
      if (!deletedIPhone) {
        consoleManager.error("iPhone not found for deletion");
        return null;
      }
      consoleManager.log("iPhone deleted successfully");
      return deletedIPhone;
    } catch (err) {
      consoleManager.error(`Error deleting iPhone: ${err.message}`);
      throw err;
    }
  }

  async getAlliPhones(query = {}, skip = 0, limit = 20) {
    try {
      const iPhones = await iPhoneModel.find(query).skip(skip).limit(limit);
      consoleManager.log(`Fetched ${iPhones.length} iPhones`);
      return iPhones;
    } catch (err) {
      consoleManager.error(`Error fetching iPhones: ${err.message}`);
      throw err;
    }
  }  

  async getTotalCount(query = {}) {
    try {
      const count = await iPhoneModel.countDocuments(query);
      consoleManager.log(`Total iPhones count: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting iPhones: ${err.message}`);
      throw err;
    }
  }

  async toggleiPhoneStatus(iPhoneId) {
    try {
      const iPhone = await iPhoneModel.findById(iPhoneId);
      if (!iPhone) {
        consoleManager.error("iPhone not found for status toggle");
        return null;
      }

      // Check and update the stock quantity for each variant
      iPhone.variants.forEach((variant) => {
        if (variant.quantity <= 0) {
          iPhone.status = "soldout";
        }
      });

      const newStatus =
        iPhone.status === "available" ? "soldout" : "available";
      iPhone.status = newStatus;
      iPhone.updatedOn = Date.now();

      const updatediPhone = await iPhone.save();

      consoleManager.log(`iPhone status updated to ${newStatus}`);
      return updatediPhone;
    } catch (err) {
      consoleManager.error(`Error toggling iPhone status: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfiPhones() {
    try {
      const count = await iPhoneModel.countDocuments();
      consoleManager.log(`Number of iPhones: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting iPhones: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new iPhoneService();
