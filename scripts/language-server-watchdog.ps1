# Language Server Watchdog
# Logs RAM every 15s. Auto-kills language_server_windows_x64 if RAM exceeds threshold.
# Windsurf auto-respawns it within seconds — you lose ~30s of re-indexing, system stays usable.
#
# Run in a separate PowerShell window:
#   Start-Process powershell -ArgumentList "-NoExit","-File","C:\webdev\sang-logium\scripts\language-server-watchdog.ps1"
#
# Stop with Ctrl+C in that window.

$thresholdMB = 4000          # kill if RAM exceeds this many MB
$pollSeconds = 15            # check every N seconds
$logPath     = Join-Path $PSScriptRoot "language-server-monitor.log"

"=== Watchdog started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') threshold=${thresholdMB}MB poll=${pollSeconds}s ===" | Out-File -FilePath $logPath -Append
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
            $msg = "{0} KILL PID={1} RAM_MB={2} (>{3}) CPU_s={4} SYS_PCT={5}" -f $ts, $p.Id, $ramMB, $thresholdMB, $cpuS, $sysPct
            Add-Content -Path $logPath -Value $msg
            Write-Host $msg -ForegroundColor Red
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
