const express = require("express");
const CategoryService = require("../../services/categories/category_services");
const ResponseManager = require("../../utils/responseManager");
const consoleManager = require("../../utils/consoleManager");
const multer = require("multer");
const fileUploaderController = require('../../controller/mediaUploader');

const router = express.Router();

// Configure multer for single image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new category with image upload
router.post("/addCategory", upload.single("categoryImage"), async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validate required fields
    if (!name) {
      return ResponseManager.handleBadRequestError(res, "Category name is required");
    }

    if (!description) {
      return ResponseManager.handleBadRequestError(res, "Description is required");
    }

    if (!status) {
      return ResponseManager.handleBadRequestError(res, "Status is required");
    }

    // Ensure that the image is provided
    if (!req.file) {
      return ResponseManager.handleBadRequestError(res, "Category image is required");
    }

    // Get the image buffer from multer
    const fileBuffer = req.file.buffer;

    // Upload the image and get the URL
    const imageUrl = await fileUploaderController.uploadMedia(fileBuffer);

    // Create the category with image URL
    const category = await CategoryService.createCategory({
      name,
      description,
      status,
      categoryImage: imageUrl, 
    });

    // Return success response
    return ResponseManager.sendSuccess(res, category, 201, "Category created successfully");
  } catch (err) {
    console.error("Error creating category:", err);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error creating category");
  }
});



// Get a category by ID
router.get("/getCategory/:id", async (req, res) => {
  try {
    const category = await CategoryService.getCategoryById(req.params.id);
    if (category) {
      ResponseManager.sendSuccess(res, category, 200, "Category retrieved successfully");
    } else {
      ResponseManager.sendSuccess(res, [], 200, "Category not found");
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error fetching category");
  }
});

// Update a category by ID with optional image upload
router.put("/updateCategory/:id", upload.single("categoryImage"), async (req, res) => {
  try {
    const { name, description, status } = req.body;

    // Validate required fields
    if (!name) {
      return ResponseManager.handleBadRequestError(res, "Category name is required");
    }

    if (!description) {
      return ResponseManager.handleBadRequestError(res, "Description is required");
    }

    if (!status) {
      return ResponseManager.handleBadRequestError(res, "Status is required");
    }

    // Fetch the existing category to retain the old image URL if no new image is uploaded
    const existingCategory = await CategoryService.getCategoryById(req.params.id);
    if (!existingCategory) {
      return ResponseManager.sendSuccess(res, [], 200, "Category not found for update");
    }

    // If a new image is uploaded, upload it and get the new image URL, otherwise keep the old image URL
    let imageUrl = existingCategory.categoryImage; 
    if (req.file) {
      imageUrl = await fileUploaderController.uploadMedia(req.file.buffer); 
    }

    // Update the category with new data, including the (potentially) updated image URL
    const updatedCategory = await CategoryService.updateCategory(req.params.id, {
      name,
      description,
      status,
      categoryImage: imageUrl, 
    });

    if (updatedCategory) {
      return ResponseManager.sendSuccess(res, updatedCategory, 200, "Category updated successfully");
    } else {
      return ResponseManager.sendSuccess(res, [], 200, "Category not found for update");
    }
  } catch (err) {
    console.error("Error updating category:", err);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error updating category");
  }
});


// Delete a category by ID
router.delete("/deleteCategory/:id", async (req, res) => {
  try {
    const category = await CategoryService.deleteCategory(req.params.id);
    if (category) {
      ResponseManager.sendSuccess(res, category, 200, "Category deleted successfully");
    } else {
      ResponseManager.sendSuccess(res, [], 200, "Category not found for deletion");
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error deleting category");
  }
});

// Get all categories
router.get("/getAllCategories", async (req, res) => {
  try {
    const { name, page = 1, limit = 20 } = req.query;
    const result = await CategoryService.getAllCategories({ name }, page, limit);

    if (result.categories.length === 0 || !result) {
      return ResponseManager.sendSuccess(res, [], 200, "No categories found");
    }

    // Format the response as needed
    return ResponseManager.sendSuccess(
      res,
      {
        categories: result.categories,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalCategories: result.totalCategories,
      },
      200,
      "Categories retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching categories: ${err.message}`);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error fetching categories");
  }
});

router.get("/user/getAllCategories", async (req, res) => {
  try {
    const { name, page = 1, limit = 20 } = req.query;

    // Ensure only active categories are fetched
    const query = { 
      status: 'active' 
    };

    if (name) {
      query.name = { $regex: new RegExp(name, 'i') };
    }

    const result = await CategoryService.getActiveCategories(query, page, limit);

    if (!result || result.categories.length === 0) {
      return ResponseManager.sendSuccess(res, [], 200, "No categories found");
    }

    // Format the response as needed
    return ResponseManager.sendSuccess(
      res,
      {
        categories: result.categories,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalCategories: result.totalCategories,
      },
      200,
      "Categories retrieved successfully"
    );
  } catch (err) {
    consoleManager.error(`Error fetching categories: ${err.message}`);
    return ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error fetching categories");
  }
});


// Toggle category status
router.put("/removeCategory/:id", async (req, res) => {
  try {
    const category = await CategoryService.toggleCategoryStatus(req.params.id);
    if (category) {
      ResponseManager.sendSuccess(res, category, 200, "Category removed successfully");
    } else {
      ResponseManager.sendSuccess(res, [], 200, "Category not found for remove");
    }
  } catch (err) {
    ResponseManager.sendError(res, 500, "INTERNAL_ERROR", "Error removing category");
  }
});

module.exports = router;
