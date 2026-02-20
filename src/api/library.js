const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Book API calls
export const getBooks = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.search) params.append('search', filters.search);
  if (filters.available) params.append('available', 'true');
  
  const url = `${API_BASE_URL}/books${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch books');
  return response.json();
};

export const getBook = async (bookId) => {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`);
  if (!response.ok) throw new Error('Failed to fetch book');
  return response.json();
};

export const createBook = async (bookData) => {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create book');
  }

  return response.json();
};

export const updateBook = async (bookId, bookData) => {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(bookData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update book');
  }

  return response.json();
};

export const deleteBook = async (bookId) => {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete book');
  }

  return response.json();
};

// Reservation API calls
export const createReservation = async (reservationData) => {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(reservationData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create reservation');
  }

  return response.json();
};

export const getReservations = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.book_id) params.append('book_id', filters.book_id);
  if (filters.user_email) params.append('user_email', filters.user_email);

  const url = `${API_BASE_URL}/reservations${params.toString() ? '?' + params.toString() : ''}`;

  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch reservations');
  return response.json();
};

export const updateReservation = async (reservationId, updateData) => {
  const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  if (!response.ok) throw new Error('Failed to update reservation');
  return response.json();
};

// Utility API calls
export const getGenres = async () => {
  const response = await fetch(`${API_BASE_URL}/genres`);
  if (!response.ok) throw new Error('Failed to fetch genres');
  return response.json();
};
