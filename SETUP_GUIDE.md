# Virtual Library - Complete Setup Guide

A full-stack virtual library application with React frontend and Python Flask backend.

## Features

### Frontend (React)
- Browse a collection of books with images and details
- Search books by title or author
- Filter books by genre
- Reserve books for in-person pickup
- Real-time availability status
- Responsive design for all devices

### Backend (Python Flask)
- RESTful API for books and reservations
- SQLite database for data persistence
- Automatic availability tracking
- CRUD operations for books and reservations
- Search and filter capabilities

## Project Structure

```
Virtual Library Project/
├── frontend (React app)
│   ├── src/
│   │   ├── api/
│   │   │   └── library.js          # API client
│   │   ├── components/
│   │   │   ├── BookCard.js         # Individual book display
│   │   │   ├── BookList.js         # Books grid
│   │   │   ├── SearchBar.js        # Search & filter
│   │   │   └── ReservationModal.js # Reservation form
│   │   ├── data/
│   │   │   └── books.js            # Fallback book data
│   │   ├── styles/
│   │   │   └── App.css             # All styles
│   │   ├── App.js                  # Main component
│   │   └── index.js                # Entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── backend (Flask API)
    ├── app.py                       # Main Flask app
    ├── models.py                    # Database models
    ├── config.py                    # Configuration
    ├── seed.py                      # Database seeding
    ├── requirements.txt             # Python dependencies
    ├── library.db                   # SQLite database
    └── README.md                    # Backend docs
```

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd "backend"
   ```

2. **Create and activate virtual environment (if not already done):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies (if not already done):**
   ```bash
   pip install -r requirements.txt
   ```

4. **Seed the database (if not already done):**
   ```bash
   python seed.py
   ```

5. **Start the backend server:**
   ```bash
   python app.py
   ```
   
   Backend will run at: **http://localhost:5000**

### Frontend Setup

1. **Open a new terminal and navigate to the project root:**
   ```bash
   cd "/Users/connordavidson/Documents/Virtual Library Project"
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```
   
   Frontend will open at: **http://localhost:3000**

## Using the Application

### Browsing Books
1. Open http://localhost:3000 in your browser
2. Browse the collection of 12 books displayed in a grid
3. Use the search bar to find books by title or author
4. Filter by genre using the dropdown

### Reserving a Book
1. Click the "Reserve for Pickup" button on any available book
2. Fill in the reservation form:
   - Full Name (required)
   - Email (required)
   - Phone Number (optional)
   - Preferred Pickup Date (optional)
   - Additional Notes (optional)
3. Click "Reserve Book"
4. The book will be marked as "Reserved" and unavailable for others

### Book Availability
- **Available books**: Show a blue "Reserve for Pickup" button
- **Reserved books**: Show a red "Reserved" badge and a disabled button

## API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books?search=query` - Search books
- `GET /api/books?genre=Fantasy` - Filter by genre
- `GET /api/books?available=true` - Get only available books
- `GET /api/books/<id>` - Get specific book
- `POST /api/books` - Create a new book
- `PUT /api/books/<id>` - Update a book
- `DELETE /api/books/<id>` - Delete a book

### Reservations
- `GET /api/reservations` - Get all reservations
- `GET /api/reservations?status=pending` - Filter by status
- `GET /api/reservations?user_email=user@example.com` - Get user's reservations
- `POST /api/reservations` - Create a reservation
- `PUT /api/reservations/<id>` - Update a reservation
- `DELETE /api/reservations/<id>` - Delete a reservation

### Utility
- `GET /api/genres` - Get all genres
- `GET /api/health` - Health check

## Testing the API

You can test the API using curl:

```bash
# Get all books
curl http://localhost:5000/api/books

# Search for books
curl "http://localhost:5000/api/books?search=tolkien"

# Create a reservation
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "555-1234"
  }'

# Get all reservations
curl http://localhost:5000/api/reservations
```

## Database Schema

### Books Table
- `id` - Primary key
- `title` - Book title
- `author` - Author name
- `genre` - Genre category
- `year` - Publication year
- `isbn` - Unique ISBN
- `description` - Book description
- `cover` - Cover image URL
- `available` - Availability status
- `created_at` - Creation timestamp

### Reservations Table
- `id` - Primary key
- `book_id` - Foreign key to books
- `user_name` - Customer name
- `user_email` - Customer email
- `user_phone` - Customer phone
- `reservation_date` - When reserved
- `pickup_date` - Preferred pickup time
- `status` - Status (pending/picked_up/cancelled)
- `notes` - Additional notes
- `created_at` - Creation timestamp

## Current Status

✅ Backend server is running on http://localhost:5000
✅ Database seeded with 12 books
✅ All API endpoints functional
✅ Frontend components created
✅ Reservation system implemented
✅ Sentry error tracking configured

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

**Database errors:**
```bash
# Reset the database
rm backend/library.db
python backend/seed.py
```

### Frontend Issues

**React server won't start (EMFILE error):**
```bash
# Increase file watch limit on macOS
echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536
```

**API connection errors:**
- Ensure backend is running on http://localhost:5000
- Check browser console for CORS errors
- Verify the API base URL in `src/api/library.js`

## Next Steps

Consider adding:
1. User authentication and accounts
2. Book reviews and ratings
3. Email notifications for reservations
4. Admin dashboard for managing books
5. Due dates and late fees
6. Book recommendations
7. Advanced search with filters
8. Reservation history for users
9. PostgreSQL for production
10. Deploy to cloud (Heroku, AWS, etc.)

## Technologies Used

### Frontend
- React 18.2.0
- Modern ES6+ JavaScript
- CSS3 with animations
- Fetch API for HTTP requests
- Sentry for error tracking

### Backend
- Python 3.9+
- Flask 3.0.0
- Flask-SQLAlchemy 3.1.1
- Flask-CORS 4.0.0
- SQLite database

## Development

Both servers support hot-reload:
- **Backend**: Flask debug mode auto-restarts on code changes
- **Frontend**: React dev server auto-refreshes on code changes

Happy coding! 📚
