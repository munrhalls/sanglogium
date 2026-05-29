Get-ChildItem 'C:\Users\janpi\AppData\Local' -Directory | ForEach-Object {
    $s = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    if ($s -gt 500MB) {
        "{0,8:N2} GB  {1}" -f ([math]::Round($s/1GB,2)), $_.Name
    }
} | Sort-Object
