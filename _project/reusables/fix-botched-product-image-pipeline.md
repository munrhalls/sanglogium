# Fix a botched product image

Lean pipeline to replace one bad product image.

## 1. Pick the product

Run the botched-image scanner for the category and grab the first (or any) item:

```powershell
$product = node scripts/identify-botched-product-images.mjs headphones 2>$null |
  ConvertFrom-Json | Select-Object -ExpandProperty botched | Select-Object -First 1
$name  = $product.name
$slug  = $product.slug
```

For headphones the first botched product is currently `Meze Audio Empyrean II Open Back Headphones` (`meze-audio-empyrean-ii-open-back-headphones`).

## 2. Find a clean main image

Search the exact product name, then pick the first credible e-commerce result:

```powershell
search_web "$name"
# pick official / credible store, e.g. mezeaudio.com/products/empyrean2
```

## 3. Fetch the page and extract `og:image`

```powershell
$url = 'https://mezeaudio.com/products/empyrean2'   # replace per product
$resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
$html = $resp.Content

$og = [regex]::Match($html,
  '<meta[^>]*property="og:image"[^>]*content="(https?://[^"]+)"').Groups[1].Value

if (-not $og) {
  $og = [regex]::Match($html,
    '<meta[^>]*property="og:image:secure_url"[^>]*content="(https?://[^"]+)"').Groups[1].Value
}

if (-not $og) {
  $m = [regex]::Matches($html, '<img[^>]+(?:src|data-src)="(https?://[^"]+)"')
  foreach ($x in $m) {
    $og = $x.Groups[1].Value
    if ($og -match '\.(?:png|jpg|jpeg|webp)(?:\?|$)') { break }
  }
}

$og
```

## 4. Download to a temp file and verify

```powershell
$ext = '.png'
if ($og -match '\.webp(\?|$)') { $ext = '.webp' }
elseif ($og -match '\.jpg(\?|$)') { $ext = '.jpg' }
elseif ($og -match '\.jpeg(\?|$)') { $ext = '.jpeg' }

$tmp = Join-Path $env:TEMP "$slug-og-image$ext"
Invoke-WebRequest -Uri $og -OutFile $tmp -UseBasicParsing -TimeoutSec 15
$tmp
```

Open the temp image and visually confirm it is the product, has no clutter/stupid background, and looks simple/professional.

## 5. Save to the fix folder

```powershell
$root = 'c:\webdev\sang-logium\fixing-botched-product-images'
$folder = Join-Path $root $slug
New-Item -ItemType Directory -Path $folder -Force | Out-Null

$dest = Join-Path $folder "$slug$ext"
Move-Item -Path $tmp -Destination $dest -Force
$dest
```

## Done

Final path: `fixing-botched-product-images/<product-slug>/<product-slug>.<ext>`
