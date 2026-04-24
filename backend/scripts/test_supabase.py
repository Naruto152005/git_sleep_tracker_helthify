import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def test_connection():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("✗ Error: SUPABASE_URL or SUPABASE_KEY missing in .env")
        return False
        
    try:
        supabase: Client = create_client(url, key)
        # Try to fetch users (even if empty)
        response = supabase.table('users').select("count", count="exact").limit(1).execute()
        print(f"✓ Success: Connected to Supabase. User count: {response.count}")
        return True
    except Exception as e:
        print(f"✗ Error: Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_connection()
