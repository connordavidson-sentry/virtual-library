import React, { useState } from 'react';
import { updateBook } from '../api/library';

function EditBookModal({ book, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: book.title || '',
    author: book.author || '',
    genre: book.genre || '',
    year: book.year || '',
    isbn: book.isbn || '',
    description: book.description || '',
    cover: book.cover || '',
    room_number: book.room_number || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateBook(book.id, { ...formData, year: parseInt(formData.year) });
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
          <h2>Edit Book</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="reservation-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="author">Author *</label>
            <input type="text" id="author" name="author" value={formData.author} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="genre">Genre *</label>
              <input type="text" id="genre" name="genre" value={formData.genre} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} required min="1000" max="2100" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="isbn">ISBN *</label>
            <input type="text" id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="cover">Cover Image URL</label>
            <input type="url" id="cover" name="cover" value={formData.cover} onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>

          <div className="form-group">
            <label htmlFor="room_number">Room Number</label>
            <input type="text" id="room_number" name="room_number" value={formData.room_number} onChange={handleChange} placeholder="e.g., Room 101, Library Wing A" />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows="4" />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBookModal;
