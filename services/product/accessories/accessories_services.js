const AccessoryModel = require('../../../models/product/accessories/accessoriesModel');
const consoleManager = require('../../../utils/consoleManager');

class AccessoryService {
    async createAccessory(data) {
        try {
            data.createdOn = Date.now();
            data.updatedOn = Date.now();

            const newAccessory = new AccessoryModel(data);
            await newAccessory.save();
            consoleManager.log("Accessory created successfully");
            return newAccessory;
        } catch (err) {
            consoleManager.error(`Error creating accessory: ${err.message}`);
            throw err;
        }
    }

    async getAccessoryById(accessoryId) {
        try {
            const accessory = await AccessoryModel.findById(accessoryId);
            if (!accessory) {
                consoleManager.error("Accessory not found");
                return null;
            }
            return accessory;
        } catch (err) {
            consoleManager.error(`Error fetching accessory: ${err.message}`);
            throw err;
        }
    }

    async updateAccessory(accessoryId, data) {
        try {
            data.updatedOn = Date.now();
            const updatedAccessory = await AccessoryModel.findByIdAndUpdate(accessoryId, data, { new: true });
            if (!updatedAccessory) {
                consoleManager.error("Accessory not found for update");
                return null;
            }
            consoleManager.log("Accessory updated successfully");
            return updatedAccessory;
        } catch (err) {
            consoleManager.error(`Error updating accessory: ${err.message}`);
            throw err;
        }
    }

    async deleteAccessory(accessoryId) {
        try {
            const deletedAccessory = await AccessoryModel.findByIdAndDelete(accessoryId);
            if (!deletedAccessory) {
                consoleManager.error("Accessory not found for deletion");
                return null;
            }
            consoleManager.log("Accessory deleted successfully");
            return deletedAccessory;
        } catch (err) {
            consoleManager.error(`Error deleting accessory: ${err.message}`);
            throw err;
        }
    }

    async getAllAccessories(query={}, skip = 0, limit = 20) {
        try {
            const accessories = await AccessoryModel.find(query).skip(skip).limit(limit);
            consoleManager.log(`Fetched ${accessories.length} accessories`);
            return accessories;
        } catch (err) {
            consoleManager.error(`Error fetching accessories: ${err.message}`);
            throw err;
        }
    }

    async getActiveAccessories(query = {}, skip = 0, limit = 20) {
        try {
            // Add filter for active status
            const activeQuery = { ...query, status: 'Active' };  
    
            // Fetch active accessories with pagination
            const accessories = await AccessoryModel.find(activeQuery).skip(skip).limit(limit);
            consoleManager.log(`Fetched ${accessories.length} active accessories`);
            return accessories;
        } catch (err) {
            consoleManager.error(`Error fetching accessories: ${err.message}`);
            throw err;
        }
    }
    

    async getTotalCount(query={}) {
        try {
            const count = await AccessoryModel.countDocuments(query);
            consoleManager.log(`Total accessories count: ${count}`);
            return count;
        } catch (err) {
            consoleManager.error(`Error counting accessories: ${err.message}`);
            throw err;
        }
    }

    async toggleAccessoryStatus(accessoryId) {
        try {
            const accessory = await AccessoryModel.findById(accessoryId);
            if (!accessory) {
                consoleManager.error("Accessory not found for status toggle");
                return null;
            }

            const newStatus = accessory.status === "Active" ? "Inactive" : "Active";
            accessory.status = newStatus;
            accessory.updatedOn = Date.now();

            const updatedAccessory = await accessory.save();
            consoleManager.log(`Accessory status updated to ${newStatus}`);
            return updatedAccessory;
        } catch (err) {
            consoleManager.error(`Error toggling accessory status: ${err.message}`);
            throw err;
        }
    }

    async getNumberOfAccessories() {
        try {
            const count = await AccessoryModel.countDocuments();
            consoleManager.log(`Number of accessories: ${count}`);
            return count;
        } catch (err) {
            consoleManager.error(`Error counting accessories: ${err.message}`);
            throw err;
        }
    }
}

module.exports = new AccessoryService();
