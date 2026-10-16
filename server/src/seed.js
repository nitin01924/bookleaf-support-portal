
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "./config/db.js";
import Author from "./models/Author.js";
import Book from "./models/Book.js";
import User from "./models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(
  __dirname,
  "../data/bookleaf_sample_data.json"
);

const DEMO_AUTHOR_PASSWORD = "Author@12345";
const DEMO_ADMIN_PASSWORD = "Admin@12345";

const seedDatabase = async () => {
  try {
    await connectDB();

    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    if (!Array.isArray(data.authors) || data.authors.length !== 10) {
      throw new Error("Expected exactly 10 authors in sample data");
    }

    const bookCount = data.authors.reduce(
      (total, author) => total + (author.books?.length || 0),
      0
    );

    if (bookCount !== 18) {
      throw new Error(`Expected 18 books, found ${bookCount}`);
    }

    const authorPasswordHash = await bcrypt.hash(
      DEMO_AUTHOR_PASSWORD,
      12
    );

    const adminPasswordHash = await bcrypt.hash(
      DEMO_ADMIN_PASSWORD,
      12
    );

    for (const authorData of data.authors) {
      const authorId = authorData.author_id;

      await Author.updateOne(
        { authorId },
        {
          $set: {
            name: authorData.name,
            email: authorData.email,
            phone: authorData.phone ?? "",
            city: authorData.city ?? "",
            joinedDate: authorData.joined_date
              ? new Date(authorData.joined_date)
              : null,
          },
        },
        { upsert: true, runValidators: true }
      );

      await User.updateOne(
        { email: authorData.email.toLowerCase() },
        {
          $setOnInsert: {
            email: authorData.email.toLowerCase(),
            passwordHash: authorPasswordHash,
            role: "author",
            authorId,
            isActive: true,
          },
        },
        { upsert: true, runValidators: true }
      );

      for (const bookData of authorData.books || []) {
        await Book.updateOne(
          { bookId: bookData.book_id },
          {
            $set: {
              bookId: bookData.book_id,
              authorId,
              title: bookData.title,
              isbn: bookData.isbn ?? null,
              genre: bookData.genre ?? "",
              publicationDate: bookData.publication_date
                ? new Date(bookData.publication_date)
                : null,
              status: bookData.status,
              mrp: bookData.mrp ?? null,
              authorRoyaltyPerCopy:
                bookData.author_royalty_per_copy ?? null,
              totalCopiesSold: bookData.total_copies_sold ?? 0,
              totalRoyaltyEarned: bookData.total_royalty_earned ?? 0,
              royaltyPaid: bookData.royalty_paid ?? 0,
              royaltyPending: bookData.royalty_pending ?? 0,
              lastRoyaltyPayoutDate: bookData.last_royalty_payout_date
                ? new Date(bookData.last_royalty_payout_date)
                : null,
              printPartner: bookData.print_partner ?? null,
              availableOn: bookData.available_on ?? [],
            },
          },
          { upsert: true, runValidators: true }
        );
      }
    }

    await User.updateOne(
      { email: "admin@bookleaf.local" },
      {
        $setOnInsert: {
          email: "admin@bookleaf.local",
          passwordHash: adminPasswordHash,
          role: "admin",
          authorId: null,
          isActive: true,
        },
      },
      { upsert: true, runValidators: true }
    );

    const [authors, books, users] = await Promise.all([
      Author.countDocuments(),
      Book.countDocuments(),
      User.countDocuments(),
    ]);

    console.log("Database seeding completed.");
    console.log({ authors, books, users });
    console.log("Demo author password:", DEMO_AUTHOR_PASSWORD);
    console.log("Demo admin email: admin@bookleaf.local");
    console.log("Demo admin password:", DEMO_ADMIN_PASSWORD);
  } catch (error) {
    console.error("Database seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
