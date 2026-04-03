import os
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Link FAILED: SUPABASE_URL and SUPABASE_KEY missing in .env")
    exit(1)

try:
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}"
    }
    resp = requests.get(f"{supabase_url}/rest/v1/profiles?select=id&limit=1", headers=headers)
    if resp.status_code == 200:
        print("✅ Link SUCCESS: Connected to Supabase Database!")
    else:
        print(f"⚠️ Link reached server but returned: {resp.status_code} - {resp.text}")
except Exception as e:
    print(f"❌ Link ERROR: {e}")
