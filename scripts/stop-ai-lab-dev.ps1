# Only stop the exact two service processes recorded by this checkout.
# Project data, uploads, SQLite, baselines, logs and PID records are retained.
$ErrorActionPreference = 'Stop'
$labRoot = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$runtime = Join-Path $labRoot '.local-ai-lab/runtime'

# Parse the actual Windows process command line as argv; never execute its text.
if (-not ('AiLabProcessArguments' -as [type])) {
    Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public static class AiLabProcessArguments {
    [DllImport("shell32.dll", SetLastError = true)]
    private static extern IntPtr CommandLineToArgvW([MarshalAs(UnmanagedType.LPWStr)] string command, out int count);
    [DllImport("kernel32.dll")]
    private static extern IntPtr LocalFree(IntPtr memory);
    public static string[] Parse(string command) {
        int count;
        IntPtr memory = CommandLineToArgvW(command, out count);
        if (memory == IntPtr.Zero) throw new InvalidOperationException("Cannot parse process command line.");
        try {
            string[] result = new string[count];
            for (int index = 0; index < count; index++)
                result[index] = Marshal.PtrToStringUni(Marshal.ReadIntPtr(memory, index * IntPtr.Size));
            return result;
        } finally { LocalFree(memory); }
    }
}
"@
}

function Get-LabServiceDefinitions {
    param([string]$Root, [string]$Runtime)
    $pythonExecutable = (Get-Command python -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
    $nodeExecutable = (Get-Command node -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
    @(
        [pscustomobject]@{
            Name = 'api'; Port = 8786; Executable = $pythonExecutable
            Arguments = @('-m', 'server', '--root', $Root, '--port', '8786')
            PidFile = Join-Path $Runtime 'api.pid'
        },
        [pscustomobject]@{
            Name = 'frontend'; Port = 5186; Executable = $nodeExecutable
            Arguments = @((Join-Path $Root 'node_modules/vite/bin/vite.js'), '--config', (Join-Path $Root 'vite.ai-lab.config.ts'), '--mode', 'lab', '--host', '127.0.0.1', '--port', '5186', '--strictPort')
            PidFile = Join-Path $Runtime 'frontend.pid'
        }
    )
}

function Get-LabTrackedProcess {
    param($Definition)
    if (-not (Test-Path -LiteralPath $Definition.PidFile -PathType Leaf)) { return $null }
    $record = (Get-Content -LiteralPath $Definition.PidFile -Raw -ErrorAction Stop).Trim()
    $serviceProcessId = 0
    if (-not [int]::TryParse($record, [ref]$serviceProcessId) -or $serviceProcessId -le 0) {
        throw "Invalid $($Definition.Name) PID record. No process was changed."
    }
    $actual = Get-CimInstance -ClassName Win32_Process -Filter "ProcessId=$serviceProcessId" -ErrorAction Stop
    if ($null -eq $actual) { return $null } # A stale record alone is not ownership.
    [pscustomobject]@{ Id = $serviceProcessId; Process = $actual }
}

function Get-LabPortListeners {
    param([int]$Port)
    # Query failure must fail closed, rather than treating an inaccessible port as free.
    Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object { $_.LocalPort -eq $Port }
}

function Assert-LabProcessSignature {
    param($Definition, $Tracked)
    if ($null -eq $Tracked -or [string]::IsNullOrWhiteSpace($Tracked.Process.CommandLine) -or [string]::IsNullOrWhiteSpace($Tracked.Process.ExecutablePath)) {
        throw "Cannot establish $($Definition.Name) process ownership. No process was changed."
    }
    $expectedExecutable = [IO.Path]::GetFullPath($Definition.Executable)
    $actualExecutable = [IO.Path]::GetFullPath($Tracked.Process.ExecutablePath)
    if (-not [string]::Equals($actualExecutable, $expectedExecutable, [StringComparison]::OrdinalIgnoreCase)) {
        throw "$($Definition.Name) PID belongs to a different executable. No process was changed."
    }
    $actualArguments = [AiLabProcessArguments]::Parse($Tracked.Process.CommandLine)
    if ($actualArguments.Count -ne $Definition.Arguments.Count + 1 -or
        -not [string]::Equals([IO.Path]::GetFullPath($actualArguments[0]), $expectedExecutable, [StringComparison]::OrdinalIgnoreCase)) {
        throw "$($Definition.Name) command line does not match this checkout. No process was changed."
    }
    for ($index = 0; $index -lt $Definition.Arguments.Count; $index++) {
        $expected = [string]$Definition.Arguments[$index]
        $actualArgument = [string]$actualArguments[$index + 1]
        $comparison = if ([IO.Path]::IsPathRooted($expected)) { [StringComparison]::OrdinalIgnoreCase } else { [StringComparison]::Ordinal }
        if (-not [string]::Equals($actualArgument, $expected, $comparison)) {
            throw "$($Definition.Name) command line does not exactly match this checkout and expected arguments. No process was changed."
        }
    }
}

function Assert-LabListenerOwnership {
    param($Definition, $Tracked, [object[]]$Listeners)
    Assert-LabProcessSignature $Definition $Tracked
    if ($Listeners.Count -eq 0 -or @($Listeners | Where-Object { $_.OwningProcess -ne $Tracked.Id -or $_.LocalAddress -notin @('127.0.0.1', '::1') }).Count -gt 0) {
        throw "Port $($Definition.Port) is not exclusively owned by the recorded local $($Definition.Name) process. No process was changed."
    }
}

$definitions = @(Get-LabServiceDefinitions $labRoot $runtime)
$owned = @()
# Preflight everything before terminating anything. Stale/missing records plus
# a free port mean there is no owned running service, not permission to find one.
foreach ($definition in $definitions) {
    $tracked = Get-LabTrackedProcess $definition
    $listeners = @(Get-LabPortListeners $definition.Port)
    if ($null -eq $tracked -and $listeners.Count -eq 0) {
        Write-Output "No owned running $($definition.Name) service."
        continue
    }
    if ($null -eq $tracked) { throw "Port $($definition.Port) is occupied without ownership by this checkout. Nothing was stopped." }
    Assert-LabListenerOwnership $definition $tracked $listeners
    $owned += $definition
}
foreach ($definition in $owned) {
    # Recheck immediately before Stop-Process to guard stale/reused PID records.
    $tracked = Get-LabTrackedProcess $definition
    $listeners = @(Get-LabPortListeners $definition.Port)
    Assert-LabListenerOwnership $definition $tracked $listeners
    Stop-Process -Id $tracked.Id -ErrorAction Stop
    Write-Output "Stopped owned $($definition.Name) process $($tracked.Id) on port $($definition.Port)."
}
