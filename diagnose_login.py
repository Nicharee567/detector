import requests

BASE_URL = "http://localhost:5000/api"

def test_login(user, password):
    print(f"Testing Login for {user} / {password} ...", end=" ")
    try:
        res = requests.post(f"{BASE_URL}/login", json={"user_id": user, "password": password})
        if res.status_code == 200:
            print(f"✅ SUCCESS! Token: {res.json().get('access_token')[:10]}...")
        else:
            print(f"❌ FAILED ({res.status_code}): {res.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_login("ADMIN", "admin")
    test_login("ADMIN2", "admin")
