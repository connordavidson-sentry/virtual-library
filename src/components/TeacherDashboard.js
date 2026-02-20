import React, { useState, useEffect } from 'react';
import { getReservations, updateReservation } from '../api/library';
import { useAuth } from '../context/AuthContext';

function TeacherDashboard({ onReservationChange }) {
  const { isTeacher } = useAuth();
  const [pendingReservations, setPendingReservations] = useState([]);
  const [recentPickups, setRecentPickups] = useState([]);
  const [expiredReservations, setExpiredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    if (isTeacher()) {
      fetchReservations();
    }
  }, [isTeacher]);

  const fetchReservations = async () => {
    try {
      setLoading(true);

      // Fetch all reservations
      const allReservations = await getReservations({});

      // Separate by status
      const pending = allReservations.filter(r => r.status === 'pending');
      const pickedUp = allReservations
        .filter(r => r.status === 'picked_up')
        .slice(0, 5); // Show only 5 most recent
      const expired = allReservations.filter(r => r.status === 'expired');

      setPendingReservations(pending);
      setRecentPickups(pickedUp);
      setExpiredReservations(expired);
      setError('');
    } catch (err) {
      setError('Failed to load reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPickedUp = async (reservationId) => {
    try {
      setProcessing(reservationId);
      await updateReservation(reservationId, { status: 'picked_up' });

      // Refresh reservations
      await fetchReservations();

      // Notify parent to refresh book list
      if (onReservationChange) {
        onReservationChange();
      }

      alert('Book marked as picked up!');
    } catch (err) {
      setError('Failed to update reservation');
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  if (!isTeacher()) {
    return null;
  }

  if (loading) {
    return (
      <div className="teacher-dashboard">
        <h2>Teacher Dashboard</h2>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">
      <h2>📊 Teacher Dashboard</h2>

      {error && <div className="error-message">{error}</div>}

      {/* Pending Pickups Section */}
      <div className="dashboard-section">
        <h3>📚 Pending Pickups ({pendingReservations.length})</h3>
        {pendingReservations.length === 0 ? (
          <p className="no-data">No pending pickups</p>
        ) : (
          <div className="reservations-list">
            {pendingReservations.map((reservation) => (
              <div key={reservation.id} className="reservation-item pending">
                <div className="reservation-details">
                  <h4>{reservation.book?.title}</h4>
                  <p className="student-name">Student: {reservation.user_name}</p>
                  <p className="student-email">Email: {reservation.user_email}</p>
                  {reservation.user_phone && (
                    <p className="student-phone">Phone: {reservation.user_phone}</p>
                  )}
                  <p className="reservation-time">
                    Reserved: {new Date(reservation.reservation_date).toLocaleString()}
                  </p>
                  {reservation.book?.room_number && (
                    <p className="book-location">📍 {reservation.book.room_number}</p>
                  )}
                </div>
                <div className="reservation-actions">
                  <button
                    className="btn-mark-picked-up"
                    onClick={() => handleMarkAsPickedUp(reservation.id)}
                    disabled={processing === reservation.id}
                  >
                    {processing === reservation.id ? 'Processing...' : '✓ Mark as Picked Up'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Pickups Section */}
      <div className="dashboard-section">
        <h3>✅ Recent Pickups</h3>
        {recentPickups.length === 0 ? (
          <p className="no-data">No recent pickups</p>
        ) : (
          <div className="reservations-list compact">
            {recentPickups.map((reservation) => (
              <div key={reservation.id} className="reservation-item picked-up">
                <div className="reservation-details">
                  <p className="book-title">{reservation.book?.title}</p>
                  <p className="student-name-small">{reservation.user_name}</p>
                  <p className="pickup-time">
                    Picked up: {new Date(reservation.reservation_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expired Reservations Section */}
      {expiredReservations.length > 0 && (
        <div className="dashboard-section">
          <h3>⏰ Expired Reservations ({expiredReservations.length})</h3>
          <div className="reservations-list compact">
            {expiredReservations.map((reservation) => (
              <div key={reservation.id} className="reservation-item expired">
                <div className="reservation-details">
                  <p className="book-title">{reservation.book?.title}</p>
                  <p className="student-name-small">{reservation.user_name}</p>
                  <p className="expired-time">
                    Reserved: {new Date(reservation.reservation_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;
