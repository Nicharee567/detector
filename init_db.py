from app import app, db
from models import User, AnalysisResult

def init_db():
    with app.app_context():
        # Create tables
        db.create_all()
        print("✅ Database tables created successfully!")
        
        # Check if we need to seed initial data
        if not User.query.first():
            print("ℹ️ Database is empty. You can register patients via the Therapist Dashboard.")
        else:
            print(f"ℹ️ Found {User.query.count()} users in the database.")

if __name__ == '__main__':
    init_db()
