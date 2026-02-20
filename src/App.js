import React, { useState, useEffect, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import BookList from './components/BookList';
import ReservationModal from './components/ReservationModal';
import AddBookModal from './components/AddBookModal';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import TeacherAdminPanel from './components/TeacherAdminPanel';
import MyReservations from './components/MyReservations';
import TeacherDashboard from './components/TeacherDashboard';
import { useAuth } from './context/AuthContext';
import { getBooks, getGenres } from './api/library';
import './styles/App.css';

function ErrorButton() {
  return (
    <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
    >
      Break the world
    </button>
  );
}

function App() {
  const { user, logout, isAuthenticated, isTeacher } = useAuth();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Fetch books and genres on mount
  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await getBooks();
      setBooks(data);
      setError('');
    } catch (err) {
      setError('Failed to load books. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await getGenres();
      setGenres(data);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const handleReserve = (book) => {
    if (!isAuthenticated()) {
      alert('Please log in to reserve a book');
      setShowLoginModal(true);
      return;
    }
    setSelectedBook(book);
    setShowReservationModal(true);
  };

  const handleAddBookClick = () => {
    if (!isAuthenticated()) {
      alert('Please log in to add a book');
      setShowLoginModal(true);
      return;
    }
    if (!isTeacher()) {
      alert('Only teachers can add books');
      return;
    }
    setShowAddBookModal(true);
  };

  const handleLogout = () => {
    logout();
    alert('Logged out successfully');
  };

  const switchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const switchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const handleReservationSuccess = () => {
    setShowReservationModal(false);
    setSelectedBook(null);
    fetchBooks(); // Refresh books to update availability
    alert('Book reserved successfully! You will receive a confirmation email.');
  };

  const handleAddBookSuccess = () => {
    setShowAddBookModal(false);
    fetchBooks(); // Refresh books to show the new book
    fetchGenres(); // Refresh genres in case a new one was added
    alert('Book added successfully!');
  };

  // Filter books based on search term and genre
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
      
      return matchesSearch && matchesGenre;
    });
  }, [books, searchTerm, selectedGenre]);

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📚 Virtual Library</h1>
            <p className="subtitle">
              {loading ? 'Loading...' : `Explore our collection of ${books.length} books`}
            </p>
          </div>
          <div className="header-right">
            {isAuthenticated() ? (
              <div className="user-info">
                <span className="user-greeting">
                  Welcome, {user?.full_name} ({user?.role})
                </span>
                {isTeacher() && (
                  <button className="btn-admin" onClick={() => setShowAdminPanel(true)}>
                    Admin Panel
                  </button>
                )}
                <button className="btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-secondary" onClick={() => setShowLoginModal(true)}>
                  Login
                </button>
                <button className="btn-primary" onClick={() => setShowSignupModal(true)}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
          <ErrorButton />
        </div>
      </header>
      
      <main className="app-main">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="controls-section">
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedGenre={selectedGenre}
                onGenreChange={setSelectedGenre}
                genres={genres}
              />
              {isTeacher() && (
                <button
                  className="add-book-button"
                  onClick={handleAddBookClick}
                >
                  + Add New Book
                </button>
              )}
            </div>

            {/* Show active reservations for students */}
            <MyReservations onReservationChange={fetchBooks} />

            {/* Show dashboard for teachers */}
            <TeacherDashboard onReservationChange={fetchBooks} />

            <div className="results-count">
              Showing {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
            </div>

            <BookList books={filteredBooks} onReserve={handleReserve} />
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Virtual Library &copy; 2026 | Built with React</p>
      </footer>

      {showReservationModal && selectedBook && (
        <ReservationModal
          book={selectedBook}
          onClose={() => setShowReservationModal(false)}
          onSuccess={handleReservationSuccess}
        />
      )}

      {showAddBookModal && (
        <AddBookModal
          onClose={() => setShowAddBookModal(false)}
          onSuccess={handleAddBookSuccess}
        />
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={switchToSignup}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={switchToLogin}
      />

      <TeacherAdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  );
}

export default App;
