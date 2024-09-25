const cloudinary = require("../database/cloudinary");
const sharp = require("sharp");

module.exports.uploadMedia = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    // Limit the size of the image before resizing, sharp automatically retains aspect ratio
    sharp(fileBuffer)
      .resize({ width: 1000, height: 1000, fit: "inside" }) // Ensure max resolution is 1000x1000
      .toBuffer()
      .then((resizedBuffer) => {
        cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject("Failed to upload image to Cloudinary");
            } else {
              const imageUrl = result.secure_url;
              resolve(imageUrl); // Return the uploaded image URL
            }
          }
        ).end(resizedBuffer);
      })
      .catch((err) => {
        console.error("Error processing image:", err);
        reject("Failed to process image");
      });
  });
};
