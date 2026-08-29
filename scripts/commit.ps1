<#
.SYNOPSIS
  /commit - Git commit protocol CLI for sang-logium.

  Implements the commit protocol from .devin/workflows/commit.md:
    Phase 1: Orient      - git status / diff discovery
    Phase 2: Constraints  - no deletion, no blanket staging, no aliases
    Phase 3: Taxonomy      - classify each unit (A-E, Difficulty 1-13)
    Phase 4: Execute      - stage precisely, commit, push to origin main

.EXAMPLE
  npm run commit
  powershell -File scripts\commit.ps1

.DESCRIPTION
  Enforces hard rules: stages files individually, never deletes,
  never uses git add . / -A / -a / git ac.
#>
param(
  [switch]$NoPush,
  [switch]$Help
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 3

if ($Help) {
  Write-Host "Usage: npm run commit"
  Write-Host "       powershell -File scripts\commit.ps1 [-NoPush]"
  Write-Host ""
  Write-Host "Implements .devin/workflows/commit.md: orient, classify (A-E), stage precisely,"
  Write-Host "commit with taxonomy tag, push to origin main. Never deletes files or uses"
  Write-Host "blanket staging (git add . / -A / -a) or git ac."
  exit 0
}

$RepoRoot = (Get-Item -LiteralPath $PSScriptRoot).Parent.FullName
Set-Location -LiteralPath $RepoRoot

function Show-Sep {
  param([string]$Title = "", [string]$Color = "Cyan")
  if ($Title) {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor $Color
    Write-Host $Title -ForegroundColor $Color
    Write-Host ("=" * 60) -ForegroundColor $Color
  }
}

function Confirm-YesNo {
  param([string]$Prompt, [bool]$Default = $true)
  $suffix = if ($Default) { "[Y/n]" } else { "[y/N]" }
  do {
    $resp = Read-Host "$Prompt $suffix"
    if ([string]::IsNullOrWhiteSpace($resp)) { return $Default }
    $resp = $resp.Trim().ToLower()
  } while ($resp -notin @("y", "yes", "n", "no"))
  return ($resp -in @("y", "yes"))
}

function Invoke-Git {
  param([string[]]$Arguments)
  $errFile = [System.IO.Path]::GetTempFileName()
  try {
    $out = & git @Arguments 2> $errFile
    $code = $LASTEXITCODE
  } finally {
    if (Test-Path $errFile) { Remove-Item $errFile -Force }
  }
  $err = if ($errFile -and (Test-Path $errFile)) { Get-Content $errFile -Raw -ErrorAction SilentlyContinue } else { "" }
  return [PSCustomObject]@{
    ExitCode = $code
    StdOut   = ($out | Out-String)
    StdErr   = $err
  }
}

# =========================================================================
# PHASE 1: Orient
# =========================================================================
Show-Sep " Phase 1: Orient " "Cyan"

Write-Host "Working directory: $RepoRoot"
$status = Invoke-Git @("status", "--short")
if ($status.ExitCode -ne 0) {
  Write-Host $status.StdErr -ForegroundColor Red
  exit 1
}

$branch = (Invoke-Git @("branch", "--show-current")).StdOut.Trim()
Write-Host "Current branch: $branch"

# Parse git status --short output (XY<tab>path or XY path)
$staged = @()
$unstaged = @()
$untracked = @()

foreach ($line in $status.StdOut -split "`n") {
  $line = $line.TrimEnd()
  if ([string]::IsNullOrWhiteSpace($line)) { continue }
  $marker = $line.Substring(0, 2)
  $path = $line.Substring(3).Trim()
    if ($marker -eq "??") {
    if ($path -notin $untracked) { $untracked += $path }
  } else {
    if ($marker[0] -ne " " -and $marker[0] -ne "?") {
      if ($path -notin $staged) { $staged += $path }
    }
    if ($marker[1] -ne " " -and $marker[1] -ne "?") {
      if ($path -notin $unstaged) { $unstaged += $path }
    }
  }
}

Write-Host "`n--- git status ---" -ForegroundColor DarkGray
Write-Host $status.StdOut

if ($staged.Count -gt 0) {
  Write-Host "`n[Staged files:]" -ForegroundColor Green
  $staged | ForEach-Object { Write-Host "  + $_" }
}
if ($unstaged.Count -gt 0) {
  Write-Host "`n[Unstaged modified:]" -ForegroundColor Yellow
  $unstaged | ForEach-Object { Write-Host "  ~ $_" }
}
if ($untracked.Count -gt 0) {
  Write-Host "`n[Untracked files:]" -ForegroundColor Gray
  $untracked | ForEach-Object { Write-Host "  ? $_" }
}

$allChanges = @($staged + $unstaged + $untracked | Select-Object -Unique)

if ($allChanges.Count -eq 0) {
  Write-Host "`nNothing to commit. Working tree clean." -ForegroundColor Green
  if (Confirm-YesNo "Push already-committed changes to origin main?" $false) {
    $pushResult = Invoke-Git @("push", "origin", "main")
    if ($pushResult.ExitCode -ne 0) {
      Write-Host $pushResult.StdErr -ForegroundColor Red
    } else {
      Write-Host "Pushed." -ForegroundColor Green
    }
  }
  exit 0
}

# =========================================================================
# PHASE 2: Constraints
# =========================================================================
Show-Sep " Phase 2: Strict Constraints " "Yellow"
Write-Host "The following are FORBIDDEN (hard failures):"
Write-Host "  1. NO FILE DELETION   - never 'git rm'/'rm'/'del'. (Existing deletions may be staged.)"
Write-Host "  2. NO BLANKET STAGING - never 'git add .'/'git add -A'/'git commit -a'."
Write-Host "  3. NO CUSTOM ALIASES  - never 'git ac'."
Write-Host "This script enforces all three automatically." -ForegroundColor DarkGray

# =========================================================================
# PHASE 3: Group files, classify taxonomy
# =========================================================================

$commitUnits = @()
$remaining = @($allChanges)
[int]$dummy = 0

Write-Host "`nYou have $($allChanges.Count) changed file(s). We will group them into"
Write-Host "atomic commit units and classify each one."

do {
  if ($remaining.Count -eq 0) { break }

  Write-Host "`nRemaining files:" -ForegroundColor Cyan
  for ($i = 0; $i -lt $remaining.Count; $i++) {
    Write-Host ("  [{0}] {1}" -f $i, $remaining[$i])
  }

  $indicesInput = Read-Host "`nComma-separated indices for this commit unit (e.g. 0,1,3), or ENTER for all remaining"
  if ([string]::IsNullOrWhiteSpace($indicesInput)) {
    $unitFiles = @($remaining)
  } else {
    $indices = $indicesInput -split ",\s*" | ForEach-Object {
      $n = $_.Trim()
      [int]$dummy = 0
      if ([int]::TryParse($n, [ref]$dummy)) { $n }
    } | Where-Object { $_ -ne $null }
    $unitFiles = @()
    foreach ($idx in $indices) {
      if ($idx -ge 0 -and $idx -lt $remaining.Count) {
        $unitFiles += $remaining[$idx]
      }
    }
    if ($unitFiles.Count -eq 0) {
      Write-Host "No valid selections. Try again." -ForegroundColor Red
      continue
    }
  }

    $remaining = @($remaining | Where-Object { $_ -notin $unitFiles })

  Write-Host "`n--- Classify this unit ---" -ForegroundColor DarkYellow
  Write-Host "Files: $($unitFiles -join ', ')"

  Write-Host "`nTaxonomy (pick exactly one):"
  Write-Host "  A - Forward progress: closes a DoD item on a required component"
  Write-Host "  B - Critical bug fix: resolves a CRITICAL bug blocking a DoD item"
  Write-Host "  C - Refactor: changes code structure without new functionality"
  Write-Host "  D - Configuration: build setup, .todo tracking, folder structure, skills/registry"
  Write-Host "  E - Polish: improvements to already-DoD-complete components"
  $tax = (Read-Host "Category [A/B/C/D/E]").Trim().ToUpper()
  while ($tax -notin @("A", "B", "C", "D", "E")) {
    Write-Host "Invalid. Pick A, B, C, D, or E." -ForegroundColor Red
    $tax = (Read-Host "Category [A/B/C/D/E]").Trim().ToUpper()
  }

  $catMap = @{
    A = "Forward progress"; B = "Critical bug fix"; C = "Refactor";
    D = "Configuration";   E = "Polish"
  }
  $categoryLabel = $catMap[$tax]

  $diff = (Read-Host "Difficulty (1-13 Fib). Default 5").Trim()
  if ([string]::IsNullOrWhiteSpace($diff)) { $diff = "5" }
  while (-not ([int]::TryParse($diff, [ref]$dummy)) -or [int]$diff -lt 1 -or [int]$diff -gt 13) {
    Write-Host "Invalid difficulty. Enter 1-13." -ForegroundColor Red
    $diff = (Read-Host "Difficulty (1-13 Fib). Default 5").Trim()
    if ([string]::IsNullOrWhiteSpace($diff)) { $diff = "5" }
  }

  $scope = (Read-Host "Scope/filenames (e.g. 'scripts/commit.ps1')").Trim()
  if ([string]::IsNullOrWhiteSpace($scope)) { $scope = ($unitFiles[0]) }

  $action = (Read-Host "Action description (e.g. 'add /commit CLI workflow')").Trim()
  while ([string]::IsNullOrWhiteSpace($action)) {
    Write-Host "Action is required." -ForegroundColor Red
    $action = (Read-Host "Action description").Trim()
  }

  $dod = (Read-Host "DoD tag (e.g. 'SprintName-item', or ENTER for '0 <infrastructure>' )").Trim()
  if ([string]::IsNullOrWhiteSpace($dod)) {
    $dodTag = "DoD:0 <infrastructure>"
  } else {
    $dodTag = "DoD:$dod"
  }

  $commitUnits += [PSCustomObject]@{
    Files      = $unitFiles
    Tax        = $tax
    Category   = $categoryLabel
    Difficulty = $diff
    Scope      = $scope
    Action     = $action
    DoDTag     = $dodTag
  }

  Write-Host "`nUnit added. Remaining: $($remaining.Count)"
} while ($remaining.Count -gt 0 -and (Confirm-YesNo "Add another commit unit?" $true))

if ($commitUnits.Count -eq 0) {
    Write-Host "No commit units defined. Aborting." -ForegroundColor Yellow
  exit 0
}

# =========================================================================
# PHASE 4: Output planned commands + autonomous execution
# =========================================================================
Show-Sep " Phase 4: Planned Commands " "Green"

foreach ($unit in $commitUnits) {
  $msg = "Difficulty: $($unit.Difficulty) - $($unit.Tax), $($unit.Category) ($($unit.Scope)): $($unit.Action) -> $($unit.DoDTag)"
    $planLine = "`n  git add " + ($unit.Files -join " ") + ";  git commit -m "
  Write-Host $planLine -NoNewline -ForegroundColor DarkGray
  Write-Host "'$msg'" -ForegroundColor Gray
  Write-Host "  Files:"
  $unit.Files | ForEach-Object { Write-Host "    - $_" }
}

if (-not $NoPush) {
  Write-Host "`nFinal step: git push origin main" -ForegroundColor DarkGray
}

Write-Host ""
if (-not (Confirm-YesNo "Execute these commands now?" $true)) {
  Write-Host "Aborted. No changes made." -ForegroundColor Yellow
  exit 0
}

foreach ($unit in $commitUnits) {
  Write-Host "`n[Staging + committing]" -ForegroundColor Cyan

  $addArgs = @("add") + $unit.Files
    $addResult = Invoke-Git $addArgs
  if ($addResult.ExitCode -ne 0) {
    Write-Host ("  git add failed: " + $addResult.StdErr) -ForegroundColor Red
    if (-not (Confirm-YesNo "Continue to next unit?" $false)) { break } else { continue }
  }
  Write-Host "  Staged:" -ForegroundColor DarkGray
  $stagedNow = Invoke-Git @("diff", "--cached", "--name-only")
  Write-Host ("    " + ($stagedNow.StdOut.Trim() -replace "`n", "`n    "))

  $cmsg = "Difficulty: $($unit.Difficulty) - $($unit.Tax), $($unit.Category) ($($unit.Scope)): $($unit.Action) -> $($unit.DoDTag)"
  $commitResult = Invoke-Git @("commit", "-m", $cmsg)
  if ($commitResult.ExitCode -ne 0) {
    Write-Host ("  COMMIT FAILED: " + $commitResult.StdErr) -ForegroundColor Red
    if (-not (Confirm-YesNo "Continue to next unit?" $false)) { break } else { continue }
  } else {
    Write-Host ("  Committed: " + $commitResult.StdOut.Trim()) -ForegroundColor Green
  }
}

if (-not $NoPush) {
  if (Confirm-YesNo "Push commits to origin main?" $true) {
    Write-Host "`n[Pushing to origin main]" -ForegroundColor Cyan
    $pushResult = Invoke-Git @("push", "origin", "main")
    if ($pushResult.ExitCode -ne 0) {
      Write-Host ("Push failed: " + $pushResult.StdErr) -ForegroundColor Red
    } else {
      Write-Host ("Push OK: " + $pushResult.StdOut.Trim()) -ForegroundColor Green
    }
  }
}

Write-Host "`nDone. AGENTS.md: end sessions cleanly." -ForegroundColor Cyan
exit 0
