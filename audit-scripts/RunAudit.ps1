param ([string]$EntryPoint = "app/(store)/page.tsx")

$PSScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Import-Module (Join-Path $PSScriptRoot "AuditEngine.psm1") -Force
. (Join-Path $PSScriptRoot "CoherenceRules.ps1")

$FullLog = New-Object System.Text.StringBuilder
$Logger = { 
    param($txt, $clr) 
    Write-Host $txt -ForegroundColor $clr
    [void]$FullLog.AppendLine($txt) 
}

&$Logger "`n--- STARTING GRAPH AUDIT FROM: $EntryPoint ---" "Cyan"
Audit-File -FilePath $EntryPoint -OutputAction $Logger

&$Logger "`n--- AUDIT SUMMARY ---" "Cyan"
$ViolationsCount = $Script:TotalViolations
$SumColor = if ($ViolationsCount -gt 0) { "Red" } else { "Green" }
&$Logger "Total Flags Identified: $ViolationsCount" $SumColor

$FullLog.ToString() | Set-Clipboard
Write-Host "`nDONE: Results copied to clipboard." -ForegroundColor Green
