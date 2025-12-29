import requests

# กำหนดรหัสผ่านตรงนี้ได้เลยครับ
ADMIN_USER = "ADMIN"
ADMIN_PASS = "admin1234"  # เปลี่ยนเป็นรหัสที่ต้องการได้เลย

BASE_URL = "http://localhost:5000/api"

def create_admin():
    user = {
        'user_id': ADMIN_USER,
        'name': 'System Admin',
        'password': ADMIN_PASS,
        'age': 99,
        'gender': 'Other'
    }
    
    try:
        print(f"Creating Admin: {ADMIN_USER} with password: {ADMIN_PASS}")
        response = requests.post(f"{BASE_URL}/register", json=user)
        if response.status_code == 201:
            print("✅ Admin created successfully!")
        elif "already exists" in response.text:
            print("ℹ️ Admin user already exists. Using existing credentials.")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure 'python app.py' is running first!")

if __name__ == "__main__":
    create_admin()
