# Virtual Library Backend

A Flask REST API backend for the Virtual Library application. Manages books and user reservations.

## Features

- **Book Management**: CRUD operations for library books
- **Reservation System**: Users can reserve books for in-person pickup
- **Search & Filter**: Search books by title/author and filter by genre
- **Availability Tracking**: Automatically tracks book availability based on reservations

## API Endpoints

### Books

- `GET /api/books` - Get all books (supports query params: `genre`, `search`, `available`)
- `GET /api/books/<id>` - Get a specific book
- `POST /api/books` - Create a new book
- `PUT /api/books/<id>` - Update a book
- `DELETE /api/books/<id>` - Delete a book
- `GET /api/genres` - Get all unique genres

### Reservations

- `GET /api/reservations` - Get all reservations (supports query params: `status`, `book_id`, `user_email`)
- `GET /api/reservations/<id>` - Get a specific reservation
- `POST /api/reservations` - Create a new reservation
- `PUT /api/reservations/<id>` - Update a reservation
- `DELETE /api/reservations/<id>` - Delete a reservation

### Utility

- `GET /api/health` - Health check endpoint

## Setup Instructions

### 1. Create a Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Seed the Database

```bash
python seed.py
```

### 4. Run the Development Server

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## Database Schema

### Book Model
- `id`: Integer (Primary Key)
- `title`: String (required)
- `author`: String (required)
- `genre`: String (required)
- `year`: Integer (required)
- `isbn`: String (unique, required)
- `description`: Text (required)
- `cover`: String (URL)
- `available`: Boolean (default: True)
- `created_at`: DateTime

### Reservation Model
- `id`: Integer (Primary Key)
- `book_id`: Foreign Key to Book
- `user_name`: String (required)
- `user_email`: String (required)
- `user_phone`: String (optional)
- `reservation_date`: DateTime
- `pickup_date`: DateTime (optional)
- `status`: String (`pending`, `picked_up`, `cancelled`)
- `notes`: Text (optional)
- `created_at`: DateTime

## Example API Usage

### Create a Reservation

```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "book_id": 1,
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "user_phone": "555-1234",
    "pickup_date": "2026-01-20T14:00:00",
    "notes": "Please hold until 3pm"
  }'
```

### Get Available Books

```bash
curl http://localhost:5000/api/books?available=true
```

### Search Books

```bash
curl "http://localhost:5000/api/books?search=tolkien"
```

### Filter by Genre

```bash
curl "http://localhost:5000/api/books?genre=Fantasy"
```

## Development

The backend uses:
- **Flask** - Web framework
- **Flask-SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Enable CORS for frontend integration
- **SQLite** - Database (development)

## Production Considerations

For production deployment:
1. Use PostgreSQL or MySQL instead of SQLite
2. Set proper environment variables (SECRET_KEY, DATABASE_URL)
3. Enable proper authentication/authorization
4. Add rate limiting
5. Use a production WSGI server (e.g., Gunicorn)
6. Add input validation and sanitization
7. Implement proper logging and monitoring
