# C: Drive Quick Scan - System Safe
$outFile = "C:\webdev\c-scan-results.txt"

"=== C: DRIVE SCAN RESULTS ===" | Set-Content $outFile
"Total: 476 GB | Free: $( [math]::Round((Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace/1GB, 2) ) GB" | Add-Content $outFile
"" | Add-Content $outFile

# Top-level folders on C:
"=== TOP-LEVEL FOLDERS ===" | Add-Content $outFile
$folders = @()
Get-ChildItem C:\ -Directory -ErrorAction SilentlyContinue | Where-Object {
    $n = $_.Name
    $n -notin @('Windows','$Recycle.Bin','System Volume Information','Config.Msi','MSOCache') -and -not ($n -like '$*')
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    $folders += [PSCustomObject]@{Name=$_.Name; SizeGB=[math]::Round($size/1GB,2)}
}
$folders | Sort-Object SizeGB -Descending | ForEach-Object {
    "{0,8:N2} GB  {1}" -f $_.SizeGB, $_.Name | Add-Content $outFile
}

# Users breakdown
"`n=== USERS BREAKDOWN ===" | Add-Content $outFile
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    "{0,8:N2} GB  {1}" -f ([math]::Round($size/1GB,2)), $_.Name | Add-Content $outFile
}

# AppData Local
"`n=== APPDATA LOCAL (per user) ===" | Add-Content $outFile
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $localPath = Join-Path $_.FullName "AppData\Local"
    if (Test-Path $localPath) {
        $size = (Get-ChildItem $localPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 1GB) {
            "{0,8:N2} GB  {1}\AppData\Local" -f ([math]::Round($size/1GB,2)), $_.Name | Add-Content $outFile
        }
    }
}

# AppData Roaming
"`n=== APPDATA ROAMING (per user) ===" | Add-Content $outFile
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $roamPath = Join-Path $_.FullName "AppData\Roaming"
    if (Test-Path $roamPath) {
        $size = (Get-ChildItem $roamPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 1GB) {
            "{0,8:N2} GB  {1}\AppData\Roaming" -f ([math]::Round($size/1GB,2)), $_.Name | Add-Content $outFile
        }
    }
}

# Downloads folders
"`n=== DOWNLOADS FOLDERS ===" | Add-Content $outFile
Get-ChildItem C:\Users -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $dlPath = Join-Path $_.FullName "Downloads"
    if (Test-Path $dlPath) {
        $size = (Get-ChildItem $dlPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 100MB) {
            "{0,8:N2} GB  {1}\Downloads" -f ([math]::Round($size/1GB,2)), $_.Name | Add-Content $outFile
        }
    }
}

# node_modules across C:
"`n=== NODE_MODULES CLUSTERS (>100MB) ===" | Add-Content $outFile
Get-ChildItem -Path C:\ -Recurse -Directory -Filter "node_modules" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*")
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        "{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $_.FullName | Add-Content $outFile
    }
}

# .next cache
"`n=== .NEXT CACHE (>50MB) ===" | Add-Content $outFile
Get-ChildItem -Path C:\ -Recurse -Directory -Filter ".next" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*")
} | ForEach-Object {
    $cachePath = Join-Path $_.FullName "cache"
    if (Test-Path $cachePath) {
        $size = (Get-ChildItem $cachePath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($size -gt 50MB) {
            "{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $cachePath | Add-Content $outFile
        }
    }
}

# .git repos
"`n=== .GIT REPOSITORIES (>100MB) ===" | Add-Content $outFile
Get-ChildItem -Path C:\ -Recurse -Directory -Filter ".git" -ErrorAction SilentlyContinue | Where-Object {
    $p = $_.FullName.ToLower()
    -not ($p -like "*\windows*") -and -not ($p -like "*\program files*")
} | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 100MB) {
        "{0,8:N2} MB  {1}" -f ([math]::Round($size/1MB,2)), $_.FullName | Add-Content $outFile
    }
}

# Large media files
"`n=== LARGE MEDIA FILES (>100MB) ===" | Add-Content $outFile
Get-ChildItem -Path C:\Users -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Extension -in @('.mp4','.mov','.avi','.mkv','.wmv','.iso','.vmdk','.dmg') -and $_.Length -gt 100MB
} | ForEach-Object {
    "{0,8:N2} MB  {1}" -f ([math]::Round($_.Length/1MB,2)), $_.FullName | Add-Content $outFile
}

# Backup/archive files
"`n=== BACKUP / ARCHIVE FILES (>50MB) ===" | Add-Content $outFile
Get-ChildItem -Path C:\Users -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.Extension -in @('.zip','.tar','.gz','.tgz','.rar','.7z','.bak','.backup') -and $_.Length -gt 50MB
} | ForEach-Object {
    "{0,8:N2} MB  {1}" -f ([math]::Round($_.Length/1MB,2)), $_.FullName | Add-Content $outFile
}

"`n=== SCAN COMPLETE ===" | Add-Content $outFile
Write-Host "Scan complete. Results saved to $outFile"
