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
        if (!variant.color || !variant.storage || !variant.price || !variant.originalPrice || variant.quantity === undefined) {
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
      query.model = { $regex: new RegExp(model, 'i') };  
    }

    if (repaired) {
      query.repaired = repaired === 'true' ? 'Yes' : 'No';  
    }

    if (age) {
      query.age = { $regex: new RegExp(age, 'i') }; 
    }

    // Fetch all Androids based on the initial query (without filtering variants yet)
    const androids = await androidService.getAllAndroids(query, skip, limitNumber);

    const filteredAndroids = androids.map(android => {
      let matchingVariants = android.variants;

      // Normalize the Android properties for filtering
      const normalizedColor = color ? new RegExp(color, 'i') : null;  
      const normalizedStorage = storage ? new RegExp(storage, 'i') : null;  
      const normalizedPrice = price ? new RegExp(price.toString(), 'i') : null;  

      // Filter variants based on color (partial match)
      if (normalizedColor) {
        matchingVariants = matchingVariants.filter(variant =>
          normalizedColor.test(variant.color)
        );
      }

      // Further filter based on storage (partial match)
      if (normalizedStorage) {
        matchingVariants = matchingVariants.filter(variant =>
          normalizedStorage.test(variant.storage)
        );
      }

      // Filter based on price (partial match)
      if (normalizedPrice) {
        matchingVariants = matchingVariants.filter(variant =>
          normalizedPrice.test(variant.price)
        );
      }

      // Return Android with only the matching variants
      return { ...android._doc, variants: matchingVariants };
    }).filter(android => android.variants.length > 0);  

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

// Get active Androids 
router.get('/user/getAllAndroids', async (req, res) => {
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
      query.model = { $regex: new RegExp(model, 'i') };  
    }

    if (repaired) {
      query.repaired = repaired === 'true' ? 'Yes' : 'No';  
    }

    // Handle age filtering (e.g., less than 6 months)
    if (age) {
      const ageInMonthsThreshold = parseInt(age, 10);
      if (!isNaN(ageInMonthsThreshold)) {
        query.age = { $exists: true };  // Fetch Androids that have an age field
      }
    }

    // Fetch Androids based on initial query
    const androids = await androidService.getActiveAndroids(query, skip, limitNumber);

    const filteredAndroids = androids.map(android => {
      let matchingVariants = android.variants;

      // Normalize filtering options
      const normalizedColor = color ? color.toLowerCase() : null;
      const normalizedStorage = storage ? storage.split(',').map(s => s.trim().toLowerCase()) : null;
      let priceRange = null;
      if (price) {
        const priceRangeSplit = price.split('-').map(Number);
        priceRange = { min: priceRangeSplit[0], max: priceRangeSplit[1] };
      }

      // Filter variants based on color, storage, price
      if (normalizedColor) {
        matchingVariants = matchingVariants.filter(variant =>
          new RegExp(normalizedColor, 'i').test(variant.color)
        );
      }

      if (normalizedStorage) {
        matchingVariants = matchingVariants.filter(variant =>
          normalizedStorage.includes(variant.storage.toLowerCase())
        );
      }

      if (priceRange) {
        matchingVariants = matchingVariants.filter(variant =>
          variant.price >= priceRange.min && variant.price <= priceRange.max
        );
      }

      return { ...android._doc, variants: matchingVariants };
    }).filter(android => android.variants.length > 0);  

    // Now filter Androids by age (less than the provided threshold)
    let finalFilteredAndroids = filteredAndroids;
    if (age) {
      const ageInMonthsThreshold = parseInt(age, 10);
      if (!isNaN(ageInMonthsThreshold)) {
        finalFilteredAndroids = filteredAndroids.filter(android => {
          const androidAge = android.age && parseInt(android.age.split(' ')[0], 10); // Extract the number part of the age
          return androidAge && androidAge < ageInMonthsThreshold; // Keep Androids less than the age threshold
        });
      }
    }

    // Calculate the total count of Androids based on the filtered results
    const totalCount = finalFilteredAndroids.length;

    return ResponseManager.sendSuccess(res, {
      androids: finalFilteredAndroids,
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
        if (!variant.color || !variant.storage || !variant.price || !variant.originalPrice || variant.quantity === undefined) {
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

// Purchase Android and decrease quantity
router.put('/purchaseAndroid/:id', async (req, res) => {
  try {
    const { variantId, quantityToPurchase } = req.body;

    // Validate required fields
    if (!variantId) return ResponseManager.handleBadRequestError(res, 'Variant ID is required');
    if (!quantityToPurchase || quantityToPurchase <= 0) return ResponseManager.handleBadRequestError(res, 'Valid quantity to purchase is required');

    // Find the Android by ID
    const Android = await androidService.getAndroidById(req.params.id);
    if (!Android) {
      return ResponseManager.sendSuccess(res, [], 200, 'Android not found');
    }

    // Find the variant by ID and decrease its quantity
    const variantIndex = Android.variants.findIndex(variant => variant._id.toString() === variantId);
    if (variantIndex === -1) {
      return ResponseManager.handleBadRequestError(res, 'Variant not found');
    }

    const selectedVariant = Android.variants[variantIndex];
    if (selectedVariant.quantity < quantityToPurchase) {
      return ResponseManager.handleBadRequestError(res, 'Not enough stock available');
    }

    // Decrease the quantity
    selectedVariant.quantity -= quantityToPurchase;

    // If the quantity becomes 0, set the variant's status to "soldout"
    if (selectedVariant.quantity === 0) {
      selectedVariant.status = "soldout";
    }

    // Save the updated Android
    const updatedAndroid = await Android.save();

    ConsoleManager.log(`Android purchased: ${JSON.stringify(updatedAndroid)}`);
    return ResponseManager.sendSuccess(res, updatedAndroid, 200, 'Purchase successful, quantity updated');
  } catch (err) {
    ConsoleManager.error(`Error purchasing Android: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error purchasing Android: ${err.message}`);
  }
});

module.exports = router;
