from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase: Client = None

def init_db(app=None):
    """Initialize Supabase connection"""
    global supabase
    try:
        if not supabase_url or not supabase_key:
            print("[!] Supabase credentials missing from .env")
            return
            
        supabase = create_client(supabase_url, supabase_key)
        print("[+] Supabase connected successfully")
        
    except Exception as e:
        print(f"[-] Supabase connection failed: {str(e)}")
        raise

def get_db():
    """Get Supabase client instance"""
    return supabase

def close_db():
    """Close database connection (not strictly needed for Supabase)"""
    print("[+] Supabase connection closed (idle)")
