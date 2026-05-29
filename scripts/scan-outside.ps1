# Disk space scan OUTSIDE sang-logium folder
# Read-only, excludes system files

$output = @()

$output += "=== C: DRIVE TOP-LEVEL FOLDERS (excluding system) ==="
$top = @('Users','Program Files','Program Files (x86)','Riot Games','Tools','Nowy folder','gl','xampp','wamp','webdev','webdevtools','Python312','frontend','realesrgan','SWSetup','webdevresources','temp','web dev blog','web dev deliberate practice','web dev exploration')
foreach ($f in $top) {
    $p = Join-Path 'C:\' $f
    if (Test-Path $p) {
        $s = (Get-ChildItem $p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        if ($s -gt 100MB) {
            $output += "{0,8:N2} GB  C:\{1}" -f ([math]::Round($s/1GB,2)), $f
        }
    }
}

$output += ""
$output += "=== USERS\JANPI BREAKDOWN ==="
$base = 'C:\Users\janpi'
foreach ($sf in @('OneDrive','Downloads','Documents','Desktop','AppData','Pictures','Videos','Music')) {
    $p = Join-Path $base $sf
    if (Test-Path $p) {
        $s = (Get-ChildItem $p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $output += "{0,8:N2} GB  Users\janpi\{1}" -f ([math]::Round($s/1GB,2)), $sf
    }
}

$output += ""
$output += "=== APPDATA BREAKDOWN ==="
$base = 'C:\Users\janpi\AppData'
foreach ($sf in @('Local','LocalLow','Roaming')) {
    $p = Join-Path $base $sf
    if (Test-Path $p) {
        $s = (Get-ChildItem $p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $output += "{0,8:N2} GB  AppData\{1}" -f ([math]::Round($s/1GB,2)), $sf
    }
}

$output += ""
$output += "=== APPDATA\LOCAL BIG FOLDERS (>500MB) ==="
$base = 'C:\Users\janpi\AppData\Local'
$localResults = @()
Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $s = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($s -gt 500MB) {
        $localResults += "{0,8:N2} GB  AppData\Local\{1}" -f ([math]::Round($s/1GB,2)), $_.Name
    }
}
$output += ($localResults | Sort-Object) -join "`n"

$output += ""
$output += "=== DOWNLOADS FILE TYPES ==="
$base = 'C:\Users\janpi\Downloads'
$exts = @('*.zip','*.exe','*.msi','*.iso','*.rar','*.7z')
foreach ($ext in $exts) {
    $files = Get-ChildItem $base -Filter $ext -Recurse -File -ErrorAction SilentlyContinue
    $count = $files.Count
    $size = ($files | Measure-Object -Property Length -Sum).Sum
    if ($size -gt 0) {
        $output += "{0,8:N2} GB  {1,4} files  {2}" -f ([math]::Round($size/1GB,2)), $count, $ext
    }
}

$output += ""
$output += "=== PROGRAM FILES BIG APPS (>1GB) ==="
$base = 'C:\Program Files'
$pfResults = @()
Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $s = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($s -gt 1GB) {
        $pfResults += "{0,8:N2} GB  Program Files\{1}" -f ([math]::Round($s/1GB,2)), $_.Name
    }
}
$output += ($pfResults | Sort-Object) -join "`n"

$output += ""
$output += "=== PROGRAM FILES (x86) BIG APPS (>1GB) ==="
$base = 'C:\Program Files (x86)'
$pfx86Results = @()
Get-ChildItem $base -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $s = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($s -gt 1GB) {
        $pfx86Results += "{0,8:N2} GB  Program Files (x86)\{1}" -f ([math]::Round($s/1GB,2)), $_.Name
    }
}
$output += ($pfx86Results | Sort-Object) -join "`n"

# Save output to file
$outFile = 'C:\webdev\sang-logium\scripts\scan-outside-results.txt'
$output | Out-File -FilePath $outFile -Encoding UTF8
Write-Host "Results saved to: $outFile"

