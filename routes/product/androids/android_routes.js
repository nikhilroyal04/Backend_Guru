const express = require('express');
const multer = require('multer');
const androidService = require('../../../services/product/androids/android_services');
const ConsoleManager = require('../../../utils/consoleManager');
const ResponseManager = require('../../../utils/responseManager');
const fileUploaderController = require('../../../controller/mediaUploader');
const router = express.Router();

// Configure multer for multiple image uploads (limit of 6)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { files: 6 } });

// Create a new Android listing
router.post('/addAndroid', upload.array('media', 6), async (req, res) => {
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

    // Process images for the Android media
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
        if (!variant.color || !variant.storage || !variant.price || variant.quantity === undefined) {
          throw new Error('Each variant must include color, storage, price, and quantity');
        }
      });
    } catch (error) {
      return ResponseManager.handleBadRequestError(res, 'Invalid variants format');
    }

    // Create a new Android listing
    const androidData = await androidService.createAndroid({
      model, releaseYear, media: mediaUrls, features, status,
      condition, warranty, addOn, purchaseDate, age, repaired, categoryName,
      variants: parsedVariants
    });

    ConsoleManager.log(`Android created: ${JSON.stringify(androidData)}`);
    return ResponseManager.sendSuccess(res, androidData, 201, 'Android created successfully');
  } catch (err) {
    ConsoleManager.error(`Error creating Android: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error creating Android: ${err.message}`);
  }
});

// Get all Android devices with query parameters
router.get('/getAllAndroids', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      model, 
      color, 
      storage, 
      price, 
      repaired, 
      age 
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (model) {
      query.model = { $eq: model.toLowerCase() }; 
    }

    if (repaired) {
      query.repaired = repaired === 'true' ? 'Yes' : 'No';  
    }

    if (age) {
      query.age = { $eq: age.toLowerCase() }; 
    }

    // Fetch all Androids based on the initial query (without filtering variants yet)
    const androids = await androidService.getAllAndroids(query, skip, limitNumber);

    const filteredAndroids = androids.map(android => {
      let matchingVariants = android.variants;

      // Normalize the Android properties for filtering
      const normalizedColor = color ? color.toLowerCase() : null;
      const normalizedStorage = storage ? storage.toLowerCase() : null;
      const normalizedPrice = price ? price.toString() : null;  // Keep as string

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

      // Return Android with only the matching variants
      return { ...android._doc, variants: matchingVariants };
    }).filter(android => android.variants.length > 0);  // Remove Androids with no matching variants

    // Calculate the total count of Androids based on the filtered results
    const totalCount = filteredAndroids.length;

    return ResponseManager.sendSuccess(res, {
      androids: filteredAndroids,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount,
    }, 200, 'Androids fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching Androids: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching Androids: ${err.message}`);
  }
});


// Get an Android device by ID
router.get('/getAndroid/:id', async (req, res) => {
  try {
    const android = await androidService.getAndroidById(req.params.id);
    if (!android) {
      return ResponseManager.sendSuccess(res, [], 200, 'Android not found');
    }
    ConsoleManager.log(`Android fetched: ${JSON.stringify(android)}`);
    return ResponseManager.sendSuccess(res, android, 200, 'Android fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching Android: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching Android: ${err.message}`);
  }
});

// Update an Android by ID
router.put('/updateAndroid/:id', upload.array('media', 6), async (req, res) => {
  try {
    const {
      model, releaseYear, features, status, condition, warranty, addOn,
      purchaseDate, age,  repaired, categoryName, variants
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
        if (!variant.color || !variant.storage || !variant.price || variant.quantity === undefined) {
          throw new Error('Each variant must include color, storage, price, and quantity');
        }
      });
    } catch (error) {
      return ResponseManager.handleBadRequestError(res, 'Invalid variants format');
    }

    // Update the Android listing
    const androidData = await androidService.updateAndroid(req.params.id, {
      model, releaseYear, media: mediaUrls, features, status,
      condition, warranty, addOn, purchaseDate, age, repaired, categoryName,
      variants: parsedVariants
    });

    if (!androidData) {
      return ResponseManager.sendSuccess(res, [], 200, 'Android not found');
    }

    ConsoleManager.log(`Android updated: ${JSON.stringify(androidData)}`);
    return ResponseManager.sendSuccess(res, androidData, 200, 'Android updated successfully');
  } catch (err) {
    ConsoleManager.error(`Error updating Android: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error updating Android: ${err.message}`);
  }
});

// Toggle status of an Android by ID
router.put('/removeAndroid/:id', async (req, res) => {
  try {
    const androidData = await androidService.toggleAndroidStatus(req.params.id);
    if (!androidData) {
      return ResponseManager.sendSuccess(res, [], 200, 'Android not found for removal');
    }

    ConsoleManager.log(`Android removed: ${JSON.stringify(androidData)}`);
    return ResponseManager.sendSuccess(res, androidData, 200, 'Android removed successfully');
  } catch (err) {
    ConsoleManager.error(`Error removing Android: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error removing status: ${err.message}`);
  }
});

// Delete an Android by ID
router.delete('/deleteAndroid/:id', async (req, res) => {
  try {
    const android = await androidService.deleteAndroid(req.params.id);
    if (!android) {
      return ResponseManager.sendSuccess(res, [], 200, 'Android not found');
    }
    ConsoleManager.log(`Android deleted: ${JSON.stringify(android)}`);
    return ResponseManager.sendSuccess(res, android, 200, 'Android deleted successfully');
  } catch (err) {
    ConsoleManager.error(`Error deleting Android: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error deleting Android: ${err.message}`);
  }
});

module.exports = router;
