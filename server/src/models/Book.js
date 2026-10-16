
import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      default: null,
    },
    genre: {
      type: String,
      default: "",
    },
    publicationDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
    },
    mrp: {
      type: Number,
      default: null,
      min: 0,
    },
    authorRoyaltyPerCopy: {
      type: Number,
      default: null,
      min: 0,
    },
    totalCopiesSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRoyaltyEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    royaltyPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    royaltyPending: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRoyaltyPayoutDate: {
      type: Date,
      default: null,
    },
    printPartner: {
      type: String,
      default: null,
    },
    availableOn: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
