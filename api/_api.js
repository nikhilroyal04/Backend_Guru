const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("../database/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Load environment variables
dotenv.config();

// Initialize the Express app
const app = express();

// Enable CORS for cross-origin requests

// const corsOptions = {
//   origin: "*", // Adjust according to your needs
//   methods: "GET,POST,PUT,DELETE",
//   allowedHeaders: "Content-Type,Authorization",
//   credentials: true, // Allow credentials such as cookies
// };

app.use(cors());

// Enable cookie-parser

app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Add middleware
app.use(express.json());

// Export the initialized app
module.exports = app;
