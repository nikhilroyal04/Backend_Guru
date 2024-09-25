const express = require('express');
const multer = require('multer');
const iPhoneService = require('../../../services/product/iPhones/iPhone_services');
const ConsoleManager = require('../../../utils/consoleManager');
const ResponseManager = require('../../../utils/responseManager');
const fileUploaderController = require('../../../controller/mediaUploader');
const router = express.Router();

// Configure multer for multiple image uploads (limit of 6)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { files: 6 } });

// Create a new iPhone listing
router.post('/addiPhone', upload.array('media', 6), async (req, res) => {
  try {
    const {
      model, releaseYear, features, status, condition, warranty, addOn,
      purchaseDate, age, repaired, categoryName, variants
    } = req.body;

    // Validate required fields
    if (!model) return ResponseManager.handleBadRequestError(res, 'Model is required');
    if (!releaseYear) return ResponseManager.handleBadRequestError(res, 'Release Year is required');
    if (!features) return ResponseManager.handleBadRequestError(res, 'Features are required');
    if (!condition) return ResponseManager.handleBadRequestError(res, 'Condition is required');
    if (!age) return ResponseManager.handleBadRequestError(res, 'Age is required');
    if (!categoryName) return ResponseManager.handleBadRequestError(res, 'Category Name is required');
    if (!variants) return ResponseManager.handleBadRequestError(res, 'Variants are required');

    // Process images for the iPhone media
    const mediaFiles = req.files;
    const mediaUrls = [];

    for (const file of mediaFiles) {
      try {
        const imageUrl = await fileUploaderController.uploadMedia(file.buffer);
        mediaUrls.push(imageUrl);
      } catch (error) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Failed to upload image: ${error}`);
      }
    }

    // Parse and validate variants (Array of objects)
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        return ResponseManager.handleBadRequestError(res, 'At least one variant is required');
      }
      parsedVariants.forEach(variant => {
        if (!variant.color || !variant.storage || !variant.price || variant.quantity === undefined || !variant.batteryHealth) {
          throw new Error('Each variant must include color, storage, price, quantity, and battery health');
        }
      });
    } catch (error) {
      return ResponseManager.handleBadRequestError(res, 'Invalid variants format');
    }

    // Create a new iPhone listing
    const iPhoneData = await iPhoneService.createiPhone({
      model, releaseYear, media: mediaUrls, features, status,
      condition, warranty, addOn, purchaseDate, age, repaired, categoryName,
      variants: parsedVariants
    });

    ConsoleManager.log(`iPhone created: ${JSON.stringify(iPhoneData)}`);
    return ResponseManager.sendSuccess(res, iPhoneData, 201, 'iPhone created successfully');
  } catch (err) {
    ConsoleManager.error(`Error creating iPhone: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error creating iPhone: ${err.message}`);
  }
});

// Get all iPhones with query parameters
router.get('/getAlliPhones', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      model, 
      color, 
      storage, 
      price, 
      batteryHealth, 
      repaired, 
      age 
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (model) {
      query.model = { $eq: model.toLowerCase() };  // Exact match for model (case-insensitive)
    }

    if (repaired) {
      query.repaired = repaired === 'true' ? 'Yes' : 'No';  // Exact match for repaired status (Yes/No)
    }

    if (age) {
      query.age = { $eq: age.toLowerCase() };  // Exact match for age (case-insensitive)
    }

    // Fetch the iPhones based on the initial query (without filtering variants yet)
    const iPhones = await iPhoneService.getAlliPhones(query, skip, limitNumber);

    const filteredIPhones = iPhones.map(iPhone => {
      let matchingVariants = iPhone.variants;

      // Normalize the iPhone properties for filtering
      const normalizedColor = color ? color.toLowerCase() : null;
      const normalizedStorage = storage ? storage.toLowerCase() : null;
      const normalizedPrice = price ? price.toString() : null;  // Keep as string
      const normalizedBatteryHealth = batteryHealth ? batteryHealth.toLowerCase() : null;  // Keep as string

      // Filter variants based on color
      if (normalizedColor) {
        matchingVariants = matchingVariants.filter(variant =>
          variant.color.toLowerCase() === normalizedColor
        );
      }

      // Further filter based on storage
      if (normalizedStorage) {
        matchingVariants = matchingVariants.filter(variant =>
          variant.storage.toLowerCase() === normalizedStorage
        );
      }

      // Filter based on price (string comparison)
      if (normalizedPrice) {
        matchingVariants = matchingVariants.filter(variant =>
          variant.price <= normalizedPrice  // String comparison
        );
      }

      // Filter based on battery health (exact match)
      if (normalizedBatteryHealth) {
        matchingVariants = matchingVariants.filter(variant =>
          variant.batteryHealth === normalizedBatteryHealth  // Exact match
        );
      }

      // Return iPhone with only the matching variants
      return { ...iPhone._doc, variants: matchingVariants };
    }).filter(iPhone => iPhone.variants.length > 0);  // Remove iPhones with no matching variants

    // Calculate the total count of iPhones based on the filtered results
    const totalCount = filteredIPhones.length;

    return ResponseManager.sendSuccess(res, {
      iPhones: filteredIPhones,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount,
    }, 200, 'iPhones fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching iPhones: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching iPhones: ${err.message}`);
  }
});


// Get an iPhone by ID
router.get('/getiPhone/:id', async (req, res) => {
  try {
    const iPhone = await iPhoneService.getiPhoneById(req.params.id);
    if (!iPhone) {
      return ResponseManager.sendSuccess(res, [], 200, 'iPhone not found');
    }
    ConsoleManager.log(`iPhone fetched: ${JSON.stringify(iPhone)}`);
    return ResponseManager.sendSuccess(res, iPhone, 200, 'iPhone fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching iPhone: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching iPhone: ${err.message}`);
  }
});

// Update an iPhone by ID
router.put('/updateiPhone/:id', upload.array('media', 6), async (req, res) => {
  try {
    const {
      model, releaseYear, features, status, condition, warranty, addOn,
      purchaseDate, age, repaired, categoryName, variants
    } = req.body;

    // Validate required fields
    if (!model) return ResponseManager.handleBadRequestError(res, 'Model is required');
    if (!releaseYear) return ResponseManager.handleBadRequestError(res, 'Release Year is required');
    if (!features) return ResponseManager.handleBadRequestError(res, 'Features are required');
    if (!condition) return ResponseManager.handleBadRequestError(res, 'Condition is required');
    if (!age) return ResponseManager.handleBadRequestError(res, 'Age is required');
    if (!categoryName) return ResponseManager.handleBadRequestError(res, 'Category Name is required');
    if (!variants) return ResponseManager.handleBadRequestError(res, 'Variants are required');

    // Process images
    const mediaFiles = req.files;
    const mediaUrls = [];

    for (const file of mediaFiles) {
      try {
        const imageUrl = await fileUploaderController.uploadMedia(file.buffer);
        mediaUrls.push(imageUrl);
      } catch (error) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Failed to upload image: ${error}`);
      }
    }

    // Parse and validate variants
    let parsedVariants;
    try {
      parsedVariants = JSON.parse(variants);
      if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
        return ResponseManager.handleBadRequestError(res, 'At least one variant is required');
      }
      parsedVariants.forEach(variant => {
        if (!variant.color || !variant.storage || !variant.price || variant.quantity === undefined || !variant.batteryHealth) {
          throw new Error('Each variant must include color, storage, price, quantity, and battery health');
        }
      });
    } catch (error) {
      return ResponseManager.handleBadRequestError(res, 'Invalid variants format');
    }

    // Update the iPhone listing
    const iPhoneData = await iPhoneService.updateiPhone(req.params.id, {
      model, releaseYear, media: mediaUrls, features, status,
      condition, warranty, addOn, purchaseDate, age, repaired, categoryName,
      variants: parsedVariants
    });

    if (!iPhoneData) {
      return ResponseManager.sendSuccess(res, [], 200, 'iPhone not found');
    }

    ConsoleManager.log(`iPhone updated: ${JSON.stringify(iPhoneData)}`);
    return ResponseManager.sendSuccess(res, iPhoneData, 200, 'iPhone updated successfully');
  } catch (err) {
    ConsoleManager.error(`Error updating iPhone: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error updating iPhone: ${err.message}`);
  }
});

// Toggle status of an iPhone by ID
router.put('/removeiphone/:id', async (req, res) => {
  try {
    const iPhoneData = await iPhoneService.toggleiPhoneStatus(req.params.id);
    if (!iPhoneData) {
      return ResponseManager.sendSuccess(res, [], 200, 'iPhone not found for removal');
    }

    ConsoleManager.log(`iPhone removed: ${JSON.stringify(iPhoneData)}`);
    return ResponseManager.sendSuccess(res, iPhoneData, 200, 'iPhone removed successfully');
  } catch (err) {
    ConsoleManager.error(`Error removing iPhone: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error removing status: ${err.message}`);
  }
});

// Delete an iPhone by ID
router.delete('/deleteiPhone/:id', async (req, res) => {
  try {
    const iPhoneData = await iPhoneService.deleteiPhone(req.params.id);
    if (!iPhoneData) {
      return ResponseManager.sendSuccess(res, [], 200, 'iPhone not found for deletion');
    }

    ConsoleManager.log(`iPhone deleted: ${JSON.stringify(iPhoneData)}`);
    return ResponseManager.sendSuccess(res, iPhoneData, 200, 'iPhone deleted successfully');
  } catch (err) {
    ConsoleManager.error(`Error deleting iPhone: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error deleting iPhone: ${err.message}`);
  }
});

module.exports = router;
