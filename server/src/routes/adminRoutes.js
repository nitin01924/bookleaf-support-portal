import { Router } from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { getAllTickets } from "../controllers/adminController.js";

const router = Router();

router.use(protect, allowRoles("admin"));

router.get("/tickets", getAllTickets);

export default router;
