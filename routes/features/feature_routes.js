const express = require("express");
const FeatureService = require("../../services/features/feature_services");
const ResponseManager = require("../../utils/responseManager");
const consoleManager = require("../../utils/consoleManager");

const router = express.Router();

// Create a new feature
router.post("/addFeature", async (req, res) => {
  try {
    if (!req.body.name) {
      return ResponseManager.handleBadRequestError(res, "Name is required");
    }

    const feature = await FeatureService.createFeature(req.body);
    return ResponseManager.sendSuccess(
      res,
      feature,
      201,
      "Feature created successfully"
    );
  } catch (err) {
    return ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error creating feature"
    );
  }
});

// Get a feature by ID
router.get("/getFeature/:id", async (req, res) => {
  try {
    const feature = await FeatureService.getFeatureById(req.params.id);
    if (feature) {
      return ResponseManager.sendSuccess(
        res,
        feature,
        200,
        "Feature retrieved successfully"
      );
    } else {
      return ResponseManager.sendSuccess(res, [], 200, "Feature not found");
    }
  } catch (err) {
    return ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error fetching feature"
    );
  }
});

// Update a feature by ID
router.put("/updateFeature/:id", async (req, res) => {
  try {
    if (!req.body.name) {
      return ResponseManager.handleBadRequestError(res, "Name is required");
    }

    const feature = await FeatureService.updateFeature(req.params.id, req.body);
    if (feature) {
      return ResponseManager.sendSuccess(
        res,
        feature,
        200,
        "Feature updated successfully"
      );
    } else {
      return ResponseManager.sendSuccess(
        res,
        [],
        200,
        "Feature not found for update"
      );
    }
  } catch (err) {
    return ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error updating feature"
    );
  }
});

// Delete a feature by ID
router.delete("/deleteFeature/:id", async (req, res) => {
  try {
    const feature = await FeatureService.deleteFeature(req.params.id);
    if (feature) {
      return ResponseManager.sendSuccess(
        res,
        feature,
        200,
        "Feature deleted successfully"
      );
    } else {
      return ResponseManager.sendSuccess(
        res,
        [],
        200,
        "Feature not found for deletion"
      );
    }
  } catch (err) {
    return ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error deleting feature"
    );
  }
});

// Get all features
router.get("/getAllFeatures", async (req, res) => {
  try {
    const { name, page = 1, limit = 20 } = req.query;

    const result = await FeatureService.getAllFeatures({ name }, page, limit);
    if (result.length === 0) {
      return ResponseManager.sendSuccess(res, [], 200, "No features found");
    }

    return ResponseManager.sendSuccess(
      res,
      {
        features: result.features,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalFeatures: result.totalFeatures,
      },
      200,
      "Features retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching features: ${err.message}`);
    return ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error fetching features"
    );
  }
});

// Toggle feature status
router.put("/removeFeature/:id", async (req, res) => {
  try {
    const feature = await FeatureService.toggleFeatureStatus(req.params.id);
    if (feature) {
      ResponseManager.sendSuccess(
        res,
        feature,
        200,
        "Feature status toggled successfully"
      );
    } else {
      ResponseManager.sendSuccess(res, [], 200, "Feature not found for toggle");
    }
  } catch (err) {
    ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error toggling feature status"
    );
  }
});

// Get the total number of features
router.get("/countFeatures", async (req, res) => {
  try {
    const count = await FeatureService.getNumberOfFeatures();
    return ResponseManager.sendSuccess(
      res,
      count,
      200,
      "Total number of features retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error counting features: ${err.message}`);
    return ResponseManager.sendError(
      res,
      500,
      "INTERNAL_ERROR",
      "Error counting features"
    );
  }
});

module.exports = router;
