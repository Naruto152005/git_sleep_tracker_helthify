import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

def verify_tables():
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("✗ Error: SUPABASE_URL or SUPABASE_KEY missing in .env")
        return
        
    supabase: Client = create_client(url, key)
    tables = ['users', 'sleep_logs', 'productivity_logs', 'ai_recommendations']
    
    for table in tables:
        try:
            # Try to select one row from the table
            response = supabase.table(table).select("*").limit(1).execute()
            print(f"✓ Table '{table}' exists.")
        except Exception as e:
            print(f"✗ Error accessing table '{table}': {str(e)}")

if __name__ == "__main__":
    verify_tables()
