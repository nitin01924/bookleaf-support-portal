import { Router } from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { getMyBooks } from "../controllers/authorController.js";

const router = Router();

router.get(
  "/books",
  protect,
  allowRoles("author"),
  getMyBooks
);

export default router;
