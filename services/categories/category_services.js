const Category = require("../../models/categories/categoryModel");
const consoleManager = require("../../utils/consoleManager");

class CategoryService {
  async createCategory(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      const category = new Category(data);
      await category.save();
      consoleManager.log("Category created successfully");
      return category;
    } catch (err) {
      consoleManager.error(`Error creating category: ${err.message}`);
      throw err;
    }
  }

  async getCategoryById(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        consoleManager.error("Category not found");
        return null;
      }
      return category;
    } catch (err) {
      consoleManager.error(`Error fetching category: ${err.message}`);
      throw err;
    }
  }

  async updateCategory(categoryId, data) {
    try {
      data.updatedOn = Date.now();
      const category = await Category.findByIdAndUpdate(categoryId, data, { new: true });
      if (!category) {
        consoleManager.error("Category not found for update");
        return null;
      }
      consoleManager.log("Category updated successfully");
      return category;
    } catch (err) {
      consoleManager.error(`Error updating category: ${err.message}`);
      throw err;
    }
  }

  async deleteCategory(categoryId) {
    try {
      const category = await Category.findByIdAndDelete(categoryId);
      if (!category) {
        consoleManager.error("Category not found for deletion");
        return null;
      }
      consoleManager.log("Category deleted successfully");
      return category;
    } catch (err) {
      consoleManager.error(`Error deleting category: ${err.message}`);
      throw err;
    }
  }

  async getAllCategories(query = {}, page = 1, limit = 20) {
    try {
      // Build the query object for filtering
      const filterQuery = {};
      if (query.name) {
        filterQuery.name = { $regex: query.name, $options: 'i' }; // Case-insensitive search
      }
  
      // Fetch categories with pagination
      const categories = await Category.find(filterQuery)
        .limit(parseInt(limit, 10))
        .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));
  
      // Get total number of categories for pagination
      const totalCategories = await Category.countDocuments(filterQuery);
      const totalPages = Math.ceil(totalCategories / limit);
  
      return {
        categories, 
        totalPages, 
        currentPage: parseInt(page, 10), 
        totalCategories
      };
    } catch (err) {
      consoleManager.error(`Error fetching categories: ${err.message}`);
      throw err;
    }
  }

  async toggleCategoryStatus(categoryId) {
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        consoleManager.error("Category not found for status toggle");
        return null;
      }

      // Toggle the status between 'active' and 'inactive'
      const newStatus = category.status === "Active" ? "Inactive" : "Active";
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`Category status updated to ${newStatus}`);
      return updatedCategory;
    } catch (err) {
      consoleManager.error(`Error toggling category status: ${err.message}`);
      throw err;
    }
  }

  async getNumberOfCategories() {
    try {
      const count = await Category.countDocuments();
      consoleManager.log(`Number of categories: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting categories: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new CategoryService();
