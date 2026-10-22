
import Book from "../models/Book.js";

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
