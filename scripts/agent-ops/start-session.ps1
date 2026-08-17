# Start a disciplined agent session: kill bloat (Wispr ALWAYS kept), print baseline.
# Usage: .\start-session.ps1 [-SkipBloatCleanup]
param([switch]$SkipBloatCleanup)

. (Join-Path $PSScriptRoot 'config.ps1')

if (-not $SkipBloatCleanup) {
    "Killing background bloat (Wispr Flow is NEVER touched)..."
    foreach ($n in $BloatProcesses) {
        Get-Process -Name $n -ErrorAction SilentlyContinue | ForEach-Object {
            try { Stop-Process -Id $_.Id -Force -ErrorAction Stop; "  killed $($_.Name)" } catch {}
        }
    }
}
''
'--- BASELINE ---'
& (Join-Path $PSScriptRoot 'resource-health.ps1')
