# Simple CSV to JSON extraction
$csvData = Import-Csv -Path "all_products.csv" -Encoding UTF8
$inventory = @()

foreach ($product in $csvData) {
    $productName = $product.Title
    if ([string]::IsNullOrWhiteSpace($productName)) {
        $productName = ($product.Description -split '\n')[0].Trim()
        if ($productName.Length -gt 50) {
            $productName = $productName.Substring(0, 50) + "..."
        }
    }
    
    if ([string]::IsNullOrWhiteSpace($productName) -eq $false) {
        $inventoryItem = @{
            _id = $product.ID
            title = $productName
            brand = $product.Brand
            catalogueLocationKeys = @($product.Category)
        }
        $inventory += $inventoryItem
    }
}

Write-Host "Extracted $($inventory.Count) products"

$inventory | ConvertTo-Json -Depth 10 | Out-File -FilePath "raw-inventory.json" -Encoding utf8
Write-Host "Saved to raw-inventory.json"
