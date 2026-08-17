# agent-ops config -- shared by every script in this folder.
# Central place for budgets, bloat list, ports, and paths.
$ErrorActionPreference = 'Continue'

$script:OpsDir         = $PSScriptRoot
$script:RepoRoot       = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$script:LogDir         = Join-Path $OpsDir 'logs'
$script:BakDir         = Join-Path $OpsDir 'backup'
$script:RamLog         = Join-Path $LogDir 'ram-log.csv'
$script:BuildLockFile  = Join-Path $OpsDir '.build-lock'

# Per-process memory budgets in MB. Watchdog alerts on breach.
# 'cline' budget is PER-AGENT (largest single process); all others are totals by name.
$Budgets = @{
    'node'   = 2600   # total: shared Next server (~2 GB) + tooling
    'cline'  = 1200   # per agent; a single agent running a browser may spike higher - tracked
    'Code'   = 1600   # total: VS Code
    'chrome' = 2200   # total: shared CDP/Playwright browser
    'msedge' = 900
}

# Alert when free RAM drops below this many MB.
$FreeRAMAlertMB = 2000

# Shared services: name -> port.
$Services = @{
    'next-dev'       = 3000
    'playwright-cdp' = 9222
}

# Background bloat: processes killed by start-session.ps1 / bloat.ps1.
# Wispr Flow is intentionally NOT here -- voice input is mandatory, never touched.
$BloatProcesses = @(
    'ms-teams','OmenCommandCenterBackground','OverlayHelper','WhatsApp.Root','WhatsApp',
    'Discord','RiotClientServices','vgtray','Loom','Gyazo','GyStation','PicPick','picpick',
    'OneDrive','AdobeCollabSync','KeePass','ssn','HpseuHostLauncher','com.docker.backend',
    'com.docker.build','Docker Desktop','Docker Desktop Backend'
)
