const express = require('express');
const multer = require('multer');
const accessoryService = require('../../../services/product/accessories/accessories_services');
const ConsoleManager = require('../../../utils/consoleManager');
const ResponseManager = require('../../../utils/responseManager');
const fileUploaderController = require('../../../controller/mediaUploader');
const router = express.Router();

// Configure multer for multiple image uploads (limit of 6)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { files: 6 } });

// Create a new accessory listing
router.post('/addAccessory', upload.array('media', 6), async (req, res) => {
  try {
    const {
      name, type, warranty, compatibility, condition,
      purchaseDate, categoryName, variants
    } = req.body;

    // Validate required fields
    if (!name) return ResponseManager.handleBadRequestError(res, 'Name is required');
    if (!type) return ResponseManager.handleBadRequestError(res, 'Type is required');
    if (!condition) return ResponseManager.handleBadRequestError(res, 'Condition is required');
    if (!categoryName) return ResponseManager.handleBadRequestError(res, 'Category Name is required');
    if (!compatibility) return ResponseManager.handleBadRequestError(res, 'Compatibility is required');
    if (!variants) return ResponseManager.handleBadRequestError(res, 'Variants are required');

    // Process images for the accessory media
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
        if (!variant.color || !variant.price || !variant.originalPrice || variant.quantity === undefined) {
          throw new Error('Each variant must include color, price, and quantity');
        }
      });
    } catch (error) {
      return ResponseManager.handleBadRequestError(res, 'Invalid variants format');
    }

    // Create a new accessory listing
    const accessoryData = await accessoryService.createAccessory({
      name, type, media: mediaUrls, warranty, compatibility, condition,
      purchaseDate, categoryName, variants: parsedVariants
    });

    ConsoleManager.log(`Accessory created: ${JSON.stringify(accessoryData)}`);
    return ResponseManager.sendSuccess(res, accessoryData, 201, 'Accessory created successfully');
  } catch (err) {
    ConsoleManager.error(`Error creating accessory: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error creating accessory: ${err.message}`);
  }
});

// Get all accessories with query parameters
router.get('/getAllAccessories', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      type,
      compatibility,
      color,
      price,
      condition,
      warranty
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (name) {
      query.name = { $regex: new RegExp(name, 'i') }; 
    }

    if (type) {
      query.type = { $regex: new RegExp(type, 'i') }; 
    }

    if (compatibility) {
      query.compatibility = { $regex: new RegExp(compatibility, 'i') }; 
    }

    if (condition) {
      query.condition = { $regex: new RegExp(condition, 'i') }; 
    }

    if (warranty) {
      query.warranty = { $regex: new RegExp(warranty, 'i') }; 
    }

    // Fetch all accessories based on the initial query (without filtering variants yet)
    const accessories = await accessoryService.getAllAccessories(query, skip, limitNumber);

    const filteredAccessories = accessories.map(accessory => {
      const matchingVariants = accessory.variants.filter(variant => {
        const matchesColor = color ? variant.color.toLowerCase().includes(color.toLowerCase()) : true; 
        const matchesPrice = price ? variant.price <= price : true; 
        return matchesColor && matchesPrice;
      });
      return { ...accessory._doc, variants: matchingVariants };
    }).filter(accessory => accessory.variants.length > 0); 

    // Calculate the total count of filtered accessories
    const totalCount = filteredAccessories.length;

    return ResponseManager.sendSuccess(res, {
      accessories: filteredAccessories,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount,
    }, 200, 'Accessories fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching accessories: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching accessories: ${err.message}`);
  }
});

router.get('/user/getAllAccessories', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      type,
      compatibility,
      color,
      price,
      condition,
      warranty
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    if (name) {
      query.name = { $regex: new RegExp(name, 'i') }; 
    }

    if (type) {
      query.type = { $regex: new RegExp(type, 'i') }; 
    }

    if (compatibility) {
      query.compatibility = { $regex: new RegExp(compatibility, 'i') }; 
    }

    if (condition) {
      query.condition = { $regex: new RegExp(condition, 'i') }; 
    }

    if (warranty) {
      query.warranty = { $regex: new RegExp(warranty, 'i') }; 
    }

    // Fetch all accessories based on the initial query (without filtering variants yet)
    const accessories = await accessoryService.getActiveAccessories(query, skip, limitNumber);

    const filteredAccessories = accessories.map(accessory => {
      const matchingVariants = accessory.variants.filter(variant => {
        const matchesColor = color ? variant.color.toLowerCase().includes(color.toLowerCase()) : true; 
        const matchesPrice = price ? variant.price <= price : true; 
        return matchesColor && matchesPrice;
      });
      return { ...accessory._doc, variants: matchingVariants };
    }).filter(accessory => accessory.variants.length > 0); 

    // Calculate the total count of filtered accessories
    const totalCount = filteredAccessories.length;

    return ResponseManager.sendSuccess(res, {
      accessories: filteredAccessories,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount,
    }, 200, 'Accessories fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching accessories: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching accessories: ${err.message}`);
  }
});


// Get an accessory by ID
router.get('/getAccessory/:id', async (req, res) => {
  try {
    const accessory = await accessoryService.getAccessoryById(req.params.id);
    if (!accessory) {
      return ResponseManager.sendSuccess(res, [], 200, 'Accessory not found');
    }
    ConsoleManager.log(`Accessory fetched: ${JSON.stringify(accessory)}`);
    return ResponseManager.sendSuccess(res, accessory, 200, 'Accessory fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching accessory: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching accessory: ${err.message}`);
  }
});

// Update an accessory by ID
router.put('/updateAccessory/:id', upload.array('media', 6), async (req, res) => {
  try {
    const {
      name, type, warranty, compatibility, condition,
      purchaseDate, categoryName, variants
    } = req.body;

    // Validate required fields
    if (!name) return ResponseManager.handleBadRequestError(res, 'Name is required');
    if (!type) return ResponseManager.handleBadRequestError(res, 'Type is required');
    if (!compatibility) return ResponseManager.handleBadRequestError(res, 'Price is required');
    if (!condition) return ResponseManager.handleBadRequestError(res, 'Condition is required');
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
        if (!variant.color || !variant.price || !variant.originalPrice || variant.quantity === undefined) {
          throw new Error('Each variant must include color, price, and quantity');
        }
      });
    } catch (error) {
      return ResponseManager.handleBadRequestError(res, 'Invalid variants format');
    }

    // Update the accessory listing
    const accessoryData = await accessoryService.updateAccessory(req.params.id, {
      name, type, media: mediaUrls, warranty, compatibility, condition,
      purchaseDate, categoryName, variants: parsedVariants
    });

    if (!accessoryData) {
      return ResponseManager.sendSuccess(res, [], 200, 'Accessory not found');
    }

    ConsoleManager.log(`Accessory updated: ${JSON.stringify(accessoryData)}`);
    return ResponseManager.sendSuccess(res, accessoryData, 200, 'Accessory updated successfully');
  } catch (err) {
    ConsoleManager.error(`Error updating accessory: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error updating accessory: ${err.message}`);
  }
});

// Toggle status of an accessory by ID
router.put('/removeAccessory/:id', async (req, res) => {
  try {
    const accessoryData = await accessoryService.toggleAccessoryStatus(req.params.id);
    if (!accessoryData) {
      return ResponseManager.sendSuccess(res, [], 200, 'Accessory not found for removal');
    }

    ConsoleManager.log(`Accessory removed: ${JSON.stringify(accessoryData)}`);
    return ResponseManager.sendSuccess(res, accessoryData, 200, 'Accessory removed successfully');
  } catch (err) {
    ConsoleManager.error(`Error removing accessory: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error removing accessory: ${err.message}`);
  }
});

router.delete('/deleteAccessory/:id', async (req, res) => {
  try {
    const AccessoryData = await accessoryService.deleteAccessory(req.params.id);
    if (!AccessoryData) {
      return ResponseManager.sendSuccess(res, [], 200, 'Accessory not found for deletion');
    }

    ConsoleManager.log(`Accessory deleted: ${JSON.stringify(AccessoryData)}`);
    return ResponseManager.sendSuccess(res, AccessoryData, 200, 'Accessory deleted successfully');
  } catch (err) {
    ConsoleManager.error(`Error deleting Accessory: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error deleting Accessory: ${err.message}`);
  }
});


// Purchase Accessory and decrease quantity
router.put('/purchaseAccessory/:id', async (req, res) => {
  try {
    const { variantId, quantityToPurchase } = req.body;

    // Validate required fields
    if (!variantId) return ResponseManager.handleBadRequestError(res, 'Variant ID is required');
    if (!quantityToPurchase || quantityToPurchase <= 0) return ResponseManager.handleBadRequestError(res, 'Valid quantity to purchase is required');

    // Find the Accessory by ID
    const Accessory = await accessoryService.getAccessoryById(req.params.id);
    if (!Accessory) {
      return ResponseManager.sendSuccess(res, [], 200, 'Accessory not found');
    }

    // Find the variant by ID and decrease its quantity
    const variantIndex = Accessory.variants.findIndex(variant => variant._id.toString() === variantId);
    if (variantIndex === -1) {
      return ResponseManager.handleBadRequestError(res, 'Variant not found');
    }

    const selectedVariant = Accessory.variants[variantIndex];
    if (selectedVariant.quantity < quantityToPurchase) {
      return ResponseManager.handleBadRequestError(res, 'Not enough stock available');
    }

    // Decrease the quantity
    selectedVariant.quantity -= quantityToPurchase;

    // If the quantity becomes 0, set the variant's status to "soldout"
    if (selectedVariant.quantity === 0) {
      selectedVariant.status = "soldout";
    }

    // Save the updated Accessory
    const updatedAccessory = await Accessory.save();

    ConsoleManager.log(`Accessory purchased: ${JSON.stringify(updatedAccessory)}`);
    return ResponseManager.sendSuccess(res, updatedAccessory, 200, 'Purchase successful, quantity updated');
  } catch (err) {
    ConsoleManager.error(`Error purchasing Accessory: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error purchasing Accessory: ${err.message}`);
  }
});

module.exports = router;
