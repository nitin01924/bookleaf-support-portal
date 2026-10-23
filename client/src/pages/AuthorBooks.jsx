import { useEffect, useState } from "react";
import { apiRequest } from "../api/client.js";
import { StatusBadge } from "../components/Badges.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/States.jsx";
import Icon from "../components/Icon.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";

export default function AuthorBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/api/author/books");
      setBooks(Array.isArray(result?.books) ? result.books : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="page-heading"><div><span className="eyebrow">YOUR CATALOGUE</span><h1>My books</h1><p>Books linked to your BookLeaf author account.</p></div><span className="count-pill">{books.length} {books.length === 1 ? "book" : "books"}</span></div>
      {loading ? <LoadingState label="Loading your books…" /> : error ? <ErrorState message={error} onRetry={load} /> : books.length === 0 ? <div className="surface-card"><EmptyState title="No books found" message="There are no books linked to this author account yet." /></div> : (
        <div className="book-grid">
          {books.map((book) => {
            const royaltyPending = formatCurrency(book.royaltyPending);
            const royaltyEarned = formatCurrency(book.totalRoyaltyEarned);
            return <article className="surface-card book-card" key={book.bookId || book._id}>
              <div className="book-card-top"><span className="book-cover large"><Icon name="books" size={27} /></span><StatusBadge value={book.status} /></div>
              <h2>{book.title || "Untitled book"}</h2>
              <div className="book-id">BOOK ID <strong>{book.bookId || "—"}</strong></div>
              {book.isbn && <div className="book-meta-row"><span>ISBN</span><strong>{book.isbn}</strong></div>}
              {book.genre && <div className="book-meta-row"><span>Genre</span><strong>{book.genre}</strong></div>}
              {book.publicationDate && <div className="book-meta-row"><span>Publication date</span><strong>{formatDate(book.publicationDate)}</strong></div>}
              {(royaltyPending || royaltyEarned) && <div className="royalty-strip">
                {royaltyPending && <div><span>Pending royalties</span><strong>{royaltyPending}</strong></div>}
                {royaltyEarned && <div><span>Total earned</span><strong>{royaltyEarned}</strong></div>}
              </div>}
              {Array.isArray(book.availableOn) && book.availableOn.length > 0 && <div className="available-on"><span>Available on</span><p>{book.availableOn.join(" · ")}</p></div>}
              {!book.isbn && !book.genre && !book.publicationDate && !royaltyPending && !royaltyEarned && <p className="book-note"><Icon name="check" size={15} />Showing details currently available for this book.</p>}
            </article>;
          })}
        </div>
      )}
    </>
  );
}
