# Windsurf Language Server Watchdog
# Automatically restarts language_server_windows_x64.exe when memory exceeds threshold

$ProcessName = "language_server_windows_x64"
$MemoryThresholdMB = 2048  # 2GB - conservative limit
$CheckIntervalSeconds = 30

Write-Host "Watchdog started - Monitoring $ProcessName (Memory limit: $MemoryThresholdMB MB)"
Write-Host "Press Ctrl+C to stop"

while ($true) {
    try {
        $process = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        
        if ($process) {
            $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
            
            if ($memoryMB -gt $MemoryThresholdMB) {
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - Memory exceeded: ${memoryMB}MB - Restarting..."
                
                Stop-Process -Name $ProcessName -Force
                Start-Sleep -Seconds 5
                
                # Windsurf will auto-restart the process
                Write-Host "$(Get-Date -Format 'HH:mm:ss') - Process killed, Windsurf will restart it automatically"
            }
        }
    }
    catch {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Error: $_"
    }
    
    Start-Sleep -Seconds $CheckIntervalSeconds
}
