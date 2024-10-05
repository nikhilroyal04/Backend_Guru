const Product = require("../../models/product/productModel");
const consoleManager = require("../../utils/consoleManager");
const { calculateDiscount } = require("../../utils/calculateDiscount");

class ProductService {
  // Create a new product
  async createProduct(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      // Calculate priceOff
      if (data.originalPrice && data.price) {
        const discount = calculateDiscount(data.originalPrice, data.price);
        data.priceOff = discount; // Set priceOff
      }

      const product = new Product(data);
      await product.save();
      consoleManager.log("Product created successfully");
      return product;
    } catch (err) {
      consoleManager.error(`Error creating product: ${err.message}`);
      throw err;
    }
  }

  // Get a product by ID
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        consoleManager.error("Product not found");
        return null;
      }
      return product;
    } catch (err) {
      consoleManager.error(`Error fetching product: ${err.message}`);
      throw err;
    }
  }

  // Update a product by ID
  async updateProduct(productId, data) {
    try {
      data.updatedOn = Date.now();

      // Calculate priceOff
      if (data.originalPrice && data.price) {
        const discount = calculateDiscount(data.originalPrice, data.price);
        data.priceOff = discount; // Set priceOff
      }

      const product = await Product.findByIdAndUpdate(productId, data, {
        new: true,
      });
      if (!product) {
        consoleManager.error("Product not found for update");
        return null;
      }
      consoleManager.log("Product updated successfully");
      return product;
    } catch (err) {
      consoleManager.error(`Error updating product: ${err.message}`);
      throw err;
    }
  }

  // Delete a product by ID
  async deleteProduct(productId) {
    try {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        consoleManager.error("Product not found for deletion");
        return null;
      }
      consoleManager.log("Product deleted successfully");
      return product;
    } catch (err) {
      consoleManager.error(`Error deleting product: ${err.message}`);
      throw err;
    }
  }

  // Get all products with pagination
  async getAllProducts(query = {}, skip = 0, limit = 20) {
    try {
      const products = await Product.find(query).skip(skip).limit(limit);
      consoleManager.log(`Fetched ${products.length} products`);
      return products;
    } catch (err) {
      consoleManager.error(`Error fetching products: ${err.message}`);
      throw err;
    }
  }

  // Get all available products with pagination
  async getAllAvailableProducts(query = {}, skip = 0, limit = 20) {
    try {
      const availableProducts = await Product.find({
        status: "available",
        ...query,
      })
        .skip(skip)
        .limit(limit);
      consoleManager.log(
        `Fetched ${availableProducts.length} available products`
      );
      return availableProducts;
    } catch (err) {
      consoleManager.error(`Error fetching available products: ${err.message}`);
      throw err;
    }
  }

  // Toggle product status between available and Inactive
  async toggleProductStatus(productId) {
    try {
      const product = await Product.findById(productId);
      if (!product) {
        consoleManager.error("Product not found for status toggle");
        return null;
      }

      // Toggle the status between 'available' and 'Inactive'
      const newStatus =
        product.status === "available" ? "inactive" : "available";
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`Product status updated to ${newStatus}`);
      return updatedProduct;
    } catch (err) {
      consoleManager.error(`Error toggling product status: ${err.message}`);
      throw err;
    }
  }

  // Get the total number of products
  async getNumberOfProducts() {
    try {
      const count = await Product.countDocuments();
      consoleManager.log(`Number of products: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting products: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new ProductService();
