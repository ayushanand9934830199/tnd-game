import sys
import os
import time
import requests

TOKEN = "sbp_cdae432cf580578e880e57433e0f80e1b76ad4fe"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
BASE_URL = "https://api.supabase.com/v1"

print("1. Fetching Organizations...")
orgs_resp = requests.get(f"{BASE_URL}/organizations", headers=HEADERS)
orgs = orgs_resp.json()
if not orgs:
    print("No organizations found.")
    sys.exit(1)

org_id = orgs[0]['id']
print(f"Using Org ID: {org_id}")

print("2. Checking projects...")
proj_resp = requests.get(f"{BASE_URL}/projects", headers=HEADERS)
projects = proj_resp.json()
target_proj = next((p for p in projects if p['name'] == 'truth-dare-game'), None)

if target_proj:
    print(f"Project 'truth-dare-game' already exists: {target_proj['id']}")
else:
    print("3. Creating project 'truth-dare-game'...")
    payload = {
        "organization_id": org_id,
        "name": "truth-dare-game",
        "region": "us-east-1",
        "plan": "free",
        "db_pass": "SuperSecurePass123!"
    }
    create_resp = requests.post(f"{BASE_URL}/projects", json=payload, headers=HEADERS)
    if create_resp.status_code not in (200, 201):
        print(f"Error creating project: {create_resp.text}")
        sys.exit(1)
    target_proj = create_resp.json()
    print(f"Created Project! ID: {target_proj['id']}")

print("4. Waiting for project to become ACTIVE_HEALTHY...")
active = False
for _ in range(30):
    proj_resp = requests.get(f"{BASE_URL}/projects", headers=HEADERS)
    p = next((x for x in proj_resp.json() if x['id'] == target_proj['id']), None)
    if p and p.get('status') == 'ACTIVE_HEALTHY':
        active = True
        break
    print("Waiting 10 seconds...")
    time.sleep(10)

if not active:
    print("Timeout waiting for project to become active.")
    sys.exit(1)

print("5. Getting API Keys...")
keys_resp = requests.get(f"{BASE_URL}/projects/{target_proj['ref']}/api-keys", headers=HEADERS)
if keys_resp.status_code == 200:
    keys = keys_resp.json()
    anon_key = next((k['api_key'] for k in keys if k['name'] == 'anon'), None)
    
    with open("d:/Antigravity/tnd/.env", "w") as f:
        f.write(f'VITE_SUPABASE_URL="https://{target_proj["ref"]}.supabase.co"\n')
        f.write(f'VITE_SUPABASE_ANON_KEY="{anon_key}"\n')
        f.write(f'SUPABASE_ACCESS_TOKEN="{TOKEN}"\n')
        
    with open("d:/Antigravity/tnd/app/.env", "w") as f:
        f.write(f'VITE_SUPABASE_URL="https://{target_proj["ref"]}.supabase.co"\n')
        f.write(f'VITE_SUPABASE_ANON_KEY="{anon_key}"\n')
    print("✅ Updated .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY!")
else:
    print(f"Failed to get API keys: {keys_resp.text}")
