import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

load_dotenv()

def debug_supabase():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("✗ Error: SUPABASE_URL or SUPABASE_KEY missing in .env")
        return
        
    supabase: Client = create_client(url, key)
    
    # Try to insert a dummy user to see the exact error
    test_user = {
        "email": f"test_{int(datetime.utcnow().timestamp())}@example.com",
        "name": "Test User",
        "created_at": datetime.utcnow().isoformat(),
        "preferences": {"target_sleep_hours": 8},
        "profile": {"occupation": "tester"}
    }
    
    print("\nAttempting to insert test user...")
    try:
        response = supabase.table('users').insert(test_user).execute()
        print("✓ Successfully inserted test user.")
        print(f"Data: {response.data}")
        
        # Cleanup
        if response.data:
            user_id = response.data[0]['id']
            supabase.table('users').delete().eq('id', user_id).execute()
            print("✓ Cleaned up test user.")
            
    except Exception as e:
        print(f"✗ Failed to insert test user: {str(e)}")
        if hasattr(e, 'message'):
            print(f"Error message: {e.message}")
        if hasattr(e, 'details'):
            print(f"Error details: {e.details}")
        if hasattr(e, 'hint'):
            print(f"Error hint: {e.hint}")

if __name__ == "__main__":
    debug_supabase()
