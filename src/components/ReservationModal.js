import React, { useState } from 'react';
import { createReservation } from '../api/library';
import { useAuth } from '../context/AuthContext';

function ReservationModal({ book, onClose, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    user_phone: '',
    pickup_date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createReservation({
        book_id: book.id,
        ...formData
      });
      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reserve Book</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-book-info">
          <h3>{book.title}</h3>
          <p>by {book.author}</p>
        </div>

        <div className="reservation-user-info">
          <p><strong>Reserving as:</strong> {user?.full_name} ({user?.email})</p>
        </div>

        <form onSubmit={handleSubmit} className="reservation-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="user_phone">Phone Number</label>
            <input
              type="tel"
              id="user_phone"
              name="user_phone"
              value={formData.user_phone}
              onChange={handleChange}
              placeholder="555-1234"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pickup_date">Preferred Pickup Date</label>
            <input
              type="datetime-local"
              id="pickup_date"
              name="pickup_date"
              value={formData.pickup_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any special requests or notes..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Reserving...' : 'Reserve Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationModal;
