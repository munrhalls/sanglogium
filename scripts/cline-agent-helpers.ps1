#Requires -Version 5.1
<#
  cline-agent-helpers.ps1
  Shared functions for the Cline agent resource-guard scripts.

  What it does
    - Detects Cline agent process trees spawned by DeepSync Flash / the Cline
      connector. Each agent is:  node.exe ...\cline\bin\cline  ->  cline.exe
      (and whatever subprocesses the agent has running).
    - Identifies the orchestrator "core" tree (the hub process) so it is never
      suspended or killed automatically.
    - Measures system memory pressure.
    - Suspends / resumes / kills process trees without admin rights.

  Usage
    . "$PSScriptRoot\cline-agent-helpers.ps1"
    $snap   = Get-ClineProcessSnapshot
    $trees  = Get-ClineTrees -Snapshot $snap -SelfTreePids (Get-SelfTreePids)
#>

# Native process suspend/resume (works without admin; state is preserved).
if (-not ('ClineProcessOps' -as [type])) {
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class ClineProcessOps {
    [DllImport("ntdll.dll")]
    public static extern int NtSuspendProcess(IntPtr processHandle);
    [DllImport("ntdll.dll")]
    public static extern int NtResumeProcess(IntPtr processHandle);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern IntPtr OpenProcess(uint access, bool inheritHandle, uint processId);
    [DllImport("kernel32.dll", SetLastError = true)]
    public static extern bool CloseHandle(IntPtr handle);
}
"@
}

# ---------------------------------------------------------------------------
# Snapshot
# ---------------------------------------------------------------------------
function Get-ClineProcessSnapshot {
    <#
      One CIM query returning every process with PID, parent, working set and
      command line, plus an IsCline flag used for agent classification.
    #>
    Get-CimInstance Win32_Process | ForEach-Object {
        [PSCustomObject]@{
            PID       = [int]$_.ProcessId
            ParentPID = [int]$_.ParentProcessId
            Name      = $_.Name
            RAMMB     = if ($_.WorkingSetSize) { [math]::Round($_.WorkingSetSize / 1MB, 1) } else { 0 }
            Command   = $_.CommandLine
            IsCline   = ($_.Name -eq 'cline.exe') -or
                        ($_.CommandLine -match 'cline[/\\]bin[/\\]cline') -or
                        ($_.CommandLine -match '@cline[/\\]cli-windows-x64')
        }
    }
}

function Get-SelfTreePids {
    <#
      PIDs of the current process and its ancestor chain. The guard scripts use
      this to make sure they never target their own process tree.
    #>
    $pids = @($PID)
    $cur = $PID
    for ($i = 0; $i -lt 24; $i++) {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId=$cur" -ErrorAction SilentlyContinue
        if (-not $p -or $p.ParentProcessId -le 0) { break }
        $cur = [int]$p.ParentProcessId
        if ($pids -contains $cur) { break }
        $pids += $cur
    }
    return $pids
}

# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------
function Get-ClineTrees {
    <#
      Classifies every cline-related process into process trees.

      Returns a list of:
        RootPID     - root process id of the tree
        PIDs        - every process id in the tree (root + descendants)
        TreeMB      - sum of working sets across the tree
        IsCore      - $true for the orchestrator hub tree (never auto-managed)
        Kind        - 'core' | 'agent'
        Suspended   - $false initially; guard tracks this per session
        SuspendedAt - timestamp when the guard suspended it

      SelfTreePids: PIDs that must never become management targets.
    #>
    param(
        [Parameter(Mandatory = $true)] $Snapshot,
        [int[]] $SelfTreePids = @()
    )

    $byPid = @{}
    $childrenOf = @{}
    foreach ($p in $Snapshot) {
        $byPid[$p.PID] = $p
        if ($p.ParentPID -gt 0) {
            if (-not $childrenOf.ContainsKey($p.ParentPID)) { $childrenOf[$p.ParentPID] = @() }
            $childrenOf[$p.ParentPID] = $childrenOf[$p.ParentPID] + @($p.PID)
        }
    }

    function Get-TreePids([int]$rootPid) {
        $result = @($rootPid)
        if ($childrenOf.ContainsKey($rootPid)) {
            foreach ($c in $childrenOf[$rootPid]) {
                $result = $result + (Get-TreePids $c)
            }
        }
        return $result
    }

    $sumMB = {
        param($pidList)
        $total = 0.0
        foreach ($id in $pidList) {
            if ($byPid.ContainsKey($id)) { $total += $byPid[$id].RAMMB }
        }
        return [math]::Round($total, 1)
    }

    $trees = @()
    $seen = @{}

    # --- core tree: the hub (cline.exe entry.js ... --pathname /hub) plus its
    #     cline-related ancestors (the DeepSync Flash connector CLI + node parent)
    $hub = $Snapshot | Where-Object { $_.Name -eq 'cline.exe' -and $_.Command -match '--pathname\s+/hub' } | Select-Object -First 1
    $corePids = @{}
    if ($hub) {
        $cur = [int]$hub.PID
        while ($cur -gt 0 -and $byPid.ContainsKey($cur)) {
            $p = $byPid[$cur]
            if ($p.IsCline) {
                $corePids[$cur] = $true
                $cur = [int]$p.ParentPID
            } else {
                break
            }
        }
        $coreList = @($corePids.Keys)
        $trees += [PSCustomObject]@{
            RootPID     = $hub.PID
            PIDs        = $coreList
            TreeMB      = & $sumMB $coreList
            IsCore      = $true
            Kind        = 'core'
            Suspended   = $false
            SuspendedAt = $null
        }
        foreach ($cp in $corePids.Keys) { $seen[$cp] = $true }
    }

    # --- agent trees
    foreach ($p in ($Snapshot | Where-Object { $_.IsCline })) {
        if ($seen.ContainsKey($p.PID)) { continue }
        if ($SelfTreePids -contains $p.PID) { continue }

        # Walk up to the highest cline-related ancestor so the tree is rooted at
        # the node.exe launcher when one exists.
        $root = $p.PID
        $cur  = $p
        while ($true) {
            $par = $null
            if ($cur.ParentPID -gt 0 -and $byPid.ContainsKey($cur.ParentPID)) { $par = $byPid[$cur.ParentPID] }
            if (-not $par) { break }
            if ($par.IsCline -and -not $seen.ContainsKey($par.PID) -and -not ($SelfTreePids -contains $par.PID)) {
                $cur  = $par
                $root = $par.PID
            } else {
                break
            }
        }
        if ($seen.ContainsKey($root)) { continue }

        $pids = Get-TreePids $root
        foreach ($id in $pids) { $seen[$id] = $true }

        $trees += [PSCustomObject]@{
            RootPID     = $root
            PIDs        = $pids
            TreeMB      = & $sumMB $pids
            IsCore      = $false
            Kind        = 'agent'
            Suspended   = $false
            SuspendedAt = $null
        }
    }

    return $trees
}

# ---------------------------------------------------------------------------
# System memory
# ---------------------------------------------------------------------------
function Get-MemoryStatus {
    <#
      TotalMB / AvailMB / UsedPct for the physical machine.
      Uses performance counters (fast) with a CIM fallback.
    #>
    $totalMB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
    $availMB = $null
    try {
        $c = Get-Counter -Counter '\Memory\Available MBytes' -ErrorAction Stop
        $availMB = [math]::Round($c.CounterSamples[0].CookedValue)
    } catch {
        $os = Get-CimInstance Win32_OperatingSystem
        $availMB = [math]::Round($os.FreePhysicalMemory / 1024)
    }
    if (-not $availMB -or $availMB -lt 0) { $availMB = 0 }
    return [PSCustomObject]@{
        TotalMB = $totalMB
        AvailMB = $availMB
        UsedMB  = ($totalMB - $availMB)
        UsedPct = [math]::Round((1 - $availMB / $totalMB) * 100, 1)
    }
}

# ---------------------------------------------------------------------------
# Tree operations
# ---------------------------------------------------------------------------
function Invoke-SuspendTree {
    <#
      Suspends every process in the tree. Work state is preserved in memory;
      CPU drops to ~0 and the OS will trim the working set under pressure.
    #>
    param(
        [Parameter(Mandatory = $true)] $Tree,
        [string] $Reason = ''
    )
    foreach ($id in $Tree.PIDs) {
        # PROCESS_ALL_ACCESS: on recent Windows builds NtSuspendProcess returns
        # ACCESS_DENIED when the handle was opened with only PROCESS_SUSPEND_RESUME.
        $h = [ClineProcessOps]::OpenProcess(0x001FFFFF, $false, [uint32]$id)
        if ($h -ne [IntPtr]::Zero) {
            [ClineProcessOps]::NtSuspendProcess($h) | Out-Null
            [ClineProcessOps]::CloseHandle($h) | Out-Null
        }
    }
    $Tree.Suspended   = $true
    $Tree.SuspendedAt = Get-Date
    Write-Host ("[suspend] tree root {0} ({1} MB) - {2}" -f $Tree.RootPID, $Tree.TreeMB, $Reason)
}

function Invoke-ResumeTree {
    <#
      Resumes every process in the tree (reverse of suspend).
    #>
    param(
        [Parameter(Mandatory = $true)] $Tree,
        [string] $Reason = ''
    )
    foreach ($id in $Tree.PIDs) {
        $h = [ClineProcessOps]::OpenProcess(0x001FFFFF, $false, [uint32]$id)
        if ($h -ne [IntPtr]::Zero) {
            [ClineProcessOps]::NtResumeProcess($h) | Out-Null
            [ClineProcessOps]::CloseHandle($h) | Out-Null
        }
    }
    $Tree.Suspended   = $false
    $Tree.SuspendedAt = $null
    Write-Host ("[resume] tree root {0} ({1} MB) - {2}" -f $Tree.RootPID, $Tree.TreeMB, $Reason)
}

function Invoke-KillTree {
    <#
      Force-kills every process in the tree, children first. The work running
      inside that agent is lost, but agents commit frequently so the cost is
      bounded to the in-flight step.
    #>
    param(
        [Parameter(Mandatory = $true)] $Tree,
        [string] $Reason = ''
    )
    $order = @($Tree.PIDs)
    [array]::Reverse($order)  # deepest first, root last
    foreach ($id in $order) {
        Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
    }
    $Tree.Suspended = $false
    Write-Host ("[kill] tree root {0} ({1} MB) - {2}" -f $Tree.RootPID, $Tree.TreeMB, $Reason)
}

# ---------------------------------------------------------------------------
# Formatting
# ---------------------------------------------------------------------------
function Format-AgentTable {
    param($Trees)
    $i = 0
    $rows = foreach ($t in ($Trees | Sort-Object TreeMB -Descending)) {
        $i++
        [PSCustomObject]@{
            '#'     = $i
            RootPID = $t.RootPID
            Procs   = $t.PIDs.Count
            RAM_MB  = $t.TreeMB
            State   = if ($t.Suspended) { 'SUSPENDED' } else { 'running' }
            Kind    = $t.Kind
        }
    }
    $rows | Format-Table -AutoSize | Out-String -Width 120
}
