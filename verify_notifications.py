import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def run_test():
    print("--- Starting Verification ---")
    
    # 1. Register a test patient
    patient_id = f"test_patient_{int(time.time())}"
    print(f"1. Registering patient: {patient_id}")
    res = requests.post(f"{BASE_URL}/register", json={
        "user_id": patient_id,
        "password": "password123",
        "name": "Test Patient",
        "age": 25,
        "gender": "Male"
    })
    print(f"   Register Status: {res.status_code}")
    
    # 2. Login as patient to get token
    print("2. Logging in...")
    res = requests.post(f"{BASE_URL}/login", json={
        "user_id": patient_id,
        "password": "password123"
    })
    token = res.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print(f"   Login Status: {res.status_code}")

    # 3. Post a High Risk Message (Red)
    print("3. Posting High Risk Message...")
    res = requests.post(f"{BASE_URL}/analyze", json={
        "message": "I want to end my life right now. I cannot take it anymore.",
        "user_id": patient_id
    }, headers=headers)
    result = res.json()
    print(f"   Analysis Result: {result.get('level')}")
    
    if result.get('level') != 'RED':
        print("   FAILED: Expected RED level")
        return

    # 4. Check Notifications (as Admin/Psychiatrist)
    # Ideally we should login as a doctor, but for now we use the same token 
    # (assuming role checks aren't strictly enforcing 'doctor' for this endpoint yet, or we just test the endpoint existence)
    print("4. Checking Notifications...")
    res = requests.get(f"{BASE_URL}/notifications", headers=headers)
    notifications = res.json()
    print(f"   Notifications Count: {len(notifications)}")
    
    found = False
    for n in notifications:
        if patient_id in n['message']:
            print(f"   Found Notification: {n['message']}")
            found = True
            break
            
    if not found:
        print("   FAILED: Notification not found")
    else:
        print("   PASSED: Notification created successfully")

    # 5. Check Analytics
    print("5. Checking Analytics...")
    res = requests.get(f"{BASE_URL}/analytics", headers=headers)
    analytics = res.json()
    
    if 'risk_distribution' in analytics and 'trend_data' in analytics:
        print("   PASSED: Analytics data structure correct")
        print(f"   Risk Distribution: {analytics['risk_distribution']}")
    else:
        print("   FAILED: Analytics data missing")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure the backend server is running on port 5000")
