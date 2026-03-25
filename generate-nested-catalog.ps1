# Generate Nested Catalog Payload with AI Mapping
Write-Host "Generating nested catalog payload..." -ForegroundColor Green

try {
    # Read raw inventory data
    $inventoryData = Get-Content "raw-inventory.json" -Raw | ConvertFrom-Json
    
    # Read catalog structure from data.ts
    $catalogData = Get-Content "app/components/layout/catalogue/data.ts" -Raw
    
    # Extract the CATALOGUE_DATA array
    if ($catalogData -match 'export const CATALOGUE_DATA: CatalogueItem\[\] = (\[[\s\S]*?\]);') {
        $catalogStructure = $matches[1]
    } else {
        Write-Host "❌ Could not extract catalog structure from data.ts" -ForegroundColor Red
        exit 1
    }
    
    # Parse catalog structure (simplified approach)
    $catalogItems = @()
    
    # Define catalog slots based on the data.ts structure
    $catalogSlots = @{
        "headphones" = @{
            _key = "headphones"
            _type = "catalogueItem"
            title = "Headphones & Personal Audio"
            type = "link"
            slug = @{ _type = "slug"; current = "headphones" }
            icon = "headphones"
            children = @(
                @{
                    _key = "wired"
                    _type = "catalogueItem"
                    title = "Wired"
                    type = "link"
                    slug = @{ _type = "slug"; current = "wired" }
                },
                @{
                    _key = "wireless"
                    _type = "catalogueItem"
                    title = "Wireless"
                    type = "link"
                    slug = @{ _type = "slug"; current = "wireless" }
                },
                @{
                    _key = "noise-cancelling"
                    _type = "catalogueItem"
                    title = "Noise cancelling"
                    type = "link"
                    slug = @{ _type = "slug"; current = "noise-cancelling" }
                },
                @{
                    _key = "earbuds"
                    _type = "catalogueItem"
                    title = "Earbuds"
                    type = "link"
                    slug = @{ _type = "slug"; current = "earbuds" }
                }
            )
        }
        "speakers" = @{
            _key = "speakers"
            _type = "catalogueItem"
            title = "Speakers"
            type = "link"
            slug = @{ _type = "slug"; current = "speakers" }
            icon = "speaker"
            children = @(
                @{
                    _key = "floor-standing-speakers"
                    _type = "catalogueItem"
                    title = "Floor standing speakers"
                    type = "link"
                    slug = @{ _type = "slug"; current = "floor-standing-speakers" }
                },
                @{
                    _key = "bookshelf-speakers"
                    _type = "catalogueItem"
                    title = "Bookshelf speakers"
                    type = "link"
                    slug = @{ _type = "slug"; current = "bookshelf-speakers" }
                }
            )
        }
        "accessories" = @{
            _key = "accessories"
            _type = "catalogueItem"
            title = "Accessories"
            type = "link"
            slug = @{ _type = "slug"; current = "accessories" }
            icon = "cable"
            children = @(
                @{
                    _key = "audio-cables"
                    _type = "catalogueItem"
                    title = "Audio cables"
                    type = "link"
                    slug = @{ _type = "slug"; current = "audio-cables" }
                }
            )
        }
    }
    
    # Map products to catalog slots
    foreach ($slot in $catalogSlots.Keys) {
        $catalogItem = $catalogSlots[$slot]
        $productIds = @()
        
        # Map products based on catalogueLocationKeys
        foreach ($product in $inventoryData) {
            foreach ($category in $product.catalogueLocationKeys) {
                if ($category -like "*$slot*" -or 
                    ($slot -eq "headphones" -and $category -match "headphone|earbud|wired|wireless") -or
                    ($slot -eq "speakers" -and $category -match "speaker|subwoofer") -or
                    ($slot -eq "accessories" -and $category -match "cable|accessory")) {
                    $productIds += $product._id
                    break
                }
            }
        }
        
        # Add productIds to leaf nodes (type == "link" with no children)
        if ($catalogItem.children) {
            foreach ($child in $catalogItem.children) {
                $childProductIds = @()
                foreach ($product in $inventoryData) {
                    foreach ($category in $product.catalogueLocationKeys) {
                        $childKey = $child._key
                        if ($category -like "*$childKey*" -or
                            ($childKey -eq "wired" -and $category -match "wired|cable") -or
                            ($childKey -eq "wireless" -and $category -match "wireless|bluetooth") -or
                            ($childKey -eq "audio-cables" -and $category -match "cable")) {
                            $childProductIds += $product._id
                            break
                        }
                    }
                }
                if ($childProductIds.Count -gt 0) {
                    $child | Add-Member -NotePropertyName "productIds" -NotePropertyValue $childProductIds
                }
            }
        }
        
        $catalogItems += $catalogItem
    }
    
    # Save nested catalog payload
    $catalogItems | ConvertTo-Json -Depth 10 | Out-File -FilePath "nested-catalog-payload.json" -Encoding utf8
    
    Write-Host "✅ Nested catalog payload generated: nested-catalog-payload.json" -ForegroundColor Green
    Write-Host "📊 Catalog contains $($catalogItems.Count) main categories" -ForegroundColor White
    
    # Show mapping summary
    $totalMappedProducts = 0
    foreach ($item in $catalogItems) {
        if ($item.children) {
            foreach ($child in $item.children) {
                if ($child.productIds) {
                    $totalMappedProducts += $child.productIds.Count
                    Write-Host "   $($child.title): $($child.productIds.Count) products" -ForegroundColor White
                }
            }
        }
    }
    Write-Host "📈 Total mapped products: $totalMappedProducts" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Catalog generation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Nested catalog generation completed successfully!" -ForegroundColor Green
