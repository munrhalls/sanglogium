Write-Host "=== TARGETED SCAN: BIG CONSUMERS ==="
Write-Host ""

# Check C:\Users\janpi breakdown
Write-Host "=== C:\Users\janpi BREAKDOWN ==="
Get-ChildItem "C:\Users\janpi" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
    }
}

# Check Riot Games
Write-Host ""
Write-Host "=== C:\Riot Games BREAKDOWN ==="
Get-ChildItem "C:\Riot Games" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
}

# Check Tools
Write-Host ""
Write-Host "=== C:\Tools BREAKDOWN ==="
Get-ChildItem "C:\Tools" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
}

# Check "Nowy folder"
Write-Host ""
Write-Host "=== C:\Nowy folder BREAKDOWN ==="
Get-ChildItem "C:\Nowy folder" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
}

# Check gl
Write-Host ""
Write-Host "=== C:\gl BREAKDOWN ==="
Get-ChildItem "C:\gl" -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
}

# Check node_modules
Write-Host ""
Write-Host "=== NODE_MODULES (>100MB) ==="
Get-ChildItem -Path C:\ -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*") -and -not ($p -like "*\riot games*")
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $_.FullName)
    }
}

# Check .git repos
Write-Host ""
Write-Host "=== .GIT REPOSITORIES (>100MB) ==="
Get-ChildItem -Path C:\ -Recurse -Directory -Filter ".git" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*") -and -not ($p -like "*\riot games*")
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $_.FullName)
    }
}

# Large media in Users
Write-Host ""
Write-Host "=== LARGE MEDIA FILES (>100MB) ==="
Get-ChildItem -Path "C:\Users\janpi" -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Extension -in @('.mp4','.mov','.avi','.mkv','.wmv','.iso') -and $_.Length -gt 100MB
} | ForEach-Object {
    Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($_.Length/1MB,2)), $_.FullName)
}

Write-Host ""
Write-Host "=== DONE ==="
