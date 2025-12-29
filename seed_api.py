import requests

BASE_URL = "http://localhost:5000/api"

users = [
    {'user_id': 'ADMIN', 'name': 'System Admin', 'password': 'admin', 'age': 30, 'gender': 'NB'},
    {'user_id': 'DR001', 'name': 'Dr. Strange', 'password': 'pass', 'age': 45, 'gender': 'Male'},
    {'user_id': 'PATIENT001', 'name': 'John Doe', 'password': 'pass', 'age': 25, 'gender': 'Male'}
]

for u in users:
    try:
        print(f"Registering {u['user_id']}...")
        response = requests.post(f"{BASE_URL}/register", json=u)
        print(f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print(f"Failed to register {u['user_id']}: {e}")
