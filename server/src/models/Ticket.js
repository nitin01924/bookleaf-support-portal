
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ["author", "admin"],
      required: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    bookId: {
      type: String,
      default: null,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "Royalty & Payments",
        "ISBN & Metadata Issues",
        "Printing & Quality",
        "Distribution & Availability",
        "Book Status & Production Updates",
        "General Inquiry",
      ],
      default: "General Inquiry",
    },
    priority: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
    },
    assignedAdminId: {
      type: String,
      default: null,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    attachmentNames: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

ticketSchema.index({ status: 1, priority: 1, createdAt: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
