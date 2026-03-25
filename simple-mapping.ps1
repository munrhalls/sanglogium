# Simple Catalog Mapping
Write-Host "Simple catalog mapping..." -ForegroundColor Green

try {
    $payload = Get-Content "nested-catalog-payload.json" -Raw | ConvertFrom-Json
    $inventory = Get-Content "raw-inventory.json" -Raw | ConvertFrom-Json
    
    # Map products to leaf nodes
    foreach ($item in $payload) {
        if ($item.children) {
            foreach ($child in $item.children) {
                $productIds = @()
                $childKey = $child._key
                
                foreach ($product in $inventory) {
                    foreach ($category in $product.catalogueLocationKeys) {
                        $match = $false
                        
                        if ($childKey -eq "wired" -and $category -match "wired") { $match = $true }
                        if ($childKey -eq "wireless" -and $category -match "wireless") { $match = $true }
                        if ($childKey -eq "noise-cancelling" -and $category -match "noise") { $match = $true }
                        if ($childKey -eq "earbuds" -and $category -match "earbud") { $match = $true }
                        if ($childKey -eq "floor-standing-speakers" -and $category -match "floor") { $match = $true }
                        if ($childKey -eq "bookshelf-speakers" -and $category -match "bookshelf") { $match = $true }
                        if ($childKey -eq "audio-cables" -and $category -match "cable") { $match = $true }
                        
                        if ($match) {
                            $productIds += $product._id
                            break
                        }
                    }
                }
                
                if ($productIds.Count -gt 0) {
                    $child | Add-Member -NotePropertyName "productIds" -NotePropertyValue $productIds -Force
                    Write-Host "$($child.title): $($productIds.Count) products"
                }
            }
        }
    }
    
    $payload | ConvertTo-Json -Depth 10 | Out-File -FilePath "nested-catalog-payload.json" -Encoding utf8
    Write-Host "✅ Mapping completed"
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    exit 1
}
