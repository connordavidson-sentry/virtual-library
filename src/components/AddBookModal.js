import React, { useState } from 'react';
import { createBook } from '../api/library';

function AddBookModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    year: '',
    isbn: '',
    description: '',
    cover: '',
    room_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLookupMessage('');
  };

  const handleISBNLookup = async () => {
    if (!formData.isbn.trim()) {
      setError('Please enter an ISBN first');
      return;
    }

    setLookupLoading(true);
    setError('');
    setLookupMessage('');

    try {
      // Clean ISBN (remove hyphens and spaces)
      const cleanISBN = formData.isbn.replace(/[-\s]/g, '');

      // Call Google Books API
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch book information');
      }

      const data = await response.json();

      if (data.totalItems === 0) {
        setError('No book found with this ISBN. Please enter details manually.');
        setLookupLoading(false);
        return;
      }

      const book = data.items[0].volumeInfo;

      // Extract categories/genres
      const genre = book.categories ? book.categories[0] : '';

      // Extract year from publishedDate
      const year = book.publishedDate ? book.publishedDate.split('-')[0] : '';

      // Get the best quality cover image
      const coverImage = book.imageLinks?.large ||
                        book.imageLinks?.medium ||
                        book.imageLinks?.thumbnail ||
                        book.imageLinks?.smallThumbnail ||
                        '';

      // Update form data with fetched information
      setFormData({
        ...formData,
        title: book.title || formData.title,
        author: book.authors ? book.authors.join(', ') : formData.author,
        genre: genre || formData.genre,
        year: year || formData.year,
        description: book.description || formData.description,
        cover: coverImage || formData.cover
      });

      setLookupMessage('✓ Book information loaded successfully!');
    } catch (err) {
      setError(err.message || 'Failed to lookup ISBN. Please try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createBook({
        ...formData,
        year: parseInt(formData.year)
      });

      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-book-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Book</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="reservation-form">
          {error && <div className="error-message">{error}</div>}
          {lookupMessage && <div className="success-message">{lookupMessage}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter book title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              placeholder="Enter author name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genre">Genre *</label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                placeholder="e.g., Fiction, Fantasy"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min="1000"
                max="2100"
                placeholder="2024"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN *</label>
            <div className="isbn-lookup-container">
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                placeholder="978-0-123456-78-9"
                className="isbn-input"
              />
              <button
                type="button"
                onClick={handleISBNLookup}
                disabled={lookupLoading || !formData.isbn.trim()}
                className="btn-lookup"
              >
                {lookupLoading ? 'Looking up...' : 'Lookup ISBN'}
              </button>
            </div>
            <small className="help-text">
              Enter the ISBN and click "Lookup ISBN" to auto-fill book details
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="cover">Cover Image URL</label>
            <input
              type="url"
              id="cover"
              name="cover"
              value={formData.cover}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="room_number">Room Number</label>
            <input
              type="text"
              id="room_number"
              name="room_number"
              value={formData.room_number}
              onChange={handleChange}
              placeholder="e.g., Room 101, Library Wing A"
            />
            <small className="help-text">
              Location where students can find this book
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Enter a brief description of the book..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddBookModal;
