import React from 'react';

function BookCard({ book, onReserve, isTeacher, onEdit, onDelete }) {
  return (
    <div className="book-card">
      {!book.available && <div className="unavailable-badge">Reserved</div>}
      <div className="book-cover">
        <img src={book.cover} alt={book.title} />
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <div className="book-meta">
          <span className="book-genre">{book.genre}</span>
          <span className="book-year">{book.year}</span>
        </div>
        <p className="book-description">{book.description}</p>
        <p className="book-isbn">ISBN: {book.isbn}</p>
        {book.room_number && (
          <div className="book-location">
            <span className="location-icon">📍</span>
            <span className="location-text">Location: {book.room_number}</span>
          </div>
        )}
        <button
          className={`reserve-button ${!book.available ? 'disabled' : ''}`}
          onClick={() => onReserve(book)}
          disabled={!book.available}
        >
          {book.available ? 'Reserve for Pickup' : 'Currently Reserved'}
        </button>
        {isTeacher && (
          <div className="teacher-book-actions">
            <button className="btn-edit-book" onClick={() => onEdit(book)}>Edit</button>
            <button className="btn-delete-book" onClick={() => onDelete(book)}>Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCard;
