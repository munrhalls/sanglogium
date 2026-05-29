$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$total = [math]::Round($disk.Size/1GB,2)
$free = [math]::Round($disk.FreeSpace/1GB,2)
$used = [math]::Round(($disk.Size-$disk.FreeSpace)/1GB,2)

Write-Host "C: Drive: $total GB total, $used GB used, $free GB free"
Write-Host ""

Write-Host "=== TOP-LEVEL FOLDERS ==="
Get-ChildItem C:\ -Directory -ErrorAction SilentlyContinue | Where-Object {
    $n = $_.Name
    $n -notin @('Windows','$Recycle.Bin','System Volume Information','Config.Msi','MSOCache') -and -not ($n -like '$*')
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
}

Write-Host ""
Write-Host "=== USERS ==="
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    Write-Host ("{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name)
}

Write-Host ""
Write-Host "=== APPDATA LOCAL (per user, >1GB) ==="
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $localPath = Join-Path $_.FullName "AppData\Local"
    if (Test-Path $localPath) {
        $size = (Get-ChildItem $localPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 1GB) {
            Write-Host ("{0,8:N2} GB  {1}\AppData\Local" -f ([math]::Round($size/1GB,2)), $_.Name)
        }
    }
}

Write-Host ""
Write-Host "=== APPDATA ROAMING (per user, >1GB) ==="
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $roamPath = Join-Path $_.FullName "AppData\Roaming"
    if (Test-Path $roamPath) {
        $size = (Get-ChildItem $roamPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 1GB) {
            Write-Host ("{0,8:N2} GB  {1}\AppData\Roaming" -f ([math]::Round($size/1GB,2)), $_.Name)
        }
    }
}

Write-Host ""
Write-Host "=== DOWNLOADS (>100MB) ==="
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $dlPath = Join-Path $_.FullName "Downloads"
    if (Test-Path $dlPath) {
        $size = (Get-ChildItem $dlPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 100MB) {
            Write-Host ("{0,8:N2} GB  {1}\Downloads" -f ([math]::Round($size/1GB,2)), $_.Name)
        }
    }
}

Write-Host ""
Write-Host "=== NODE_MODULES CLUSTERS (>100MB) ==="
Get-ChildItem -Path C:\ -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*")
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $_.FullName)
    }
}

Write-Host ""
Write-Host "=== .GIT REPOS (>100MB) ==="
Get-ChildItem -Path C:\ -Recurse -Directory -Filter ".git" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*")
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $_.FullName)
    }
}

Write-Host ""
Write-Host "=== LARGE MEDIA (>100MB) ==="
Get-ChildItem -Path C:\Users -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Extension -in @('.mp4','.mov','.avi','.mkv','.wmv','.iso') -and $_.Length -gt 100MB
} | ForEach-Object {
    Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($_.Length/1MB,2)), $_.FullName)
}

Write-Host ""
Write-Host "=== BACKUP/ARCHIVE (>50MB) ==="
Get-ChildItem -Path C:\Users -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Extension -in @('.zip','.tar','.gz','.tgz','.rar','.7z','.bak') -and $_.Length -gt 50MB
} | ForEach-Object {
    Write-Host ("{0,8:N2} MB  {1}" -f ([math]::Round($_.Length/1MB,2)), $_.FullName)
}

Write-Host ""
Write-Host "=== SCAN COMPLETE ==="
