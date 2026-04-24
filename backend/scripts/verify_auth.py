import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_auth():
    test_user = {
        "email": f"test_{int(time.time())}@example.com",
        "name": "Test User"
    }
    
    # 1. Test Register
    print(f"Testing registration for {test_user['email']}...")
    try:
        reg_response = requests.post(f"{BASE_URL}/auth/register", json=test_user)
        print(f"Register status: {reg_response.status_code}")
        print(f"Register response: {reg_response.text}")
        
        if reg_response.status_code != 201:
            print("✗ Registration failed")
            return
            
        # 2. Test Login
        print("\nTesting login...")
        login_data = {"email": test_user['email']}
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login status: {login_response.status_code}")
        print(f"Login response: {login_response.text}")
        
        if login_response.status_code == 200:
            print("✓ Auth flow verified successfully")
        else:
            print("✗ Login failed")
            
    except Exception as e:
        print(f"✗ Request failed: {str(e)}")
        print("Make sure the backend is running at http://localhost:5000")

if __name__ == "__main__":
    test_auth()
