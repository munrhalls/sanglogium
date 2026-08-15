---
description: Ethical product-image scraping from e-commerce pages
---

# /ethical-scrape

Use this workflow when a single product image must be found and downloaded from a public e-commerce page. Only use this on public pages you have permission to access; respect robots.txt and site ToS.

## Requirements before starting

- Exact product name.
- A target working directory, e.g. `normalize-accessories-images/main-images/`.
- Chrome is NOT expected to be running; this workflow uses raw HTTP only.

## Steps

1. **Find the product page**
   - `search_web("<exact product name>")`
   - Pick the first credible e-commerce result whose title matches the product (e.g. Shopify, WooCommerce, BigCommerce store).
   - Do not try multiple sources unless the first clearly lacks the product.

2. **Fetch raw HTML, not parsed text**
   - Use `bash` with `Invoke-WebRequest -Uri <url> -UseBasicParsing` and dump to a temp HTML file if needed.
   - Do not use `read_url_content` / `view_content_chunk` because they strip `<img>` and meta tags.
   - Do not try browser MCP unless Chrome is already known to be running.

3. **Extract the main image URL in one shot**
   - Look for `<meta property="og:image" content="...">` first.
   - Regex:
     ```powershell
     [regex]::Match($html, '<meta[^>]*property="og:image"[^>]*content="(https?://[^"]+)"').Groups[1].Value
     ```
   - Fallback: `<meta property="og:image:secure_url" content="...">`
   - Fallback after that: first large product image `src`/`data-src` in the page.

4. **Download to the mandatory working location**
   - Use `Invoke-WebRequest -Uri <imageUrl> -OutFile <dest> -UseBasicParsing`
   - **MANDATORY:** Save the image to <folder that is relevant in a temporary location, if not provided, then make one and report it after you are done>
   - Copy to `public/<proper page path so image renders>  if the test page must serve it.

5. **Verify and clean up**
   - `Get-ChildItem <dest>` to confirm file/size.
   - Delete any temp HTML file.
   - Only update scripts like `flag-products.ts` if the user explicitly asks.

## What NOT to do

- Do not update `flag-products.ts` or regenerate `flagged-map.json` for a single-image fetch.
- Do not re-run Sanity/`fetchHomepageData` scripts.
- Do not use browser preview/Chrome DevTools unless already running.
- Do not create `flagged-*.png` or manipulate the test page unless the task explicitly says so.
- Do not leave temp files in the repo.

## One-liner

```powershell
$url    = '<product-page-url>';
$dest   = <proper temporary folder to save it to>
$resp   = Invoke-WebRequest -Uri $url -UseBasicParsing;
$imgUrl = [regex]::Match($resp.Content, '<meta[^>]*property="og:image"[^>]*content="(https?://[^"]+)"').Groups[1].Value;
Invoke-WebRequest -Uri $imgUrl -OutFile $dest -UseBasicParsing;
```
