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
