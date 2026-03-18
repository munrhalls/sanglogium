# Image Background Removal Pipeline — Scope

## Deliverable State
A Python script that accepts a Sanity product ID, downloads that
product's main image and all images in its image gallery, removes
the background from every image using the rembg library, and
re-uploads the processed images to that product's record in the
Sanity database.

## In Scope
- Accept a single Sanity product ID as input
- Authenticate with Sanity and get read/write access
- Download the product's mainImage asset
- Download all images in the product's imageGallery array
- Run rembg background removal on every downloaded image
- Re-upload each processed image to Sanity as a new asset
- Update the product's mainImage and imageGallery fields to
  reference the new processed assets
- Log the product ID and outcome (success / skipped) to a
  plaintext log file

## Failure Handling
If rembg produces an error or returns an obviously failed result
for a specific image (fully transparent, fully opaque, zero file
size), that image is skipped. The product ID and image filename
are written to a skip log file for manual review. The pipeline
continues to the next image. It does not abort.

## Out of Scope
- Batch processing of multiple products in one run
  (run the script once per product ID)
- Any image manipulation beyond background removal
- Image quality enhancement or resizing
- Validation of rembg output quality beyond error detection
- Any UI or web interface
- Any Sanity schema changes
- Search functionality
- Any future requirements not listed above

## Forbidden Scope
- Do not modify any image dimensions or resolution
- Do not compress or change image format beyond PNG with
  transparency
- Do not touch any field in Sanity other than mainImage
  and imageGallery on the target product ID
- Do not process any product other than the one passed as input
