import Ticket from "../models/Ticket.js";

const categories = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry",
];

const priorities = ["Critical", "High", "Medium", "Low"];
const statuses = ["Open", "In Progress", "Resolved", "Closed"];

export const getAllTickets = async (req, res) => {
  try {
    const { status, category, priority, from, to } = req.query;

    const filter = {};

    if (status) {
      if (!statuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket status.",
        });
      }
      filter.status = status;
    }

    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket category.",
        });
      }
      filter.category = category;
    }

    if (priority) {
      if (!priorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket priority.",
        });
      }
      filter.priority = priority;
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        const fromDate = new Date(from);

        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid start date.",
          });
        }

        filter.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to);

        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid end date.",
          });
        }

        toDate.setUTCHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    // Show unresolved, high-priority tickets first.
    const priorityRank = {
      Critical: 0,
      High: 1,
      Medium: 2,
      Low: 3,
    };

    tickets.sort((a, b) => {
      const aResolved = ["Resolved", "Closed"].includes(a.status);
      const bResolved = ["Resolved", "Closed"].includes(b.status);

      if (aResolved !== bResolved) {
        return Number(aResolved) - Number(bResolved);
      }

      const priorityDifference =
        priorityRank[a.priority] - priorityRank[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("Failed to fetch admin tickets:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tickets.",
    });
  }
};



export const assignTicketToMe = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { assignedAdminId: req.user.id },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully.",
      ticket,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    console.error("Ticket assignment failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to assign ticket.",
    });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { status, category, priority } = req.body;
    const updates = {};

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    const allowedCategories = [
      "Royalty & Payments",
      "ISBN & Metadata Issues",
      "Printing & Quality",
      "Distribution & Availability",
      "Book Status & Production Updates",
      "General Inquiry",
    ];

    const allowedPriorities = [
      "Critical",
      "High",
      "Medium",
      "Low",
    ];

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket status.",
        });
      }
      updates.status = status;
    }

    if (category !== undefined) {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket category.",
        });
      }
      updates.category = category;
    }

    if (priority !== undefined) {
      if (!allowedPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticket priority.",
        });
      }
      updates.priority = priority;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket updated successfully.",
      ticket,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    console.error("Ticket update failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket.",
    });
  }
};

export const addTicketMessage = async (req, res) => {
  try {
    const { body, isInternal = false } = req.body;

    if (typeof body !== "string" || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message body is required.",
      });
    }

    if (body.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must be 5000 characters or fewer.",
      });
    }

    if (typeof isInternal !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isInternal must be a boolean.",
      });
    }

    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    ticket.messages.push({
      senderRole: "admin",
      senderId: req.user.id,
      body: body.trim(),
      isInternal,
    });

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: isInternal
        ? "Internal note added successfully."
        : "Reply sent successfully.",
      ticket,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    console.error("Adding ticket message failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to add ticket message.",
    });
  }
};
