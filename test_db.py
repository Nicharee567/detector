import requests

def test_create():
    print("Attempting to create user TEST99...")
    u = {
        "user_id": "TEST99",
        "name": "Test User",
        "password": "password123",
        "age": 20,
        "gender": "Other"
    }
    try:
        res = requests.post("http://localhost:5000/api/register", json=u)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
        
        if res.status_code == 201:
            print("✅ DB WRITE SUCCESS!")
            # Now try login immediately
            print("Attempting login...")
            res2 = requests.post("http://localhost:5000/api/login", 
                               json={"user_id": "TEST99", "password": "password123"})
            print(f"Login Status: {res2.status_code}")
            if res2.status_code == 200:
                print("✅ LOGIN SUCCESS!")
            else:
                print("❌ LOGIN FAILED")
                
    except Exception as e:
        print(f"❌ Connection Error: {e}")

if __name__ == "__main__":
    test_create()
