# Fix Catalog Mapping - Add productIds to leaf nodes
Write-Host "Fixing catalog mapping..." -ForegroundColor Green

try {
    # Read current payload and inventory
    $payload = Get-Content "nested-catalog-payload.json" -Raw | ConvertFrom-Json
    $inventory = Get-Content "raw-inventory.json" -Raw | ConvertFrom-Json
    
    Write-Host "📊 Processing $($payload.Count) catalog items with $($inventory.Count) products" -ForegroundColor White
    
    # Function to add productIds to leaf nodes
    function Add-ProductIdsToLeaf($item) {
        if ($item.children -and $item.children.Count -gt 0) {
            # This item has children, process them recursively
            foreach ($child in $item.children) {
                Add-ProductIdsToLeaf $child
            }
        } elseif ($item.type -eq "link") {
            # This is a leaf node, add productIds based on mapping
            $productIds = @()
            $itemKey = $item._key
            
            # Map products based on catalogueLocationKeys and item key
            foreach ($product in $inventory) {
                foreach ($category in $product.catalogueLocationKeys) {
                    if ($category -like "*$itemKey*" -or
                        ($itemKey -eq "wired" -and $category -match "wired|cable") -or
                        ($itemKey -eq "wireless" -and $category -match "wireless|bluetooth") -or
                        ($itemKey -eq "noise-cancelling" -and $category -match "noise|anc") -or
                        ($itemKey -eq "earbuds" -and $category -match "earbud|tws") -or
                        ($itemKey -eq "floor-standing-speakers" -and $category -match "floor.*standing") -or
                        ($itemKey -eq "bookshelf-speakers" -and $category -match "bookshelf") -or
                        ($itemKey -eq "audio-cables" -and $category -match "cable|audio.*cable")) {
                        $productIds += $product._id
                        break
                    }
                }
            }
            
            if ($productIds.Count -gt 0) {
                $item | Add-Member -NotePropertyName "productIds" -NotePropertyValue $productIds -Force
                Write-Host "✅ Mapped $($productIds.Count) products to $($item.title)" -ForegroundColor Green
            }
        }
    }
    
    # Process all items in payload
    foreach ($catalogItem in $payload) {
        Add-ProductIdsToLeaf $catalogItem
    }
    
    # Save updated payload
    $payload | ConvertTo-Json -Depth 10 | Out-File -FilePath "nested-catalog-payload.json" -Encoding utf8
    
    # Show summary
    $totalMapped = 0
    function CountMapped($item) {
        if ($item.productIds) {
            $totalMapped += $item.productIds.Count
        }
        if ($item.children) {
            foreach ($child in $item.children) {
                CountMapped $child
            }
        }
    }
    
    foreach ($catalogItem in $payload) {
        CountMapped $catalogItem
    }
    
    Write-Host "📈 Total products mapped: $totalMapped" -ForegroundColor Cyan
    Write-Host "✅ Catalog mapping fixed and saved" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Fix failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Catalog mapping fix completed!" -ForegroundColor Green
