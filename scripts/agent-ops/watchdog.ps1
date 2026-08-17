# Continuous resource watchdog: logs every tick to logs/ram-log.csv, alerts on breach.
# Usage:  .\watchdog.ps1 [-IntervalSeconds 30] [-MaxRuns 0]
# Run it in a spare terminal during agent sessions. Check logs/ram-log.csv when slow.
param([int]$IntervalSeconds = 30, [int]$MaxRuns = 0)

. (Join-Path $PSScriptRoot 'config.ps1')
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (-not (Test-Path $RamLog)) {
    'timestamp,free_mb,used_pct,alert,offenders' | Set-Content $RamLog
}

$run = 0
while ($true) {
    $run++
    $os = Get-CimInstance Win32_OperatingSystem
    $freeMB  = [math]::Round($os.FreePhysicalMemory / 1024, 0)
    $usedPct = [math]::Round(100 * (1 - $os.FreePhysicalMemory / $os.TotalVisibleMemorySize), 1)

    $offenders = @()
    foreach ($name in $Budgets.Keys) {
        $procs = @(Get-Process -Name $name -ErrorAction SilentlyContinue)
        if ($procs.Count -eq 0) { continue }
        $total    = [math]::Round((($procs | Measure-Object WorkingSet64 -Sum).Sum) / 1MB, 0)
        $maxSingle = [math]::Round((($procs | Measure-Object WorkingSet64 -Maximum).Maximum) / 1MB, 0)
        # 'cline' is per-agent (largest single process); everything else is a name-total.
        $over = if ($name -eq 'cline') { $maxSingle } else { $total }
        if ($over -gt $Budgets[$name]) {
            if ($name -eq 'cline') { $offenders += "$name(max)=${maxSingle}MB" }
            else                   { $offenders += "$name=${total}MB" }
        }
    }

    $alert = ($freeMB -lt $FreeRAMAlertMB) -or ($offenders.Count -gt 0)
    "{0},{1},{2},{3},{4}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $freeMB, $usedPct, $alert, ($offenders -join ';') | Add-Content $RamLog

    $stamp = Get-Date -Format 'HH:mm:ss'
    if ($alert) { "ALERT $stamp  free=$freeMB MB ($usedPct%)  offenders: $($offenders -join ', ')" }
    else        { "ok    $stamp  free=$freeMB MB ($usedPct%)" }

    if ($MaxRuns -gt 0 -and $run -ge $MaxRuns) { break }
    Start-Sleep -Seconds $IntervalSeconds
}
