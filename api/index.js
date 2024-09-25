const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./database/db");
const consoleManager = require("./utils/consoleManager");
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

const loginRoute = require("./routes/auth/login");
const profileRoute = require("./routes/auth/profile");
const userRoute = require("./routes/user/user_routes");
const categoryRoute = require("./routes/categories/category_routes");
const roleRoute = require("./routes/role/role_routes");
const iPhoneRoute = require("./routes/product/iPhones/iPhone_routes");
const androidRoute = require("./routes/product/androids/android_routes");
const accessoryRoute = require("./routes/product/accessories/accessories_routes");

app.use("/v2/auth", loginRoute);
app.use("/v2/get", profileRoute);
app.use("/v2/user", userRoute);
app.use("/v2/category", categoryRoute);
app.use("/v2/role", roleRoute);

app.use("/v2/product/iphone", iPhoneRoute);
app.use("/v2/product/android", androidRoute);
app.use("/v2/product/accessory", accessoryRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  consoleManager.error(`Server error: ${err.stack}`);
  res.status(err.status || 500).send(err.message || "Something went wrong!");
});

module.exports = app;
