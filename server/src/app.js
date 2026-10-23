
import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect, allowRoles } from "./middleware/authMiddleware.js";
import authorRoutes from "./routes/authorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as health checks.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  }),
);

// Parse incoming JSON request bodies
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the BookLeaf Support Portal API");
});

app.get("/api/auth/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

app.get(
  "/api/admin/test",
  protect,
  allowRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted.",
    });
  },
);

const startServer = async () => {
  try {
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
