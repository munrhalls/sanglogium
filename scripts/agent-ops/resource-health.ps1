# One-shot resource snapshot.
# Usage:  .\resource-health.ps1        (human table)
#         .\resource-health.ps1 -Json  (for agents/scripts)
param([switch]$Json)

. (Join-Path $PSScriptRoot 'config.ps1')

$os      = Get-CimInstance Win32_OperatingSystem
$freeMB  = [math]::Round($os.FreePhysicalMemory / 1024, 0)
$totalMB = [math]::Round($os.TotalVisibleMemorySize / 1024, 0)
$usedPct = [math]::Round(100 * (1 - $os.FreePhysicalMemory / $os.TotalVisibleMemorySize), 1)

$top = Get-Process | Sort-Object WorkingSet64 -Descending |
    Select-Object -First 10 Name, Id,
        @{N='MemMB';E={[math]::Round($_.WorkingSet64/1MB,1)}},
        @{N='CPUsec';E={[math]::Round($_.CPU,1)}}

$ports = foreach ($k in $Services.Keys) {
    $busy = [bool](Get-NetTCPConnection -LocalPort $Services[$k] -State Listen -ErrorAction SilentlyContinue)
    [PSCustomObject]@{ Service = $k; Port = $Services[$k]; Running = $busy }
}

if ($Json) {
    [PSCustomObject]@{
        freeMB  = $freeMB
        totalMB = $totalMB
        usedPct = $usedPct
        alert   = ($freeMB -lt $FreeRAMAlertMB)
    } | ConvertTo-Json
    return
}

"=== RESOURCE HEALTH $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ==="
"RAM: $usedPct% used  |  $freeMB MB free of $totalMB MB"
if ($freeMB -lt $FreeRAMAlertMB) { "  WARNING: free RAM below alert threshold ($FreeRAMAlertMB MB)" }
"--- Top 10 consumers ---"
$top | Format-Table -AutoSize
"--- Shared services ---"
$ports | Format-Table -AutoSize
