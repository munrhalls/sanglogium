# Language Server Watchdog
# Logs RAM every 15s. Auto-kills language_server_windows_x64 if RAM exceeds threshold.
# Windsurf auto-respawns it within seconds — you lose ~30s of re-indexing, system stays usable.
#
# Enhanced: Clears cache (implicit/, database/) before restart to address root cause.
# Preserves cascade/ (chat history).
#
# Run in a separate PowerShell window:
#   Start-Process powershell -ArgumentList "-NoExit","-File","C:\webdev\sang-logium\scripts\language-server-watchdog.ps1"
#
# Stop with Ctrl+C in that window.

$thresholdMB = 4000          # kill if RAM exceeds this many MB
$pollSeconds = 15            # check every N seconds
$logPath     = Join-Path $PSScriptRoot "language-server-monitor.log"
$enableCacheClear = $true    # enable cache clearing before restart (addresses root cause)
$cachePath   = "$env:USERPROFILE\.codeium\windsurf"

function Clear-LanguageServerCache {
    param (
        [string]$Path
    )
    
    $implicitPath = "$Path\implicit"
    $databasePath = "$Path\database"
    $cleared = $false
    
    try {
        if (Test-Path $implicitPath) {
            Remove-Item $implicitPath -Recurse -Force -ErrorAction Stop
            $msg = "Cleared cache: $implicitPath"
            Add-Content -Path $logPath -Value $msg
            Write-Host $msg -ForegroundColor Cyan
            $cleared = $true
        }
        
        if (Test-Path $databasePath) {
            Remove-Item $databasePath -Recurse -Force -ErrorAction Stop
            $msg = "Cleared cache: $databasePath"
            Add-Content -Path $logPath -Value $msg
            Write-Host $msg -ForegroundColor Cyan
            $cleared = $true
        }
        
        # NOTE: cascade/ is preserved (contains chat history - user data)
        if (-not $cleared) {
            $msg = "Cache clear: No cache directories found (already clean)"
            Add-Content -Path $logPath -Value $msg
            Write-Host $msg -ForegroundColor Gray
        }
    }
    catch {
        $msg = "Cache clear error: $_"
        Add-Content -Path $logPath -Value $msg
        Write-Host $msg -ForegroundColor Yellow
    }
}

"=== Watchdog started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') threshold=${thresholdMB}MB poll=${pollSeconds}s cacheClear=$enableCacheClear ===" | Out-File -FilePath $logPath -Append
Write-Host "Watchdog active. Threshold: ${thresholdMB} MB. Logging to $logPath" -ForegroundColor Green

while ($true) {
    $p  = Get-Process language_server_windows_x64 -ErrorAction SilentlyContinue
    $os = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    $ts = Get-Date -Format 'HH:mm:ss'

    if ($p) {
        $ramMB = [math]::Round($p.WorkingSet64 / 1MB, 0)
        $cpuS  = [math]::Round($p.CPU, 0)
        $sysPct = if ($os) { [math]::Round((($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize) * 100, 1) } else { "?" }

        if ($ramMB -gt $thresholdMB) {
            $msg = "{0} THRESHOLD EXCEEDED PID={1} RAM_MB={2} (>{3}) CPU_s={4} SYS_PCT={5}" -f $ts, $p.Id, $ramMB, $thresholdMB, $cpuS, $sysPct
            Add-Content -Path $logPath -Value $msg
            Write-Host $msg -ForegroundColor Red
            
            if ($enableCacheClear) {
                Clear-LanguageServerCache -Path $cachePath
            }
            
            $msg = "{0} RESTARTING PID={1}" -f $ts, $p.Id
            Add-Content -Path $logPath -Value $msg
            Write-Host $msg -ForegroundColor Yellow
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        } else {
            $line = "{0} PID={1} RAM_MB={2} CPU_s={3} SYS_PCT={4}" -f $ts, $p.Id, $ramMB, $cpuS, $sysPct
            Add-Content -Path $logPath -Value $line
        }
    } else {
        Add-Content -Path $logPath -Value "$ts (no language_server process running)"
    }
    Start-Sleep -Seconds $pollSeconds
}
