node scripts/identify-botched-product-images.mjs headphones
peline saved to identify-botched-product-images.mjs.

Run it for any category:




powershell
node scripts/identify-botched-product-images.mjs headphones
It:

Resolves the category slug to all descendant VFS keys in Sanity
Fetches products with image asset filename + ref
Flags missing-image, broken-asset-ref, placeholder-filename, tiny-image (<200 px), and duplicate-asset (same image used by >2 products)
Emits JSON to stdout
Verified on headphones: 186 products, 15 botched — same 15 we found earlier.