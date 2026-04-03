import sys
import requests

TOKEN = "sbp_cdae432cf580578e880e57433e0f80e1b76ad4fe"
HEADERS = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
BASE_URL = "https://api.supabase.com/v1"

orgs_resp = requests.get(f"{BASE_URL}/organizations", headers=HEADERS)
if orgs_resp.status_code != 200:
    print(f"Error fetching orgs: {orgs_resp.status_code} - {orgs_resp.text}")
    sys.exit(1)

orgs = orgs_resp.json()
for o in orgs:
    print(f"Found Org: {o['id']} - {o['name']}")
