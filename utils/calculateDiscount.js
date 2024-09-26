
function calculateDiscount(originalPrice, salePrice) {
    // Convert price values to numbers to ensure calculations work correctly
    const original = parseFloat(originalPrice);
    const sale = parseFloat(salePrice);
  
    if (isNaN(original) || isNaN(sale) || original <= 0 || sale <= 0 || sale >= original) {
      return "0%";
    }
  
    // Calculate discount percentage
    const discountPercentage = ((original - sale) / original) * 100;
  
    // Return the rounded percentage value
    return `${Math.round(discountPercentage)}%`;
  }
  
  module.exports = { calculateDiscount };
  