import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_sleep_log():
    # 1. First get/create a user and use their ID
    # For testing, we can use a hardcoded or recently created user ID
    # In verify_auth.py, we got a user_id
    
    test_user = {
        "email": f"tester_{int(time.time())}@example.com",
        "name": "Sleep Tester"
    }
    
    print(f"Registering tester...")
    reg_response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    if reg_response.status_code != 201:
        print("✗ Registration failed")
        return
        
    user_id = reg_response.json()['user_id']
    print(f"✓ Registered user_id: {user_id}")
    
    # 2. Test Sleep Log Creation
    print("\nTesting sleep log creation...")
    sleep_data = {
        "user_id": user_id,
        "sleep_time": "2026-03-27T23:00:00",
        "wake_time": "2026-03-28T07:00:00",
        "mood": 4,
        "sleep_quality": 5,
        "notes": "Testing the fix"
    }
    
    try:
        log_response = requests.post(f"{BASE_URL}/sleep/log", json=sleep_data)
        print(f"Log status: {log_response.status_code}")
        print(f"Log response: {log_response.text}")
        
        if log_response.status_code == 201:
            print("✓ Sleep log created successfully")
        else:
            print("✗ Sleep log creation failed")
            
    except Exception as e:
        print(f"✗ Request failed: {str(e)}")

if __name__ == "__main__":
    test_sleep_log()
