# Toggle background bloat: startup entries + running processes. Wispr Flow untouched.
# Usage: .\bloat.ps1 off | on | status
param([Parameter(Mandatory = $true)][ValidateSet('off','on','status')][string]$Action)

. (Join-Path $PSScriptRoot 'config.ps1')

$RunKey = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Run'

switch ($Action) {
    'off' {
        foreach ($p in (Get-Item $RunKey).Property) {
            if ($p -like '_OFF_*') { continue }
            Rename-ItemProperty -Path $RunKey -Name $p -NewName "_OFF_$p" -ErrorAction SilentlyContinue
            "startup disabled: $p"
        }
        foreach ($n in $BloatProcesses) {
            Get-Process -Name $n -ErrorAction SilentlyContinue | ForEach-Object {
                try { Stop-Process -Id $_.Id -Force -ErrorAction Stop; "killed: $($_.Name)" } catch {}
            }
        }
        'Note: HKLM startup entries + services need elevation -- run .\setup-elevated.ps1 once.'
    }
    'on' {
        foreach ($p in (Get-Item $RunKey).Property) {
            if ($p -like '_OFF_*') {
                Rename-ItemProperty -Path $RunKey -Name $p -NewName $p.Substring(5) -ErrorAction SilentlyContinue
                "startup restored: $($p.Substring(5))"
            }
        }
        'HKCU restored. HKLM entries are restored by setup-elevated.ps1 (or manually).'
    }
    'status' {
        'HKCU Run entries:'
        (Get-Item $RunKey).Property | ForEach-Object { "  $_" }
    }
}
