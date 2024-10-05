const express = require('express');
const multer = require('multer');
const productService = require('../../services/product/product_services');
const ConsoleManager = require('../../utils/consoleManager');
const ResponseManager = require('../../utils/responseManager');
const fileUploaderController = require('../../controller/mediaUploader');

const router = express.Router();

// Configure multer for multiple image uploads (limit of 6)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { files: 6 } });

// Create a new Product listing
router.post('/addProduct', upload.array('media', 6), async (req, res) => {
  try {
    const { model } = req.body;

    if (!model) return ResponseManager.handleBadRequestError(res, 'Model is required');

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

    const productData = {
      ...req.body,
      media: mediaUrls,
    };

    const newProduct = await productService.createProduct(productData);

    ConsoleManager.log(`Product created: ${JSON.stringify(newProduct)}`);
    return ResponseManager.sendSuccess(res, newProduct, 201, 'Product created successfully');
  } catch (err) {
    ConsoleManager.error(`Error creating product: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error creating product: ${err.message}`);
  }
});

// Get a product by ID
router.get('/getProductById/:id', async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);

    if (!product) {
      return ResponseManager.sendSuccess(res, [], 200, 'Product not found');
    }

    return ResponseManager.sendSuccess(res, product, 200, 'Product fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching product: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching product: ${err.message}`);
  }
});

// Update a product by ID
router.put('/updateProduct/:id', upload.array('media', 6), async (req, res) => {
  try {
    const { model } = req.body;

    if (!model) return ResponseManager.handleBadRequestError(res, 'Model is required');

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

    const updateData = {
      ...req.body,
      media: mediaUrls,
    };

    const updatedProduct = await productService.updateProduct(req.params.id, updateData);

    if (!updatedProduct) {
      return ResponseManager.sendSuccess(res, [], 200, 'Product not found');
    }

    return ResponseManager.sendSuccess(res, updatedProduct, 200, 'Product updated successfully');
  } catch (err) {
    ConsoleManager.error(`Error updating product: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error updating product: ${err.message}`);
  }
});

// Delete a product by ID
router.delete('/deleteProduct/:id', async (req, res) => {
  try {
    const product = await productService.deleteProduct(req.params.id);

    if (!product) {
      return ResponseManager.sendSuccess(res, [], 200, 'Product not found for deletion');
    }

    return ResponseManager.sendSuccess(res, product, 200, 'Product deleted successfully');
  } catch (err) {
    ConsoleManager.error(`Error deleting product: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error deleting product: ${err.message}`);
  }
});

// Get all products with pagination
router.get('/getAllProducts', async (req, res) => {
  try {
    const { page = 1, limit = 20, categoryName, model, price, batteryHealth, storage, age } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};
    if (categoryName) {
      query.categoryName = { 
        $regex: new RegExp(categoryName, 'i') 
      };
    }

        // Filter by model (case insensitive like search)
    if (model) {
      query.model = {
        $regex: new RegExp(model, 'i') 
      };
    }

     // Filter by price range (min-max)
    if (price) {
      const [minPrice, maxPrice] = price.split('-').map(Number);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = {
          $gte: minPrice,
          $lte: maxPrice
        };
      }
    }

    // Filter by battery health range (min-max)
    if (batteryHealth) {
      const [minBatteryHealth, maxBatteryHealth] = batteryHealth.split('-').map(Number);
      if (!isNaN(minBatteryHealth) && !isNaN(maxBatteryHealth)) {
        query.batteryHealth = {
          $gte: minBatteryHealth,
          $lte: maxBatteryHealth
        };
      }
    }

     // Filter by multiple storage options
    if (storage) {
      const storageOptions = storage.split(',').map(option => option.trim());
      query.storage = {
        $in: storageOptions.map(option => new RegExp(option, 'i')) // Case insensitive search for each storage option
      };
    }

    // Filter by age (maximum age in months)
    if (age) {
      const ageValue = parseInt(age.trim().split(' ')[0], 10); // Extract the numeric part, allowing for optional space
      if (!isNaN(ageValue)) {
        // Adjust the query to find products less than or equal to the specified age
        query.age = {
          $lte: ageValue // Match products that are less than or equal to the specified age
        };
      }
    }


    const products = await productService.getAllProducts(query, skip, limitNumber);

    const totalCount = await productService.getNumberOfProducts(query);

    return ResponseManager.sendSuccess(res, {
      products,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      totalCount
    }, 200, 'Products fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching products: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching products: ${err.message}`);
  }
});

// Get all available products with pagination and optional category filter
router.get('/available/getAllProducts', async (req, res) => {
  try {
    const { page = 1, limit = 20, categoryName, model, price, batteryHealth, storage, age } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {}; // Initialize an empty query

    // Add categoryName to the query if it exists
    if (categoryName) {
      query.categoryName = { 
        $regex: new RegExp(categoryName, 'i') 
      };
    }

    // Filter by model (case insensitive like search)
    if (model) {
      query.model = {
        $regex: new RegExp(model, 'i') 
      };
    }

     // Filter by price range (min-max)
    if (price) {
      const [minPrice, maxPrice] = price.split('-').map(Number);
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        query.price = {
          $gte: minPrice,
          $lte: maxPrice
        };
      }
    }

    // Filter by battery health range (min-max)
    if (batteryHealth) {
      const [minBatteryHealth, maxBatteryHealth] = batteryHealth.split('-').map(Number);
      if (!isNaN(minBatteryHealth) && !isNaN(maxBatteryHealth)) {
        query.batteryHealth = {
          $gte: minBatteryHealth,
          $lte: maxBatteryHealth
        };
      }
    }

     // Filter by multiple storage options
    if (storage) {
      const storageOptions = storage.split(',').map(option => option.trim());
      query.storage = {
        $in: storageOptions.map(option => new RegExp(option, 'i')) // Case insensitive search for each storage option
      };
    }

    // Filter by age (maximum age in months)
    if (age) {
      const ageValue = parseInt(age.trim().split(' ')[0], 10); // Extract the numeric part, allowing for optional space
      if (!isNaN(ageValue)) {
        // Adjust the query to find products less than or equal to the specified age
        query.age = {
          $lte: ageValue // Match products that are less than or equal to the specified age
        };
      }
    }

    // Fetch products based on the query
    const products = await productService.getAllAvailableProducts(query, skip, limitNumber);

    return ResponseManager.sendSuccess(res, {
      products,
      totalPages: Math.ceil(products.length / limitNumber),
      currentPage: pageNumber,
      totalCount: products.length
    }, 200, 'Available products fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching available products: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching available products: ${err.message}`);
  }
});

// Toggle product status (available/inactive)
router.put('/removeProduct/:id', async (req, res) => {
  try {
    const updatedProduct = await productService.toggleProductStatus(req.params.id);

    if (!updatedProduct) {
      return ResponseManager.sendSuccess(res, [], 200, 'Product not found');
    }

    return ResponseManager.sendSuccess(res, updatedProduct, 200, 'Product removed successfully');
  } catch (err) {
    ConsoleManager.error(`Error removing product: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error removing product: ${err.message}`);
  }
});

// Get total number of products
router.get('/getNumberOfProducts', async (req, res) => {
  try {
    const count = await productService.getNumberOfProducts();

    return ResponseManager.sendSuccess(res, { count }, 200, 'Total number of products fetched successfully');
  } catch (err) {
    ConsoleManager.error(`Error fetching number of products: ${err.message}`);
    return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', `Error fetching number of products: ${err.message}`);
  }
});

module.exports = router;
