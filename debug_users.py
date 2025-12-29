from app import app
from models import db, User

with app.app_context():
    users = User.query.all()
    print("--- Current Users in DB ---")
    for u in users:
        print(f"ID: {u.id} | Hash: {u.password_hash[:10]}... | Len: {len(u.password_hash) if u.password_hash else 0}")
        
    admin2 = User.query.get('ADMIN2')
    if admin2:
        print("\nVerifying 'admin' password for ADMIN2...")
        try:
            from flask_bcrypt import check_password_hash
            is_valid = check_password_hash(admin2.password_hash, 'admin')
            print(f"Password 'admin' is valid? {is_valid}")
        except Exception as e:
            print(f"Error checking hash: {e}")

    # Script to reset if needed
    # db.session.delete(admin2)
    # db.session.commit()
