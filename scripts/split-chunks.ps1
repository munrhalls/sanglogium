# Split products JSON chunks in half
# Example: products-50-99.json -> products-50-75.json and products-75-99.json

$chunksDir = "c:\webdev\sang-logium\_temporary\catalogue-mapping\chunks"

# Get all products JSON files sorted by name
$files = Get-ChildItem -Path $chunksDir -Filter "products-*.json" | Sort-Object Name

foreach ($file in $files) {
    Write-Host "Processing: $($file.Name)"
    
    # Parse the filename to get the range
    $baseName = $file.BaseName  # e.g., "products-50-99"
    $match = $baseName -match 'products-(\d+)-(\d+)'
    
    if (-not $match) {
        Write-Host "  Skipping - does not match expected pattern"
        continue
    }
    
    $startNum = [int]$matches[1]
    $endNum = [int]$matches[2]
    
    # Read and parse the JSON
    $jsonContent = Get-Content $file.FullName -Raw | ConvertFrom-Json
    $totalItems = $jsonContent.Count
    
    Write-Host "  Range: $startNum-$endNum, Total items: $totalItems"
    
    # Calculate the split point
    $midPoint = [math]::Ceiling($totalItems / 2)
    
    # Split into two halves
    $firstHalf = $jsonContent[0..($midPoint - 1)]
    $secondHalf = $jsonContent[$midPoint..($totalItems - 1)]
    
    # Calculate new ranges (distribute evenly)
    $rangeSize = $endNum - $startNum + 1
    $firstRangeSize = [math]::Ceiling($rangeSize / 2)
    $firstEnd = $startNum + $firstRangeSize - 1
    $secondStart = $firstEnd + 1
    
    # Create new filenames
    $firstFileName = "products-$startNum-$firstEnd.json"
    $secondFileName = "products-$secondStart-$endNum.json"
    
    $firstPath = Join-Path $chunksDir $firstFileName
    $secondPath = Join-Path $chunksDir $secondFileName
    
    Write-Host "  -> $firstFileName ($($firstHalf.Count) items)"
    Write-Host "  -> $secondFileName ($($secondHalf.Count) items)"
    
    # Write the split files
    $firstHalf | ConvertTo-Json -Depth 10 | Set-Content $firstPath
    $secondHalf | ConvertTo-Json -Depth 10 | Set-Content $secondPath
    
    # Remove the original file
    Remove-Item $file.FullName
    Write-Host "  Removed original: $($file.Name)"
    Write-Host ""
}

Write-Host "Done! All chunks have been split."
