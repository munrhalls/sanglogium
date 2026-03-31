import sys
import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
DATASET = os.getenv("SANITY_DATASET", "production")
API_TOKEN = os.getenv("SANITY_API_TOKEN")

if not PROJECT_ID or not API_TOKEN:
    print("ERROR: SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in .env")
    sys.exit(1)

SANITY_API_BASE = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21"
HEADERS = {"Authorization": f"Bearer {API_TOKEN}"}

SCRIPT_DIR = Path(__file__).parent
PROCESSED_FILE = SCRIPT_DIR / "processed.json"

def load_processed_ids() -> set:
    """Load set of already processed product IDs from processed.json."""
    if not PROCESSED_FILE.exists():
        return set()
    try:
        with open(PROCESSED_FILE, "r") as f:
            data = json.load(f)
            return set(data.get("processed", []))
    except (json.JSONDecodeError, IOError) as e:
        print(f"WARNING: Could not read processed.json: {e}")
        return set()

def fetch_all_product_ids() -> list[str]:
    """Query Sanity for all product IDs with catalogueLocationKeys."""
    query = '*[_type == "product" && defined(catalogueLocationKeys) && count(catalogueLocationKeys) > 0]._id'
    url = f"{SANITY_API_BASE}/data/query/{DATASET}"
    
    print(f"Fetching products from Sanity...")
    response = requests.get(url, headers=HEADERS, params={"query": query})
    response.raise_for_status()
    
    result = response.json().get("result", [])
    return result

def main():
    # Fetch all eligible products
    all_ids = fetch_all_product_ids()
    total = len(all_ids)
    
    if total == 0:
        print("No products found with catalogueLocationKeys.")
        sys.exit(0)
    
    # Load already processed IDs
    processed = load_processed_ids()
    
    # Filter out processed
    remaining = [pid for pid in all_ids if pid not in processed]
    
    # Display counts
    print(f"\n{'='*50}")
    print(f"Total products in Sanity:     {total}")
    print(f"Already processed:            {len(processed)}")
    print(f"Remaining to process:         {len(remaining)}")
    print(f"{'='*50}\n")
    
    if not remaining:
        print("All products have been processed!")
        sys.exit(0)
    
    # Output remaining IDs (for batch_runner.py to consume)
    for pid in remaining:
        print(pid)

if __name__ == "__main__":
    main()
