from app import app, db
from models import Book

def add_room_number_column():
    """Add room_number column to existing books"""
    with app.app_context():
        try:
            # Try to add the column using raw SQL
            with db.engine.connect() as conn:
                conn.execute(db.text('ALTER TABLE books ADD COLUMN room_number VARCHAR(20)'))
                conn.commit()
            print("✓ Successfully added room_number column to books table")
        except Exception as e:
            if 'duplicate column name' in str(e).lower() or 'already exists' in str(e).lower():
                print("✓ room_number column already exists")
            else:
                print(f"Error: {e}")
                raise

if __name__ == '__main__':
    add_room_number_column()
