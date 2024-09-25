const mongoose = require("mongoose");
const consoleManager = require("../utils/consoleManager");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://nikhilchaudhary390:8zpCwsJFOrDOSOt5@userscluster.xnqvw.mongodb.net/?retryWrites=true&w=majority&appName=UsersCluster",
      {
        dbName: "Guru_iPhone",
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 30000, 
        serverSelectionTimeoutMS: 30000, 
      }
    );
    consoleManager.log("MongoDB connected successfully");
  } catch (err) {
    consoleManager.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
