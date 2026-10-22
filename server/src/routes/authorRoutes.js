import { Router } from "express";
import {
  getMyBooks,
  createTicket,
  getMyTickets,
} from "../controllers/authorController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect, allowRoles("author"));

router.get("/books", getMyBooks);
router.post("/tickets", createTicket);
router.get("/tickets", getMyTickets);

export default router;
