$Script:AuditedFiles = @{}
$Script:TotalViolations = 0

function Get-Imports([string]$FilePath) {
    $Dir = Split-Path $FilePath
    $Found = @()
    if (Test-Path $FilePath) {
        $Content = Get-Content $FilePath
        $Matches = [regex]::Matches($Content, 'from\s+["''](.+?)["'']')
        foreach ($M in $Matches) {
            $Raw = $M.Groups[1].Value
            $Resolved = $null
            if ($Raw.StartsWith("@/")) { $Resolved = Join-Path (Get-Location) ($Raw.Substring(2)) }
            elseif ($Raw.StartsWith(".")) { $Resolved = [System.IO.Path]::GetFullPath((Join-Path $Dir $Raw)) }
            if ($Resolved) {
                foreach ($ext in @(".tsx", ".ts")) {
                    if (Test-Path "$Resolved$ext") { $Found += "$Resolved$ext"; break }
                    if (Test-Path "$Resolved/index$ext") { $Found += "$Resolved/index$ext"; break }
                }
            }
        }
    }
    return $Found
}

function Test-LineCoherence([string]$Line) {
    if (-not $Global:CoherenceRules) { return @() }
    $Violations = @()

    # 1. THE SVG BYPASS: Ignore lines containing SVG specific tags
    $isSvgInternal = $Line -match '<(path|rect|circle|svg|g|polyline|line|polygon)\s' -or $Line -match 'fill=' -or $Line -match 'stroke='
    if ($isSvgInternal) { return @() }

    foreach ($Rule in $Global:CoherenceRules.Patterns.GetEnumerator()) {
        if ($Line -match $Rule.Value -and $Line -notmatch "// @coherence-bypass") {
            # 2. THE TECHNICAL BYPASS: Ignore useEffect and dependency arrays
            $isTechnical = $Line -match '\[\w+\]' -and ($Line -match '\], \["' -or $Line -match "useEffect")
            if (-not $isTechnical) { $Violations += $Rule.Key }
        }
    }
    return $Violations
}

function Audit-File {
    param ([string]$FilePath, [scriptblock]$OutputAction)
    $Norm = [System.IO.Path]::GetFullPath($FilePath)
    if ($Script:AuditedFiles.ContainsKey($Norm) -or -not (Test-Path $Norm)) { return }
    $Script:AuditedFiles[$Norm] = $true

    $Content = Get-Content $Norm
    $FileViolations = @()
    for ($i = 0; $i -lt $Content.Count; $i++) {
        $Issues = Test-LineCoherence $Content[$i]
        if ($Issues) {
            $FileViolations += [PSCustomObject]@{
                Line = $i+1;
                Text = $Content[$i].Trim();
                Rules = ($Issues -join ", ")
            }
        }
    }

    if ($FileViolations) {
        $Script:TotalViolations += $FileViolations.Count
        &$OutputAction "`nFile: $FilePath" "Yellow"
        foreach ($v in $FileViolations) {
            &$OutputAction "  Line $($v.Line) [$($v.Rules)]: $($v.Text)" "White"
        }
    }
    Get-Imports $FilePath | ForEach-Object { Audit-File -FilePath $_ -OutputAction $OutputAction }
}

Export-ModuleMember -Function Audit-File