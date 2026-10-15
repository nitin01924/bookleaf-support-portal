
import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";

const app = express();

// Parse incoming JSON request bodies
app.use(express.json());

// Basic health-check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BookLeaf Support Portal API is running",
  });
});

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the server
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
