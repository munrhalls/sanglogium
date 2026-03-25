# Sanity Inventory Extraction Script - Zero Waste Data Projection
Write-Host "Starting exact inventory extraction..." -ForegroundColor Green

try {
    Write-Host "🔍 Using CSV data source..." -ForegroundColor Cyan
    
    # Read CSV file directly
    $csvData = Import-Csv -Path "all_products.csv" -Encoding UTF8
    $inventory = @()
    
    # Convert CSV to required format
    foreach ($product in $csvData) {
        # Extract product name from description if title is empty
        $productName = $product.Title
        if ([string]::IsNullOrWhiteSpace($productName)) {
            # Take first 50 characters of description as fallback
            $productName = ($product.Description -split '\n')[0].Trim()
            if ($productName.Length -gt 50) {
                $productName = $productName.Substring(0, 50) + "..."
            }
        }
        
        if ([string]::IsNullOrWhiteSpace($productName) -eq $false -and $productName -match "\w") {
            $inventoryItem = @{
                _id = $product.ID
                title = $productName
                brand = $product.Brand
                catalogueLocationKeys = @($product.Category)
            }
            $inventory += $inventoryItem
        }
    }
    
    Write-Host "📊 CSV conversion: $($inventory.Count) products" -ForegroundColor White
    
    # Sanitation pass - remove objects with null/undefined values
    $sanitizedInventory = @()
    $removedCount = 0
    
    foreach ($product in $inventory) {
        # Check for null/undefined critical fields
        if (-not $product._id -or -not $product.title -or -not $product.catalogueLocationKeys) {
            $removedCount++
            continue
        }
        
        # Ensure catalogueLocationKeys is string[]
        if ($product.catalogueLocationKeys -isnot [array]) {
            if ($product.catalogueLocationKeys) {
                $product.catalogueLocationKeys = @($product.catalogueLocationKeys.ToString())
            } else {
                $product.catalogueLocationKeys = @()
            }
        }
        
        # Strip to only the 4 required keys
        $sanitizedProduct = @{
            _id = $product._id
            title = $product.title
            brand = $product.brand
            catalogueLocationKeys = $product.catalogueLocationKeys
        }
        
        $sanitizedInventory += $sanitizedProduct
    }
    
    Write-Host "🧹 Sanitation: Removed $removedCount invalid products" -ForegroundColor Yellow
    Write-Host "✅ Sanitized: $($sanitizedInventory.Count) valid products" -ForegroundColor Green
    
    # Verify minimum product count
    if ($sanitizedInventory.Count -lt 579) {
        Write-Host "❌ Insufficient products: $($sanitizedInventory.Count) products found" -ForegroundColor Red
        exit 1
    }
    
    # Save to file
    $sanitizedInventory | ConvertTo-Json -Depth 10 | Out-File -FilePath "raw-inventory.json" -Encoding utf8
    
    # Final verification - check file contains only required keys
    $fileContent = Get-Content "raw-inventory.json" -Raw | ConvertFrom-Json
    $expectedKeys = @("_id", "title", "brand", "catalogueLocationKeys")
    
    foreach ($item in $fileContent) {
        $actualKeys = $item | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name
        $extraKeys = $actualKeys | Where-Object { $_ -notin $expectedKeys }
        
        if ($extraKeys) {
            Write-Host "❌ Found extra keys: $($extraKeys -join ', ')" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ File validation passed: Only required keys present" -ForegroundColor Green
    Write-Host "✅ Extraction completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Script completed with code 0" -ForegroundColor Green
