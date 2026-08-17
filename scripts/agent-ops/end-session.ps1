# End a session: print after-action; optionally stop shared services / re-kill bloat.
# Usage: .\end-session.ps1 [-StopSharedServices] [-KillBloatOnExit]
param([switch]$StopSharedServices, [switch]$KillBloatOnExit)

. (Join-Path $PSScriptRoot 'config.ps1')

'--- AFTER-ACTION ---'
& (Join-Path $PSScriptRoot 'resource-health.ps1')

if ($StopSharedServices) {
    & (Join-Path $PSScriptRoot 'services.ps1') stop-dev
    & (Join-Path $PSScriptRoot 'services.ps1') stop-browser
    'shared services stopped'
}
if ($KillBloatOnExit) {
    foreach ($n in $BloatProcesses) {
        Get-Process -Name $n -ErrorAction SilentlyContinue | ForEach-Object {
            try { Stop-Process -Id $_.Id -Force -ErrorAction Stop } catch {}
        }
    }
    'bloat re-killed on exit'
}
