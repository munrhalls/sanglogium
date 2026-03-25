# Test Payload Topology Validation Script
Write-Host "Starting payload topology validation..." -ForegroundColor Green

try {
    # Read nested catalog payload
    $payload = Get-Content "nested-catalog-payload.json" -Raw | ConvertFrom-Json
    # Read raw inventory for reference validation
    $inventory = Get-Content "raw-inventory.json" -Raw | ConvertFrom-Json
    
    Write-Host "📊 Validation Metrics:" -ForegroundColor Cyan
    Write-Host "   Catalog items: $($payload.Count)" -ForegroundColor White
    Write-Host "   Inventory products: $($inventory.Count)" -ForegroundColor White
    
    # Recursive validation function
    function Validate-Item($item, $path = "") {
        $errors = @()
        $warnings = @()
        
        # Validate required fields
        if (-not $item._type -or $item._type -ne "catalogueItem") {
            $errors += "Missing or invalid _type at $path"
        }
        
        if (-not $item.title) {
            $errors += "Missing title at $path"
        }
        
        if (-not $item.type -or $item.type -notin @("link", "header")) {
            $errors += "Missing or invalid type at $path"
        }
        
        # Type-specific validations
        if ($item.type -eq "link") {
            # Link items must have slug
            if (-not $item.slug -or -not $item.slug._type -or $item.slug._type -ne "slug" -or -not $item.slug.current) {
                $errors += "Link item missing valid slug at $path"
            }
            
            # Link items must have productIds if they are leaf nodes (no children)
            if (-not $item.children) {
                if (-not $item.productIds) {
                    $errors += "Leaf link item missing productIds at $path"
                } elseif ($item.productIds -isnot [array]) {
                    $errors += "productIds must be an array at $path"
                } else {
                    # Validate each productId exists in inventory
                    foreach ($productId in $item.productIds) {
                        $found = $inventory | Where-Object { $_._id -eq $productId }
                        if (-not $found) {
                            $errors += "Product ID '$productId' not found in inventory at $path"
                        }
                    }
                }
            }
        }
        
        if ($item.type -eq "header") {
            # Header items must have children
            if (-not $item.children) {
                $errors += "Header item missing children at $path"
            }
            
            # Header items should NOT have productIds
            if ($item.productIds) {
                $warnings += "Header item has productIds (should not) at $path"
            }
        }
        
        # Recursively validate children
        if ($item.children) {
            if ($item.children -isnot [array]) {
                $errors += "Children must be an array at $path"
            } else {
                for ($i = 0; $i -lt $item.children.Count; $i++) {
                    $childPath = if ($path) { "$path.children[$i]" } else { "children[$i]" }
                    $childValidation = Validate-Item $item.children[$i] $childPath
                    $errors += $childValidation.errors
                    $warnings += $childValidation.warnings
                }
            }
        }
        
        return @{ errors = $errors; warnings = $warnings }
    }
    
    # Run validation
    Write-Host "`n🔍 Running structural validation..." -ForegroundColor Cyan
    $allErrors = @()
    $allWarnings = @()
    
    for ($i = 0; $i -lt $payload.Count; $i++) {
        $validation = Validate-Item $payload[$i] "payload[$i]"
        $allErrors += $validation.errors
        $allWarnings += $validation.warnings
    }
    
    # Report results
    Write-Host "`n📋 Validation Results:" -ForegroundColor Cyan
    
    if ($allErrors.Count -eq 0) {
        Write-Host "✅ All structural validations passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Found $($allErrors.Count) errors:" -ForegroundColor Red
        foreach ($error in $allErrors) {
            Write-Host "   - $error" -ForegroundColor Red
        }
    }
    
    if ($allWarnings.Count -gt 0) {
        Write-Host "⚠️  Found $($allWarnings.Count) warnings:" -ForegroundColor Yellow
        foreach ($warning in $allWarnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
    }
    
    # Additional statistics
    $linkItems = 0
    $headerItems = 0
    $leafLinks = 0
    $totalProductIds = 0
    
    function Count-Items($item) {
        if ($item.type -eq "link") {
            $linkItems++
            if (-not $item.children) {
                $leafLinks++
                if ($item.productIds) {
                    $totalProductIds += $item.productIds.Count
                }
            }
        } elseif ($item.type -eq "header") {
            $headerItems++
        }
        
        if ($item.children) {
            foreach ($child in $item.children) {
                Count-Items $child
            }
        }
    }
    
    foreach ($item in $payload) {
        Count-Items $item
    }
    
    Write-Host "`n📈 Catalog Statistics:" -ForegroundColor Cyan
    Write-Host "   Link items: $linkItems" -ForegroundColor White
    Write-Host "   Header items: $headerItems" -ForegroundColor White
    Write-Host "   Leaf links (with productIds): $leafLinks" -ForegroundColor White
    Write-Host "   Total product assignments: $totalProductIds" -ForegroundColor White
    
    # Exit with appropriate code
    if ($allErrors.Count -gt 0) {
        Write-Host "`n❌ Validation failed with $($allErrors.Count) errors" -ForegroundColor Red
        exit 1
    } else {
        Write-Host "`n✅ All validations passed!" -ForegroundColor Green
        Write-Host "🎯 Payload is ready for database insertion" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Validation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Payload topology validation completed!" -ForegroundColor Green
