# One-time ELEVATED setup: Defender exclusions, service disables, HKLM startup disables.
# Self-elevates (UAC prompt). Run once:  .\setup-elevated.ps1
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).
    IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Start-Process powershell -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
    'Elevation requested -- complete the UAC prompt, then confirm with: .\setup-elevated.ps1'
    exit
}

'=== ELEVATED SETUP ==='

# 1) Defender exclusions -- kill the silent node_modules scan tax.
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
foreach ($path in @('C:\webdev', (Join-Path $repoRoot 'node_modules'), 'C:\agent-browser')) {
    try { Add-MpPreference -ExclusionPath $path -ErrorAction Stop; "Defender exclusion added: $path" }
    catch { "FAILED exclusion $path : $($_.Exception.Message)" }
}

# 2) HP / Omen services.
foreach ($svc in @('HPSysInfoCap','HPSupportSolutionsFrameworkService','OMENCommandCenterBackgroundService','OMENCommandCenterBackground')) {
    $s = Get-Service -Name $svc -ErrorAction SilentlyContinue
    if ($s) {
        try {
            Set-Service -Name $svc -StartupType Disabled -ErrorAction Stop
            Stop-Service -Name $svc -Force -ErrorAction SilentlyContinue
            "service disabled: $svc"
        } catch { "FAILED service $svc : $($_.Exception.Message)" }
    }
}

# 3) HKLM Run entries (KeePass preload, Riot Vanguard tray, HP launcher).
$RunKey = 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Run'
foreach ($p in (Get-Item $RunKey).Property) {
    if ($p -like '_OFF_*' -or $p -in @('SecurityHealth','RtkAudUService')) { continue }
    try { Rename-ItemProperty -Path $RunKey -Name $p -NewName "_OFF_$p" -ErrorAction Stop; "startup disabled: $p" }
    catch { "FAILED $p : $($_.Exception.Message)" }
}

# 4) Power plan.
powercfg /setactive SCHEME_MIN 2>$null
'Power plan: High Performance active.'

'=== ELEVATED SETUP COMPLETE ==='
