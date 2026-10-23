import { Router } from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  getAllTickets,
  assignTicketToMe,
  updateTicket,
  addTicketMessage,
  createTicketReplyDraft,
} from "../controllers/adminController.js";

const router = Router();

router.use(protect, allowRoles("admin"));

router.get("/tickets", getAllTickets);

router.patch("/tickets/:ticketId/assign", assignTicketToMe);
router.patch("/tickets/:ticketId", updateTicket);
router.post("/tickets/:ticketId/messages", addTicketMessage);

router.post("/tickets/:ticketId/draft-reply", createTicketReplyDraft);

export default router;
