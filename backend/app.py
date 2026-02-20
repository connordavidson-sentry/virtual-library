import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from config import Config
from models import db, bcrypt, User, Book, Reservation
from auth import get_current_user, teacher_required, student_or_teacher_required
from datetime import datetime
import sentry_sdk

sentry_sdk.init(
    dsn="https://84bc426841bfd59d35d8790e6955fd00@o4510743534829568.ingest.us.sentry.io/4510743813816320",
    # Add data like request headers and IP for users,
    # see https://docs.sentry.io/platforms/python/data-management/data-collected/ for more info
    send_default_pii=True,
    # Enable sending logs to Sentry
    enable_logs=True,
    # Set traces_sample_rate to 1.0 to capture 100%
    # of transactions for tracing.
    traces_sample_rate=1.0,
    # Set profile_session_sample_rate to 1.0 to profile 100%
    # of profile sessions.
    profile_session_sample_rate=1.0,
    # Set profile_lifecycle to "trace" to automatically
    # run the profiler on when there is an active transaction
    profile_lifecycle="trace",
)


app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)

# Create tables
with app.app_context():
    db.create_all()


# ========== Authentication Endpoints ==========

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()

    # Validate required fields
    required_fields = ['username', 'email', 'password', 'full_name', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Validate password length
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long'}), 400

    # Validate role
    if data['role'] not in ['student', 'teacher']:
        return jsonify({'error': 'Role must be either "student" or "teacher"'}), 400

    # Only teachers can create teacher accounts
    if data['role'] == 'teacher':
        try:
            verify_jwt_in_request()
            current_user = get_current_user()

            if not current_user or current_user.role != 'teacher':
                return jsonify({'error': 'Only teachers can create teacher accounts'}), 403
        except Exception as e:
            return jsonify({'error': 'Authentication required to create teacher accounts'}), 401

    # Check if username already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400

    # Check if email already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400

    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        role=data['role']
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    # Create tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()

    # Validate required fields
    if 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    # Find user by username
    user = User.query.filter_by(username=data['username']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401

    if not user.active:
        return jsonify({'error': 'User account is inactive'}), 401

    # Create tokens
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200


@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(user_id))

    return jsonify({
        'access_token': access_token
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user_info():
    """Get current user info"""
    current_user = get_current_user()

    if not current_user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify(current_user.to_dict()), 200


@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)"""
    return jsonify({'message': 'Logged out successfully'}), 200


# ========== Book Endpoints ==========

@app.route('/api/books', methods=['GET'])
def get_books():
    """Get all books with optional filtering"""
    genre = request.args.get('genre')
    search = request.args.get('search')
    available_only = request.args.get('available', 'false').lower() == 'true'
    
    query = Book.query
    
    if genre:
        query = query.filter_by(genre=genre)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Book.title.ilike(search_filter)) | (Book.author.ilike(search_filter))
        )
    
    if available_only:
        query = query.filter_by(available=True)
    
    books = query.all()
    return jsonify([book.to_dict() for book in books])


@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """Get a specific book by ID"""
    book = Book.query.get_or_404(book_id)
    return jsonify(book.to_dict())


@app.route('/api/books', methods=['POST'])
@teacher_required
def create_book():
    """Create a new book"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'author', 'genre', 'year', 'isbn', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if ISBN already exists
    if Book.query.filter_by(isbn=data['isbn']).first():
        return jsonify({'error': 'Book with this ISBN already exists'}), 400
    
    book = Book(
        title=data['title'],
        author=data['author'],
        genre=data['genre'],
        year=data['year'],
        isbn=data['isbn'],
        description=data['description'],
        cover=data.get('cover', ''),
        available=data.get('available', True)
    )
    
    db.session.add(book)
    db.session.commit()
    
    return jsonify(book.to_dict()), 201


@app.route('/api/books/<int:book_id>', methods=['PUT'])
@teacher_required
def update_book(book_id):
    """Update a book"""
    book = Book.query.get_or_404(book_id)
    data = request.get_json()
    
    # Update fields if provided
    if 'title' in data:
        book.title = data['title']
    if 'author' in data:
        book.author = data['author']
    if 'genre' in data:
        book.genre = data['genre']
    if 'year' in data:
        book.year = data['year']
    if 'description' in data:
        book.description = data['description']
    if 'cover' in data:
        book.cover = data['cover']
    if 'available' in data:
        book.available = data['available']
    
    db.session.commit()
    
    return jsonify(book.to_dict())


@app.route('/api/books/<int:book_id>', methods=['DELETE'])
@teacher_required
def delete_book(book_id):
    """Delete a book"""
    book = Book.query.get_or_404(book_id)
    db.session.delete(book)
    db.session.commit()
    
    return jsonify({'message': 'Book deleted successfully'}), 200


# ========== Reservation Endpoints ==========

def expire_old_reservations():
    """Auto-expire pending reservations older than 3 days"""
    expired_reservations = Reservation.query.filter_by(status='pending').all()

    for reservation in expired_reservations:
        if reservation.is_expired(days=3):
            reservation.status = 'expired'
            # Make book available again (if book still exists)
            if reservation.book:
                reservation.book.available = True

    db.session.commit()


@app.route('/api/reservations', methods=['GET'])
@student_or_teacher_required
def get_reservations():
    """Get all reservations with optional filtering"""
    # Auto-expire old reservations before returning results
    expire_old_reservations()

    current_user = get_current_user()

    status = request.args.get('status')
    book_id = request.args.get('book_id')
    user_email = request.args.get('user_email')

    query = Reservation.query

    # Students can only see their own reservations
    if current_user.role == 'student':
        query = query.filter_by(user_id=current_user.id)

    # Teachers can see all reservations (no additional filter)

    if status:
        query = query.filter_by(status=status)

    if book_id:
        query = query.filter_by(book_id=book_id)

    if user_email:
        query = query.filter_by(user_email=user_email)

    reservations = query.order_by(Reservation.reservation_date.desc()).all()
    return jsonify([reservation.to_dict() for reservation in reservations])


@app.route('/api/reservations/<int:reservation_id>', methods=['GET'])
def get_reservation(reservation_id):
    """Get a specific reservation by ID"""
    reservation = Reservation.query.get_or_404(reservation_id)
    return jsonify(reservation.to_dict())


@app.route('/api/reservations', methods=['POST'])
@student_or_teacher_required
def create_reservation():
    """Create a new reservation"""
    current_user = get_current_user()
    data = request.get_json()

    # Validate required fields
    required_fields = ['book_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Check if book exists and is available
    book = Book.query.get_or_404(data['book_id'])

    if not book.available:
        return jsonify({'error': 'Book is not available for reservation'}), 400

    # Limit students to one active reservation at a time
    if current_user.role == 'student':
        active_reservation = Reservation.query.filter_by(
            user_id=current_user.id,
            status='pending'
        ).first()

        if active_reservation:
            return jsonify({
                'error': 'You already have an active reservation. Please pick up or cancel your current reservation before reserving another book.',
                'active_reservation': {
                    'book_title': active_reservation.book.title,
                    'reservation_id': active_reservation.id
                }
            }), 400

    try:
        # Create reservation using authenticated user's info
        reservation = Reservation(
            book_id=data['book_id'],
            user_id=current_user.id,
            user_name=current_user.full_name,
            user_email=current_user.email,
            user_phone=data.get('user_phone', ''),
            pickup_date=datetime.fromisoformat(data['pickup_date']) if data.get('pickup_date') else None,
            notes=data.get('notes', ''),
            status='pending'
        )

        # Mark book as unavailable
        book.available = False

        db.session.add(reservation)
        db.session.commit()

        return jsonify(reservation.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        sentry_sdk.capture_exception(e)
        return jsonify({'error': f'Failed to create reservation: {str(e)}'}), 500


@app.route('/api/reservations/<int:reservation_id>', methods=['PUT'])
@student_or_teacher_required
def update_reservation(reservation_id):
    """Update a reservation"""
    current_user = get_current_user()
    reservation = Reservation.query.get_or_404(reservation_id)

    # Students can only update their own reservations
    if current_user.role == 'student' and reservation.user_id != current_user.id:
        return jsonify({'error': 'You can only update your own reservations'}), 403

    data = request.get_json()

    old_status = reservation.status

    # Update fields if provided
    if 'status' in data:
        reservation.status = data['status']

        # If cancelling or expiring, make book available again
        if data['status'] in ['cancelled', 'expired'] and old_status not in ['cancelled', 'expired']:
            reservation.book.available = True

        # If picking up, keep book unavailable
        if data['status'] == 'picked_up':
            reservation.book.available = False

    if 'pickup_date' in data:
        reservation.pickup_date = datetime.fromisoformat(data['pickup_date']) if data['pickup_date'] else None

    if 'notes' in data:
        reservation.notes = data['notes']

    db.session.commit()

    return jsonify(reservation.to_dict())


@app.route('/api/reservations/<int:reservation_id>', methods=['DELETE'])
@student_or_teacher_required
def delete_reservation(reservation_id):
    """Delete a reservation and make book available again"""
    current_user = get_current_user()
    reservation = Reservation.query.get_or_404(reservation_id)

    # Students can only delete their own reservations
    if current_user.role == 'student' and reservation.user_id != current_user.id:
        return jsonify({'error': 'You can only delete your own reservations'}), 403

    # Make book available again
    reservation.book.available = True

    db.session.delete(reservation)
    db.session.commit()

    return jsonify({'message': 'Reservation deleted successfully'}), 200


# ========== Utility Endpoints ==========

@app.route('/api/genres', methods=['GET'])
def get_genres():
    """Get all unique genres"""
    genres = db.session.query(Book.genre).distinct().all()
    return jsonify([genre[0] for genre in genres])


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Virtual Library API is running'})


@app.route('/api/setup-admin', methods=['POST'])
def setup_admin():
    """One-time endpoint to create the first teacher account. Remove after use."""
    setup_key = os.environ.get('SETUP_KEY')
    if not setup_key:
        return jsonify({'error': 'Setup not enabled'}), 403

    data = request.get_json()
    if data.get('setup_key') != setup_key:
        return jsonify({'error': 'Invalid setup key'}), 403

    if User.query.filter_by(role='teacher').first():
        return jsonify({'error': 'A teacher account already exists'}), 400

    required = ['username', 'email', 'password', 'full_name']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    user = User(
        username=data['username'],
        email=data['email'],
        full_name=data['full_name'],
        role='teacher'
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': f"Teacher account '{data['username']}' created successfully"}), 201


# JWT Error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401


@jwt.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({'error': 'Authorization required'}), 401


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    sentry_sdk.capture_exception(error)
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
