import React, { useState, useEffect } from 'react';
import { getReservations, updateReservation } from '../api/library';
import { useAuth } from '../context/AuthContext';

function MyReservations({ onReservationChange }) {
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchReservations();
    }
  }, [isAuthenticated]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Fetch only pending reservations
      const data = await getReservations({ status: 'pending' });
      setReservations(data);
      setError('');
    } catch (err) {
      setError('Failed to load reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setCancelling(reservationId);
      await updateReservation(reservationId, { status: 'cancelled' });

      // Refresh reservations
      await fetchReservations();

      // Notify parent component to refresh book list
      if (onReservationChange) {
        onReservationChange();
      }

      alert('Reservation cancelled successfully!');
    } catch (err) {
      setError('Failed to cancel reservation');
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  if (!isAuthenticated() || user?.role !== 'student') {
    return null;
  }

  if (loading) {
    return (
      <div className="my-reservations">
        <h3>My Active Reservation</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-reservations">
        <h3>My Active Reservation</h3>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="my-reservations">
        <h3>My Active Reservation</h3>
        <p className="no-reservations">You don't have any active reservations. Reserve a book below to get started!</p>
      </div>
    );
  }

  const reservation = reservations[0]; // Students can only have 1 active reservation

  return (
    <div className="my-reservations">
      <h3>My Active Reservation</h3>
      <div className="reservation-card">
        <div className="reservation-info">
          <h4>{reservation.book?.title}</h4>
          <p className="reservation-author">by {reservation.book?.author}</p>
          {reservation.book?.room_number && (
            <p className="reservation-location">
              📍 Location: {reservation.book.room_number}
            </p>
          )}
          <p className="reservation-date">
            Reserved: {new Date(reservation.reservation_date).toLocaleDateString()}
          </p>
          {reservation.pickup_date && (
            <p className="reservation-pickup">
              Pickup: {new Date(reservation.pickup_date).toLocaleString()}
            </p>
          )}
        </div>
        <div className="reservation-actions">
          <button
            className="btn-cancel-reservation"
            onClick={() => handleCancelReservation(reservation.id)}
            disabled={cancelling === reservation.id}
          >
            {cancelling === reservation.id ? 'Cancelling...' : 'Cancel Reservation'}
          </button>
        </div>
      </div>
      <p className="reservation-note">
        ⚠️ You can only have one active reservation at a time. Cancel this reservation to reserve a different book.
      </p>
      <p className="reservation-note" style={{background: '#fff3cd', borderLeft: '4px solid #ff9800', marginTop: '0.5rem'}}>
        ⏰ Please pick up your book within 3 days. Reservations that are not picked up will be automatically cancelled.
      </p>
    </div>
  );
}

export default MyReservations;
