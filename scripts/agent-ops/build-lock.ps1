# Build token: only ONE agent may run heavy work at a time
# (next build, full Playwright suite, full vitest, full tsc).
# This is what protects the 2 fast cores on this machine.
# Usage:
#   .\build-lock.ps1 acquire -Owner agent-3
#   .\build-lock.ps1 release -Owner agent-3
#   .\build-lock.ps1 status
#   .\build-lock.ps1 force-release
param(
    [Parameter(Mandatory = $true)][ValidateSet('acquire','release','status','force-release')][string]$Action,
    [string]$Owner = $env:USERNAME
)

. (Join-Path $PSScriptRoot 'config.ps1')

switch ($Action) {
    'acquire' {
        if (Test-Path $BuildLockFile) {
            $h = Get-Content $BuildLockFile | ConvertFrom-Json
            "LOCKED by $($h.owner) since $($h.time) -- wait or force-release."
            exit 1
        }
        @{ owner = $Owner; time = Get-Date -Format 'yyyy-MM-dd HH:mm:ss' } | ConvertTo-Json | Set-Content $BuildLockFile
        "build lock acquired by $Owner"
    }
    'release' {
        if (-not (Test-Path $BuildLockFile)) { 'no lock held'; exit 0 }
        $h = Get-Content $BuildLockFile | ConvertFrom-Json
        if ($h.owner -eq $Owner) { Remove-Item $BuildLockFile; "lock released by $Owner" }
        else { "lock held by $($h.owner) -- only they (or force-release) may release."; exit 1 }
    }
    'force-release' {
        Remove-Item $BuildLockFile -ErrorAction SilentlyContinue
        'build lock force-released'
    }
    'status' {
        if (Test-Path $BuildLockFile) { Get-Content $BuildLockFile } else { 'no build lock held' }
    }
}
