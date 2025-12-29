import requests

BASE_URL = "http://localhost:5000/api"

# รายชื่อผู้ใช้งานที่ต้องการเพิ่ม (เพิ่มกี่คนก็ได้ครับ)
USERS_TO_ADD = [
    # Admin (คนแรก)
    {"user_id": "ADMIN", "name": "Head Admin", "password": "admin1", "age": 99, "gender": "Other"},
    
    # Admin (คนที่สอง)
    {"user_id": "ADMIN2", "name": "Support Admin", "password": "admin", "age": 30, "gender": "Other"},
    
    # จิตแพทย์ (Psychiatrist) - ต้องขึ้นต้นด้วย DR
    {"user_id": "DR002", "name": "Dr. Strange", "password": "pass", "age": 45, "gender": "Male"},
    {"user_id": "DR003", "name": "Dr. House", "password": "pass", "age": 50, "gender": "Male"},

    # นักบำบัด (Therapist) - ต้องขึ้นต้นด้วย T
    {"user_id": "T001", "name": "Therapist Jane", "password": "pass", "age": 28, "gender": "Female"},
]

def add_users():
    print(f"🔄 Connecting to {BASE_URL}...")
    
    for u in USERS_TO_ADD:
        try:
            print(f"Creating User: {u['user_id']} ({u['name']})...", end=" ")
            response = requests.post(f"{BASE_URL}/register", json=u)
            
            if response.status_code == 201:
                print("✅ Success")
            elif "already exists" in response.text:
                print("ℹ️ Already Exists")
            else:
                print(f"❌ Failed: {response.text}")
                
        except Exception as e:
            print(f"\n❌ Connection Error: {e}")
            print("💡 Make sure 'python app.py' is running!")
            return

if __name__ == "__main__":
    add_users()
