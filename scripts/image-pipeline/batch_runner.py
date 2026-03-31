import sys
import os
import json
import subprocess
from pathlib import Path
from datetime import datetime, timezone

SCRIPT_DIR = Path(__file__).parent
PROCESSED_FILE = SCRIPT_DIR / "processed.json"
ERROR_LOG = SCRIPT_DIR / "batch_errors.txt"
VENV_PYTHON = SCRIPT_DIR / "venv" / "Scripts" / "python.exe"

def load_processed_data() -> dict:
    """Load processed data from JSON file."""
    if not PROCESSED_FILE.exists():
        return {"processed": [], "last_updated": None, "total_completed": 0}
    try:
        with open(PROCESSED_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {"processed": [], "last_updated": None, "total_completed": 0}

def save_processed_data(data: dict):
    """Atomically save processed data to JSON file."""
    temp_file = PROCESSED_FILE.with_suffix(".tmp")
    try:
        with open(temp_file, "w") as f:
            json.dump(data, f, indent=2)
        temp_file.replace(PROCESSED_FILE)
    except IOError as e:
        print(f"ERROR: Failed to save progress: {e}")

def log_error(product_id: str, error_msg: str):
    """Append error to log file."""
    timestamp = datetime.now(timezone.utc).isoformat()
    with open(ERROR_LOG, "a") as f:
        f.write(f"{timestamp} | {product_id} | {error_msg}\n")

def run_pipeline(product_id: str) -> tuple[bool, str]:
    """Run pipeline.py for a single product. Returns (success, error_message)."""
    cmd = [str(VENV_PYTHON), str(SCRIPT_DIR / "pipeline.py"), product_id]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600  # 10 minute timeout per product
        )
        if result.returncode == 0:
            return True, ""
        else:
            # Capture stderr or stdout if stderr is empty
            error_msg = result.stderr.strip() if result.stderr else result.stdout.strip()
            if not error_msg:
                error_msg = "pipeline.py exited with non-zero code"
            return False, error_msg
    except subprocess.TimeoutExpired:
        return False, "TIMEOUT after 5 minutes"
    except Exception as e:
        return False, f"EXCEPTION: {e}"

def main():
    # Get list of remaining products from fetch_products.py
    fetch_script = SCRIPT_DIR / "fetch_products.py"
    if not fetch_script.exists():
        print("ERROR: fetch_products.py not found")
        sys.exit(1)

    # Run fetch script to get IDs
    result = subprocess.run(
        [str(VENV_PYTHON), str(fetch_script)],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"ERROR: fetch_products.py failed: {result.stderr}")
        sys.exit(1)

    # Parse IDs from stdout (skip header lines)
    lines = result.stdout.strip().split("\n")
    product_ids = []
    for line in lines:
        line = line.strip()
        # Skip empty lines, separators, and status messages
        if line and not line.startswith("=") and not line.startswith("Total") and not line.startswith("Already") and not line.startswith("Remaining") and not line.startswith("Fetching") and not line.startswith("No products") and not line.startswith("All products"):
            product_ids.append(line)

    if not product_ids:
        print("No products to process.")
        sys.exit(0)

    total = len(product_ids)
    print(f"\nBatch processing {total} products...")
    print(f"Progress saved to: {PROCESSED_FILE}")
    print(f"Errors logged to: {ERROR_LOG}")
    print(f"{'='*50}\n")

    # Load current progress
    data = load_processed_data()
    processed_list = data.get("processed", [])
    completed = len(processed_list)

    # Process each product
    for i, product_id in enumerate(product_ids, 1):
        print(f"[{i}/{total}] Processing: {product_id}")

        success, error_msg = run_pipeline(product_id)
        if success:
            # Success - update progress immediately
            processed_list.append(product_id)
            data["processed"] = processed_list
            data["total_completed"] = len(processed_list)
            data["last_updated"] = datetime.now(timezone.utc).isoformat()
            save_processed_data(data)
            print(f"  ✓ Success ({len(processed_list)} total completed)")
        else:
            log_error(product_id, error_msg)
            print(f"  ✗ Failed: {error_msg[:100]}")

        print()

    # Final summary
    print(f"{'='*50}")
    print(f"Batch complete!")
    print(f"Total processed: {len(processed_list)}")
    if ERROR_LOG.exists():
        error_count = len(ERROR_LOG.read_text().strip().split("\n"))
        print(f"Errors: {error_count} (see {ERROR_LOG})")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
