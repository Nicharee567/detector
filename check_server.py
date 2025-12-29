import requests

try:
    print("Testing connection to Backend (localhost:5000)...")
    response = requests.get("http://localhost:5000/api/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    print("\nTesting Analysis Endpoint...")
    payload = {"message": "ทดสอบระบบ", "user_id": "debug_script"}
    res = requests.post("http://localhost:5000/api/analyze", json=payload)
    print(f"Analysis Status: {res.status_code}")
    print(f"Analysis Result: {res.json()}")
    
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to localhost:5000. Is the backend server running?")
except Exception as e:
    print(f"❌ Error: {e}")
