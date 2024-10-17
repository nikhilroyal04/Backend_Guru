const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../database/db");
const consoleManager = require("../utils/consoleManager");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

// Connect to MongoDB (cached connection)
connectDB().catch((error) => {
  consoleManager.error(`Database connection failed: ${error.message}`);
  process.exit(1);
});

// CORS Configuration for credentialed requests
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow all origins for development
      callback(null, true);
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow credentials (cookies, HTTP authentication)
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Import routes

const loginRoute = require("../routes/auth/login");
const profileRoute = require("../routes/auth/profile");
const userRoute = require("../routes/user/user_routes");
const orderRoutes = require("../routes/orders/order_routes");
const addressRoutes = require("../routes/address/address_routes");
const categoryRoute = require("../routes/categories/category_routes");
const roleRoute = require("../routes/role/role_routes");
const featureRoutes = require("../routes/features/feature_routes");

const couponRoute = require("../routes/coupon/coupon_routes");
const cartRoute = require("../routes/cart/cart_routes");
const productRoute = require("../routes/product/product_routes");

app.use("/v2/auth", loginRoute);
app.use("/v2/get", profileRoute);
app.use("/v2/user", userRoute);
app.use("/v2/user/order", orderRoutes);
app.use("/v2/user/address", addressRoutes);
app.use("/v2/category", categoryRoute);
app.use("/v2/role", roleRoute);
app.use("/v2/feature", featureRoutes);

app.use("/v2/product", productRoute);

app.use("/v2/coupon", couponRoute);
app.use("/v2/cart", cartRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  consoleManager.error(`Server error: ${err.stack}`);
  res.status(err.status || 500).send(err.message || "Something went wrong!");
});

// Start the server

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   consoleManager.log(`Server is running on port ${PORT}`);
// });

module.exports = app;
