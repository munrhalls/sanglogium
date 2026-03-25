# Insert Catalog into Sanity Database
Write-Host "Starting catalog insertion..." -ForegroundColor Green

try {
    # Pre-flight validation
    Write-Host "Running pre-flight validation..." -ForegroundColor Cyan
    
    # Quick validation checks
    $payload = Get-Content "nested-catalog-payload.json" -Raw | ConvertFrom-Json
    $inventory = Get-Content "raw-inventory.json" -Raw | ConvertFrom-Json
    
    # Validate structure
    $errors = @()
    
    # Check link items have slug and productIds
    foreach ($item in $payload) {
        if ($item.type -eq "link" -and -not $item.slug) {
            $errors += "Link item missing slug: $($item.title)"
        }
        if ($item.children) {
            foreach ($child in $item.children) {
                if ($child.type -eq "link") {
                    if (-not $child.slug) {
                        $errors += "Child link item missing slug: $($child.title)"
                    }
                    if (-not $child.productIds) {
                        $errors += "Child link item missing productIds: $($child.title)"
                    }
                }
            }
        }
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "Pre-flight validation failed:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "   - $error" -ForegroundColor Red
        }
        exit 1
    }
    
    Write-Host "Pre-flight validation passed" -ForegroundColor Green
    
    # Prepare catalog document for insertion
    $catalogDocument = @{
        _type = "catalogue"
        catalogue = $payload
    }
    
    # Save catalog document for review
    $catalogDocument | ConvertTo-Json -Depth 10 | Out-File -FilePath "catalog-for-insertion.json" -Encoding utf8
    
    Write-Host "Catalog document prepared: catalog-for-insertion.json" -ForegroundColor White
    Write-Host "Catalog contains $($payload.Count) main categories" -ForegroundColor White
    
    # Show insertion summary
    $totalProducts = 0
    foreach ($item in $payload) {
        if ($item.children) {
            foreach ($child in $item.children) {
                if ($child.productIds) {
                    $totalProducts += $child.productIds.Count
                    Write-Host "   $($child.title): $($child.productIds.Count) products" -ForegroundColor White
                }
            }
        }
    }
    Write-Host "Total products to insert: $totalProducts" -ForegroundColor Cyan
    
    # For safety, show the structure without actually inserting
    Write-Host "Catalog Structure Preview:" -ForegroundColor Cyan
    $payload | ForEach-Object {
        Write-Host "   $($_.title) ($($_._key))" -ForegroundColor White
        if ($_.children) {
            $_.children | ForEach-Object {
                Write-Host "     └── $($_.title)" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host "To complete insertion:" -ForegroundColor Yellow
    Write-Host "   1. Review catalog-for-insertion.json" -ForegroundColor White
    Write-Host "   2. Use Sanity Studio or API to insert the document" -ForegroundColor White
    Write-Host "   3. Verify the insertion resolves correctly" -ForegroundColor White
    
    Write-Host "Catalog insertion preparation completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "Catalog insertion failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Script completed with code 0" -ForegroundColor Green
