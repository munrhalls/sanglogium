# Real-time memory spike monitor
# Run this in background while editing to capture the leak spike

$processName = "language_server_windows_x64"
$thresholdMB = 2000
$logFile = "memory-spike-log.txt"
$interval = 2  # Check every 2 seconds

Write-Host "=== Memory Spike Monitor Started ==="
Write-Host "Monitoring: $processName"
Write-Host "Threshold: $thresholdMB MB"
Write-Host "Log file: $logFile"
Write-Host "Press Ctrl+C to stop`n"

# Clear previous log
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Monitor started" | Out-File $logFile

while ($true) {
    $process = Get-Process -Name $processName -ErrorAction SilentlyContinue
    
    if ($process) {
        $ramMB = [math]::Round($process.WorkingSet64 / 1MB, 0)
        $cpu = [math]::Round($process.CPU, 0)
        
        $logEntry = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - RAM: ${ramMB}MB, CPU: ${cpu}s"
        $logEntry | Out-File $logFile -Append
        
        if ($ramMB -gt $thresholdMB) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] SPIKE DETECTED: ${ramMB}MB" -ForegroundColor Red
            
            # Capture additional diagnostics
            $cachePath = "$env:USERPROFILE\.codeium\windsurf"
            $implicitSize = if (Test-Path "$cachePath\implicit") { 
                [math]::Round((Get-ChildItem "$cachePath\implicit" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum/1MB,1) 
            } else { 0 }
            
            $tmpCount = Get-ChildItem $cachePath -Recurse -Filter "*.tmp" -ErrorAction SilentlyContinue | Measure-Object | Select-Object -ExpandProperty Count
            
            "Spike at ${ramMB}MB - implicit: ${implicitSize}MB, tmp files: ${tmpCount}" | Out-File $logFile -Append
        }
        else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ${ramMB}MB" -ForegroundColor Green
        }
    }
    else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Process not found" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds $interval
}
