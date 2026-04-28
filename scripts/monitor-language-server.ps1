# Background monitor for language_server_windows_x64
# Run in a separate PowerShell window: pwsh -File scripts\monitor-language-server.ps1
# Logs RAM/CPU every 30 seconds to scripts\language-server-monitor.log
# Tail the log when lag hits to see exact growth curve.

$logPath = Join-Path $PSScriptRoot "language-server-monitor.log"
"=== Monitor started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $logPath -Append

while ($true) {
    $p = Get-Process language_server_windows_x64 -ErrorAction SilentlyContinue
    $os = Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
    if ($p) {
        $ramMB = [math]::Round($p.WorkingSet64 / 1MB, 0)
        $cpuS  = [math]::Round($p.CPU, 0)
        $sysPct = if ($os) { [math]::Round((($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize) * 100, 1) } else { "?" }
        $line = "{0} PID={1} RAM_MB={2} CPU_s={3} SYS_PCT={4}" -f (Get-Date -Format 'HH:mm:ss'), $p.Id, $ramMB, $cpuS, $sysPct
    } else {
        $line = "{0} (no language_server process running)" -f (Get-Date -Format 'HH:mm:ss')
    }
    Add-Content -Path $logPath -Value $line
    Start-Sleep -Seconds 30
}
