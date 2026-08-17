# Shared services: ONE dev server + ONE browser, reused by ALL agents.
# Agents must never start their own copies -- they reuse what this manages.
# Usage:
#   .\services.ps1 status
#   .\services.ps1 start-dev [-Dev]     # -Dev = next dev (hot reload); default = next start (light)
#   .\services.ps1 stop-dev
#   .\services.ps1 start-browser
#   .\services.ps1 stop-browser
param(
    [Parameter(Mandatory = $true)][ValidateSet('status','start-dev','stop-dev','start-browser','stop-browser')][string]$Action,
    [switch]$Dev
)

. (Join-Path $PSScriptRoot 'config.ps1')

function Test-Port([int]$Port) { [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) }

switch ($Action) {
    'status' {
        "next-dev      :3000  running=$(Test-Port 3000)"
        "cdp-browser   :9222  running=$(Test-Port 9222)"
        Get-Process cline,node,Code -ErrorAction SilentlyContinue |
            Group-Object Name | ForEach-Object {
                $mem = [math]::Round((($_.Group | Measure-Object WorkingSet64 -Sum).Sum) / 1MB, 0)
                "{0}: {1} proc(s), {2} MB" -f $_.Name, $_.Count, $mem
            }
    }
    'start-dev' {
        if (Test-Port 3000) { "next already running on :3000 -- reuse it, do NOT start a second." }
        else {
            if ($Dev) { Start-Process cmd -ArgumentList '/c','npm run dev' -WorkingDirectory $RepoRoot -WindowStyle Hidden }
            else      { Start-Process cmd -ArgumentList '/c','npm run start' -WorkingDirectory $RepoRoot -WindowStyle Hidden }
            "started next on :3000. (Plain start = production server, much lighter. Use -Dev only for human iteration.)"
        }
    }
    'stop-dev' {
        $c = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
        if ($c) { Stop-Process -Id $c.OwningProcess -Force; "stopped next-dev (pid $($c.OwningProcess))" }
        else { 'nothing listening on :3000' }
    }
    'start-browser' {
        if (Test-Port 9222) { "browser already on :9222 -- reuse it." }
        else {
            Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' `
                -ArgumentList '--remote-debugging-port=9222','--user-data-dir=C:\agent-browser','--no-first-run','about:blank'
            'started shared CDP Chrome on :9222 (profile C:\agent-browser)'
        }
    }
    'stop-browser' {
        $c = Get-NetTCPConnection -LocalPort 9222 -State Listen -ErrorAction SilentlyContinue
        if ($c) { Stop-Process -Id $c.OwningProcess -Force; "stopped browser (pid $($c.OwningProcess))" }
        else { 'nothing listening on :9222' }
    }
}
