from app import app, db
from models import User
from flask_bcrypt import generate_password_hash

with app.app_context():
    u = User.query.get('ADMIN2')
    if u:
        print("Found ADMIN2. Resetting password to 'admin' using bcrypt...")
        u.password_hash = generate_password_hash('admin').decode('utf-8')
        db.session.commit()
        print("✅ Password reset success.")
    else:
        print("❌ ADMIN2 not found in DB.")
