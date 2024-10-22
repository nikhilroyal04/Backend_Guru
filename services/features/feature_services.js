const Feature = require("../../models/features/featureModel");
const consoleManager = require("../../utils/consoleManager");

class FeatureService {
  // Create a new feature
  async createFeature(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      const feature = new Feature(data);
      await feature.save();
      consoleManager.log("Feature created successfully");
      return feature;
    } catch (err) {
      consoleManager.error(`Error creating feature: ${err.message}`);
      throw err;
    }
  }

  // Get a feature by ID
  async getFeatureById(featureId) {
    try {
      const feature = await Feature.findById(featureId);
      if (!feature) {
        consoleManager.error("Feature not found");
        return null;
      }
      return feature;
    } catch (err) {
      consoleManager.error(`Error fetching feature: ${err.message}`);
      throw err;
    }
  }

  // Update a feature by ID
  async updateFeature(featureId, data) {
    try {
      data.updatedOn = Date.now();
      const feature = await Feature.findByIdAndUpdate(featureId, data, {
        new: true,
      });
      if (!feature) {
        consoleManager.error("Feature not found for update");
        return null;
      }
      consoleManager.log("Feature updated successfully");
      return feature;
    } catch (err) {
      consoleManager.error(`Error updating feature: ${err.message}`);
      throw err;
    }
  }

  // Delete a feature by ID
  async deleteFeature(featureId) {
    try {
      const feature = await Feature.findByIdAndDelete(featureId);
      if (!feature) {
        consoleManager.error("Feature not found for deletion");
        return null;
      }
      consoleManager.log("Feature deleted successfully");
      return feature;
    } catch (err) {
      consoleManager.error(`Error deleting feature: ${err.message}`);
      throw err;
    }
  }

  // Get all features
  async getAllFeatures(query = {}, page = 1, limit = 20) {
    try {
      const filterQuery = {};

      if (query.name) {
        filterQuery.name = { $regex: query.name, $options: "i" };
      }

      const features = await Feature.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

      const totalFeatures = await Feature.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalFeatures / limit);

      consoleManager.log(`Fetched ${features.length} features`);
      return {
        features,
        totalPages,
        currentPage: parseInt(page, 10),
        totalFeatures,
      };
    } catch (err) {
      consoleManager.error(`Error fetching features: ${err.message}`);
      throw err;
    }
  }

  // Toggle feature status between Active and Inactive
  async toggleFeatureStatus(featureId) {
    try {
      const feature = await Feature.findById(featureId);
      if (!feature) {
        consoleManager.error("Feature not found for status toggle");
        return null;
      }

      // Toggle the status between 'Active' and 'Inactive'
      const newStatus = feature.status === "Active" ? "Inactive" : "Active";
      const updatedFeature = await Feature.findByIdAndUpdate(
        featureId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`Feature status updated to ${newStatus}`);
      return updatedFeature;
    } catch (err) {
      consoleManager.error(`Error toggling feature status: ${err.message}`);
      throw err;
    }
  }

  // Get the total number of features
  async getNumberOfFeatures() {
    try {
      const count = await Feature.countDocuments();
      consoleManager.log(`Number of features: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting features: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new FeatureService();
