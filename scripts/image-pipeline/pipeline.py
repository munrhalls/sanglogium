import sys
import os
import requests
import tempfile
from pathlib import Path
from dotenv import load_dotenv
from rembg import remove
from PIL import Image
import io

load_dotenv()

PROJECT_ID = os.getenv("SANITY_PROJECT_ID")
DATASET = os.getenv("SANITY_DATASET", "production")
API_TOKEN = os.getenv("SANITY_API_TOKEN")

if not PROJECT_ID or not API_TOKEN:
    print("ERROR: SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in .env")
    sys.exit(1)

SANITY_API_BASE = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21"
HEADERS = {"Authorization": f"Bearer {API_TOKEN}"}

def fetch_product(product_id: str) -> dict:
    query = f'*[_type == "product" && _id == "{product_id}"][0]{{_id, name, image{{asset->}}, gallery[]{{asset->}}}}'
    url = f"{SANITY_API_BASE}/data/query/{DATASET}"
    response = requests.get(url, headers=HEADERS, params={"query": query})
    response.raise_for_status()
    result = response.json().get("result")
    if not result:
        print(f"ERROR: No product found with ID: {product_id}")
        print(f"DEBUG full response: {response.json()}")
        sys.exit(1)
    return result

def get_asset_url(asset: dict) -> str:
    url = asset.get("url")
    if not url:
        raise ValueError(f"Asset has no url field: {asset}")
    return url

def download_image(url: str) -> bytes:
    response = requests.get(url)
    response.raise_for_status()
    return response.content

def extract_images(product: dict) -> list[dict]:
    images = []
    main = product.get("image")
    if main and main.get("asset"):
        images.append({
            "role": "mainImage",
            "asset": main["asset"],
            "original_field": main
        })
    gallery = product.get("gallery") or []
    for i, item in enumerate(gallery):
        if item.get("asset"):
            images.append({
                "role": f"imageGallery[{i}]",
                "asset": item["asset"],
                "index": i,
                "original_field": item
            })
    return images

def patch_product(product_id: str, patch_data: dict):
    url = f"{SANITY_API_BASE}/data/mutate/{DATASET}"
    mutation = {
        "mutations": [
            {
                "patch": {
                    "id": product_id,
                    "set": patch_data
                }
            }
        ]
    }
    response = requests.post(url, headers=HEADERS, json=mutation)
    response.raise_for_status()
    print(f"  Sanity document patched successfully")
    print(f"  DEBUG patch response: {response.json()}")

def upload_image_to_sanity(image_bytes: bytes, filename: str) -> str:
    url = f"https://{PROJECT_ID}.api.sanity.io/v2021-10-21/assets/images/{DATASET}"
    upload_headers = {
        **HEADERS,
        "Content-Type": "image/png",
        "Content-Disposition": f'attachment; filename="{filename}"',
    }
    response = requests.post(url, headers=upload_headers, data=image_bytes)
    response.raise_for_status()
    asset_id = response.json()["document"]["_id"]
    print(f"    Uploaded: {asset_id}")
    return asset_id

def remove_background(image_bytes: bytes) -> bytes | None:
    try:
        result = remove(image_bytes)
        # Validate output is not empty or fully transparent
        img = Image.open(io.BytesIO(result)).convert("RGBA")
        pixels = list(img.getdata())
        non_transparent = [p for p in pixels if p[3] > 0]
        if len(non_transparent) == 0:
            return None  # Fully transparent — failed
        return result
    except Exception as e:
        print(f"    rembg error: {e}")
        return None

def log_skip(product_id: str, role: str, reason: str):
    log_path = Path(__file__).parent / "skip_log.txt"
    with open(log_path, "a") as f:
        f.write(f"{product_id} | {role} | {reason}\n")
    print(f"    SKIPPED: {role} — {reason}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python pipeline.py <product_id>")
        sys.exit(1)

    product_id = sys.argv[1]
    print(f"\nStarting pipeline for product: {product_id}")

    product = fetch_product(product_id)
    print(f"Found: {product.get('name', 'untitled')}")
    print(f"DEBUG product keys: {list(product.keys())}")

    images = extract_images(product)
    print(f"Images to process: {len(images)}")

    if not images:
        print("No images found on this product. Exiting.")
        sys.exit(0)

    patch_data = {}

    for img in images:
        role = img["role"]
        print(f"\n  Processing: {role}")

        try:
            asset_url = get_asset_url(img["asset"])
            print(f"    URL: {asset_url}")
            image_bytes = download_image(asset_url)
        except Exception as e:
            log_skip(product_id, role, f"download failed: {e}")
            continue

        processed = remove_background(image_bytes)
        if processed is None:
            log_skip(product_id, role, "rembg produced empty or fully transparent output")
            continue

        filename = f"{product_id}_{role.replace('[','').replace(']','')}_nobg.png"

        try:
            new_asset_id = upload_image_to_sanity(processed, filename)
        except Exception as e:
            log_skip(product_id, role, f"upload failed: {e}")
            continue

        asset_ref = f"image-{new_asset_id.replace('image-', '')}"

        if role == "mainImage":
            patch_data["image"] = {
                **img["original_field"],
                "asset": {"_type": "reference", "_ref": new_asset_id}
            }
        else:
            idx = img["index"]
            key = f"gallery[{idx}].asset"
            patch_data[key] = {"_type": "reference", "_ref": new_asset_id}

    if patch_data:
        print(f"\n  Patching Sanity document...")
        patch_product(product_id, patch_data)
        print(f"\nPipeline complete for: {product_id}")
    else:
        print(f"\nNo images were successfully processed for: {product_id}")

if __name__ == "__main__":
    main()
