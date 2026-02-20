from app import app, db
from models import Book, User
import requests
import time

# Initial book data
books_data = [
    {
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "genre": "Fiction",
        "year": 1960,
        "isbn": "978-0-06-112008-4",
        "description": "A gripping tale of racial injustice and childhood innocence in the American South.",
        "cover": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        "room_number": "Room 101"
    },
    {
        "title": "1984",
        "author": "George Orwell",
        "genre": "Dystopian",
        "year": 1949,
        "isbn": "978-0-452-28423-4",
        "description": "A dystopian social science fiction novel that explores surveillance, truth, and totalitarianism.",
        "cover": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
        "room_number": "Room 203"
    },
    {
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "genre": "Romance",
        "year": 1813,
        "isbn": "978-0-14-143951-8",
        "description": "A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.",
        "cover": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
        "room_number": "Room 105"
    },
    {
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "genre": "Fiction",
        "year": 1925,
        "isbn": "978-0-7432-7356-5",
        "description": "A portrait of the Jazz Age in all of its decadence and excess.",
        "cover": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        "room_number": "Room 101"
    },
    {
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "genre": "Fiction",
        "year": 1951,
        "isbn": "978-0-316-76948-0",
        "description": "A story about teenage rebellion and alienation narrated by Holden Caulfield.",
        "cover": "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&h=600&fit=crop",
        "room_number": "Library Wing A"
    },
    {
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "genre": "Fantasy",
        "year": 1937,
        "isbn": "978-0-547-92822-7",
        "description": "A fantasy novel about the quest of home-loving Bilbo Baggins to win a share of treasure guarded by a dragon.",
        "cover": "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop",
        "room_number": "Room 301"
    },
    {
        "title": "Harry Potter and the Philosopher's Stone",
        "author": "J.K. Rowling",
        "genre": "Fantasy",
        "year": 1997,
        "isbn": "978-0-439-70818-8",
        "description": "The first novel in the Harry Potter series following a young wizard's journey.",
        "cover": "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=400&h=600&fit=crop",
        "room_number": "Room 302"
    },
    {
        "title": "The Lord of the Rings",
        "author": "J.R.R. Tolkien",
        "genre": "Fantasy",
        "year": 1954,
        "isbn": "978-0-618-64561-6",
        "description": "An epic high-fantasy novel about the quest to destroy the One Ring.",
        "cover": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
        "room_number": "Room 301"
    },
    {
        "title": "The Chronicles of Narnia",
        "author": "C.S. Lewis",
        "genre": "Fantasy",
        "year": 1950,
        "isbn": "978-0-06-023481-4",
        "description": "A series of fantasy novels featuring magical lands and talking animals.",
        "cover": "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&h=600&fit=crop",
        "room_number": "Library Wing B"
    },
    {
        "title": "Brave New World",
        "author": "Aldous Huxley",
        "genre": "Dystopian",
        "year": 1932,
        "isbn": "978-0-06-085052-4",
        "description": "A dystopian novel set in a futuristic World State of genetically modified citizens.",
        "cover": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        "room_number": "Room 203"
    },
    {
        "title": "The Picture of Dorian Gray",
        "author": "Oscar Wilde",
        "genre": "Gothic",
        "year": 1890,
        "isbn": "978-0-14-143957-0",
        "description": "A philosophical novel about a man who remains young while his portrait ages.",
        "cover": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
        "room_number": "Room 204"
    },
    {
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "genre": "Adventure",
        "year": 1851,
        "isbn": "978-0-14-243724-7",
        "description": "The saga of Captain Ahab's obsessive quest to hunt the white whale.",
        "cover": "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop",
        "room_number": "Room 150"
    }
]

def fetch_book_from_google_api(isbn):
    """Fetch book information from Google Books API"""
    try:
        # Clean ISBN
        clean_isbn = isbn.replace('-', '').replace(' ', '')

        # Call Google Books API
        url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{clean_isbn}"
        response = requests.get(url, timeout=5)

        if response.status_code != 200:
            return None

        data = response.json()

        if data.get('totalItems', 0) == 0:
            return None

        book = data['items'][0]['volumeInfo']

        # Extract information
        genre = book.get('categories', ['Unknown'])[0] if book.get('categories') else 'Unknown'
        year = book.get('publishedDate', '').split('-')[0] if book.get('publishedDate') else ''

        # Get the best quality cover image
        cover_image = ''
        if book.get('imageLinks'):
            cover_image = (book['imageLinks'].get('large') or
                          book['imageLinks'].get('medium') or
                          book['imageLinks'].get('thumbnail') or
                          book['imageLinks'].get('smallThumbnail') or '')

        return {
            'title': book.get('title', ''),
            'author': ', '.join(book.get('authors', [])) if book.get('authors') else '',
            'genre': genre,
            'year': int(year) if year.isdigit() else 0,
            'description': book.get('description', ''),
            'cover': cover_image
        }
    except Exception as e:
        print(f"  Warning: Could not fetch data for ISBN {isbn}: {str(e)}")
        return None


def seed_database():
    """Seed the database with initial book data"""
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        Book.query.delete()

        # Add books
        print("Adding books with data from Google Books API...")
        for book_data in books_data:
            isbn = book_data['isbn']
            room_number = book_data.get('room_number', '')

            print(f"  Fetching data for ISBN {isbn}...")

            # Fetch from Google Books API
            api_data = fetch_book_from_google_api(isbn)

            if api_data and api_data.get('title'):
                # Use API data, but keep room_number from our data
                final_data = {
                    'title': api_data['title'],
                    'author': api_data['author'] or book_data['author'],
                    'genre': api_data['genre'] if api_data['genre'] != 'Unknown' else book_data['genre'],
                    'year': api_data['year'] if api_data['year'] > 0 else book_data['year'],
                    'isbn': isbn,
                    'description': api_data['description'] or book_data['description'],
                    'cover': api_data['cover'] or book_data['cover'],
                    'room_number': room_number
                }
                print(f"    ✓ Fetched: {final_data['title']}")
            else:
                # Fall back to hardcoded data
                final_data = book_data
                print(f"    ⚠ Using fallback data for: {book_data['title']}")

            book = Book(**final_data)
            db.session.add(book)

            # Small delay to avoid rate limiting
            time.sleep(0.2)

        db.session.commit()
        print(f"\n✓ Successfully added {len(books_data)} books to the database!")

        # Print summary
        total_books = Book.query.count()
        print(f"\nDatabase summary:")
        print(f"Total books: {total_books}")

        genres = db.session.query(Book.genre).distinct().all()
        print(f"Genres: {', '.join([g[0] for g in genres])}")

def seed_users():
    """Seed test users: 1 student and 1 teacher"""
    with app.app_context():
        # Check if users already exist
        if User.query.filter_by(username='student1').first():
            print("Test users already exist. Skipping user seed.")
            return

        # Create a test student
        student = User(
            username='student1',
            email='student@library.com',
            full_name='Test Student',
            role='student'
        )
        student.set_password('password123')

        # Create a test teacher
        teacher = User(
            username='teacher1',
            email='teacher@library.com',
            full_name='Test Teacher',
            role='teacher'
        )
        teacher.set_password('password123')

        db.session.add(student)
        db.session.add(teacher)
        db.session.commit()

        print("✓ Test users created successfully!")
        print("  Student: username='student1', password='password123'")
        print("  Teacher: username='teacher1', password='password123'")


if __name__ == '__main__':
    seed_database()
    seed_users()
