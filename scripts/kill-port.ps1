param([int]$Port = 3000)
$conns = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
foreach ($c in $conns) {
    Write-Host "Killing PID $($c.OwningProcess) on port $Port"
    Stop-Process -Id $c.OwningProcess -Force
}
