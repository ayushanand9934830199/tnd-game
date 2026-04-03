import sys
import os
import requests

envs = {}
with open('d:/Antigravity/tnd/.env', 'r') as f:
    for line in f:
        if '=' in line:
            k,v = line.strip().split('=', 1)
            envs[k] = v.strip('"').strip("'")

TOKEN = envs.get("SUPABASE_ACCESS_TOKEN")
URL = envs.get("VITE_SUPABASE_URL")

if not TOKEN or not URL:
    print("❌ Missing SUPABASE_ACCESS_TOKEN or VITE_SUPABASE_URL in .env")
    sys.exit(1)

ref = URL.split("//")[1].split(".")[0]
schema_path = os.path.join(os.path.dirname(__file__), '..', 'architecture', 'schema.sql')

with open(schema_path, "r") as f:
    sql_script = f.read()

print("Applying schema...")
headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

resp = requests.post(
    f"https://api.supabase.com/v1/projects/{ref}/pg-commands/query",
    headers=headers,
    json={"query": sql_script}
)

if resp.status_code in (200, 201):
    print("✅ Schema applied successfully!")
else:
    print(f"❌ Failed to apply schema: {resp.status_code}")
    print(resp.text)
