from app import app, db
from models import User

def seed_users():
    with app.app_context():
        # Define users to create
        users = [
            # Admin (Needs ADMIN id for frontend logic)
            {'id': 'ADMIN', 'name': 'System Admin', 'password': 'admin'},
            
            # Psychiatrist (Needs DR prefix)
            {'id': 'DR001', 'name': 'Dr. Strange', 'password': 'pass'},
            
            # Patient
            {'id': 'PATIENT001', 'name': 'John Doe', 'password': 'pass'}
        ]

        print("🌱 Seeding users...")
        for u in users:
            existing = User.query.get(u['id'])
            if not existing:
                new_user = User(id=u['id'], name=u['name'])
                new_user.set_password(u['password'])
                db.session.add(new_user)
                print(f"Created user: {u['id']} / {u['password']}")
            else:
                print(f"User already exists: {u['id']}")
        
        db.session.commit()
        print("✅ Seeding complete!")

if __name__ == '__main__':
    seed_users()
