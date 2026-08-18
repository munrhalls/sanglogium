# Sang-logium dev launcher -- spun up by the desktop shortcut "Sang-logium Dev.lnk".
# One click: reuse :3000 if it's already up, otherwise start `next dev` in this window.
$RepoRoot = Split-Path $PSScriptRoot -Parent

if (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue) {
    Write-Host "next is already running on :3000 -> http://localhost:3000" -ForegroundColor Yellow
    exit
}

Set-Location $RepoRoot
Write-Host "starting next dev on http://localhost:3000 ..." -ForegroundColor Green
npm run dev
