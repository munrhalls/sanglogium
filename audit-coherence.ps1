param (
    [Parameter(Mandatory=$true)]
    [string]$EntryPoint
)

# Global trackers
$Script:AuditedFiles = @{}
$Script:TotalViolations = 0
$Script:FeatureStats = @{}
$BaseDir = Get-Location

# System Tokens/Patterns
$MagicNumberPattern = 'class(Name)?=.*\[.+?\]'
$NonTokenSpacing = '(?<![a-zA-Z])(p[xy]?|m[xy]?|gap)-(?!(1|2|3|4|6|8|20|36)\b)\d+'
$ForbiddenTextSizes = 'text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)'
$ForbiddenSpacings = '(tracking|leading)-(?!widest|tight|normal|none)\w+'

function Get-FeatureName([string]$FilePath) {
    # 1. Try to get specific sub-feature folder (e.g. features/homepage/hero -> feature:hero)
    if ($FilePath -match "features[\\/].+[\\/]([^\\/]+)[\\/]") { return "feature:$($Matches[1])" }

    # 2. Try to get top-level feature (e.g. features/homepage -> feature:homepage)
    if ($FilePath -match "features[\\/]([^\\/]+)") { return "feature:$($Matches[1])" }

    # 3. Try to get specific layout component (e.g. layout/general/Shelf -> layout:general)
    if ($FilePath -match "layout[\\/]([^\\/]+)") { return "layout:$($Matches[1])" }

    return "core/other"
}

function Get-Imports([string]$FilePath) {
    $Dir = Split-Path $FilePath
    $FoundImports = @()
    if (Test-Path $FilePath) {
        $Content = Get-Content $FilePath
        $Matches = [regex]::Matches($Content, 'from\s+["''](.+?)["'']')
        foreach ($Match in $Matches) {
            $RawPath = $Match.Groups[1].Value
            $ResolvedPath = $null

            if ($RawPath.StartsWith("@/")) {
                $ResolvedPath = Join-Path $BaseDir ($RawPath.Substring(2))
            } elseif ($RawPath.StartsWith(".")) {
                $ResolvedPath = [System.IO.Path]::GetFullPath((Join-Path $Dir $RawPath))
            }

            if ($ResolvedPath) {
                $Extensions = @(".tsx", ".ts", ".js")
                foreach ($ext in $Extensions) {
                    if (Test-Path "$ResolvedPath$ext") { $FoundImports += "$ResolvedPath$ext"; break }
                    if (Test-Path "$ResolvedPath/index$ext") { $FoundImports += "$ResolvedPath/index$ext"; break }
                }
            }
        }
    }
    return $FoundImports
}

function Audit-File([string]$FilePath) {
    if (-not (Test-Path $FilePath)) { return }
    $NormalizedPath = [System.IO.Path]::GetFullPath($FilePath)
    if ($Script:AuditedFiles.ContainsKey($NormalizedPath)) { return }

    $Script:AuditedFiles[$NormalizedPath] = $true
    $Feature = Get-FeatureName $FilePath

    $isConfigOrData = $FilePath -match "tailwind\.config\.ts$" -or $FilePath -match "tailwind\.ts$" -or $FilePath -match "\.json$"

    if (-not $isConfigOrData) {
        $Content = Get-Content $FilePath
        $Violations = @()

        for ($i = 0; $i -lt $Content.Count; $i++) {
            $Line = $Content[$i]
            $IsViolation = $Line -match $MagicNumberPattern -or
                           $Line -match $NonTokenSpacing -or
                           $Line -match $ForbiddenTextSizes -or
                           $Line -match $ForbiddenSpacings

            if ($IsViolation) {
                $isTechnical = $Line -match '\[\w+\]' -and ($Line -match '\], \["' -or $Line -match "useEffect|useCallback|useMemo")
                if (-not $isTechnical -and $Line -notmatch "// @coherence-bypass") {
                    $Violations += [PSCustomObject]@{ Line = $i + 1; Text = $Line.Trim() }
                }
            }
        }

        if ($Violations) {
            $Script:TotalViolations += $Violations.Count
            if (-not $Script:FeatureStats.ContainsKey($Feature)) { $Script:FeatureStats[$Feature] = 0 }
            $Script:FeatureStats[$Feature] += $Violations.Count

            Write-Host "`nFile: $FilePath" -ForegroundColor Yellow
            foreach ($v in $Violations) {
                Write-Host "  Line $($v.Line): $($v.Text)" -ForegroundColor White
            }
        }
    }

    $Imports = Get-Imports $FilePath
    foreach ($Import in $Imports) { Audit-File $Import }
}

Write-Host "`n--- STARTING GRAPH AUDIT FROM: $EntryPoint ---" -ForegroundColor Cyan
Audit-File $EntryPoint

Write-Host "`n--- AUDIT SUMMARY ---" -ForegroundColor Cyan
Write-Host "Total Files Scanned:    $($Script:AuditedFiles.Count)"
$SummaryColor = if ($Script:TotalViolations -gt 0) { "Red" } else { "Green" }
Write-Host "Total Flags Identified: $($Script:TotalViolations)" -ForegroundColor $SummaryColor

Write-Host "`nBREAKDOWN BY FEATURE:" -ForegroundColor Cyan
$Script:FeatureStats.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object {
    $FeatureColor = if ($_.Value -gt 5) { "Red" } elseif ($_.Value -gt 0) { "Yellow" } else { "Green" }
    Write-Host "$($_.Key.PadRight(30)): $($_.Value) flags" -ForegroundColor $FeatureColor
}
Write-Host "`n--- AUDIT COMPLETE ---" -ForegroundColor Cyan