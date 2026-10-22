
import Book from "../models/Book.js";
import Ticket from "../models/Ticket.js";

export const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({
      authorId: req.user.authorId,
    }).sort({ title: 1 });

    return res.status(200).json({
      success: true,
      count: books.length,
      books,
    });
  } catch (error) {
    console.error("Failed to fetch author books:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve books.",
    });
  }
};



export const createTicket = async (req, res) => {
  try {
    const { bookId, subject, description } = req.body;

    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Subject and description are required.",
      });
    }

    if (subject.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: "Subject must be 200 characters or fewer.",
      });
    }

    if (description.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Description must be 5000 characters or fewer.",
      });
    }

    let selectedBook = null;

    if (bookId) {
      selectedBook = await Book.findOne({
        bookId,
        authorId: req.user.authorId,
      });

      if (!selectedBook) {
        return res.status(404).json({
          success: false,
          message: "Book not found for this author.",
        });
      }
    }

    const ticket = await Ticket.create({
      authorId: req.user.authorId,
      bookId: selectedBook ? selectedBook.bookId : null,
      subject: subject.trim(),
      description: description.trim(),
      category: "General Inquiry",
      priority: "Medium",
      status: "Open",
      messages: [
        {
          senderRole: "author",
          senderId: req.user.id,
          body: description.trim(),
          isInternal: false,
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket,
    });
  } catch (error) {
    console.error("Ticket creation failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create support ticket.",
    });
  }
};



export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({
      authorId: req.user.authorId,
    }).sort({ createdAt: -1 });

    const visibleTickets = tickets.map((ticket) => {
      const ticketObject = ticket.toObject();

      ticketObject.messages = ticketObject.messages.filter(
        (message) => !message.isInternal
      );

      return ticketObject;
    });

    return res.status(200).json({
      success: true,
      count: visibleTickets.length,
      tickets: visibleTickets,
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve tickets.",
    });
  }
};

