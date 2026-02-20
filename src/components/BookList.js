import React from 'react';
import BookCard from './BookCard';

function BookList({ books, onReserve, isTeacher, onEdit, onDelete }) {
  if (books.length === 0) {
    return (
      <div className="no-results">
        <p>No books found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="book-list">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onReserve={onReserve}
          isTeacher={isTeacher}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default BookList;
