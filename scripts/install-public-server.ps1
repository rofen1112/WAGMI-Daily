[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$Root,
  [string]$NodePath,
  [switch]$StartNow,
  [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
$taskName = 'ark.insight Public Static Server'
$taskPath = '\'
$port = 8080

function Resolve-LocalPath([string]$Path, [bool]$Directory) {
  $item = Get-Item -LiteralPath $Path -Force
  if ($item.PSProvider.Name -ne 'FileSystem' -or $item.PSIsContainer -ne $Directory) {
    throw "Expected a local $(if ($Directory) { 'directory' } else { 'file' }): $Path"
  }
  $drive = [System.IO.DriveInfo]::new([System.IO.Path]::GetPathRoot($item.FullName))
  if ($drive.DriveType -ne [System.IO.DriveType]::Fixed -or -not $drive.IsReady) {
    throw "Startup tasks require an available local fixed disk (not a mapped/user network drive): $Path"
  }
  if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "Use a real local path instead of a symbolic link or junction: $Path"
  }
  $ancestor = if ($Directory) { $item.Parent } else { $item.Directory }
  while ($ancestor) {
    if (($ancestor.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "Startup task paths must not pass through a symbolic link or junction: $($ancestor.FullName)"
    }
    $ancestor = $ancestor.Parent
  }
  return $item.FullName.TrimEnd('\')
}

function Assert-ServiceReadAccess([string]$Path, [System.Security.AccessControl.FileSystemRights]$Required) {
  $item = Get-Item -LiteralPath $Path -Force
  if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
    throw "Public server paths must not contain symbolic links or junctions: $Path"
  }
  # Known LocalService token identities. This is a conservative ACL preflight;
  # the actual scheduled-task startup remains the final effective-access check.
  $serviceSids = @('S-1-5-19', 'S-1-1-0', 'S-1-5-11', 'S-1-5-6', 'S-1-5-32-545')
  [long]$allowed = 0
  foreach ($rule in (Get-Acl -LiteralPath $Path).Access) {
    if (($rule.PropagationFlags -band [System.Security.AccessControl.PropagationFlags]::InheritOnly) -ne 0) { continue }
    try { $sid = $rule.IdentityReference.Translate([System.Security.Principal.SecurityIdentifier]).Value } catch { continue }
    if ($sid -notin $serviceSids) { continue }
    [long]$rights = $rule.FileSystemRights
    if ($rule.AccessControlType -eq 'Deny' -and ($rights -band [long]$Required) -ne 0) {
      throw "LocalService has a relevant deny rule at: $Path. No ACLs were changed."
    }
    if ($rule.AccessControlType -eq 'Allow') { $allowed = $allowed -bor $rights }
  }
  if (($allowed -band [long]$Required) -ne [long]$Required) {
    throw "Cannot confirm LocalService $Required access at: $Path. Grant only the necessary read/execute permissions after review; this script does not change ACLs."
  }
}

function Test-Port {
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $pending = $client.ConnectAsync('127.0.0.1', $port)
    return $pending.Wait(750) -and $client.Connected
  } catch { return $false } finally { $client.Dispose() }
}

function Assert-TaskOwnership($Task, [string]$Description, [string]$ScriptPath) {
  $actions = @($Task.Actions)
  if ($Task.Description -ne $Description -or $actions.Count -ne 1 -or
      [System.IO.Path]::GetFileName($actions[0].Execute) -ine 'node.exe' -or
      $actions[0].WorkingDirectory -ine $Root -or
      $actions[0].Arguments -ne "`"$ScriptPath`" --host 0.0.0.0 --port $port") {
    throw "The task name is already used by an unrecognized task. Refusing to change it: $taskName"
  }
}

$Root = Resolve-LocalPath $Root $true
if (-not $NodePath) { $NodePath = (Get-Command node.exe -ErrorAction Stop).Source }
$NodePath = Resolve-LocalPath $NodePath $false
if ([System.IO.Path]::GetFileName($NodePath) -ine 'node.exe') { throw 'NodePath must point to node.exe.' }
$serverScript = Resolve-LocalPath (Join-Path $Root 'scripts/serve-public-dist.mjs') $false
$buildRoot = Resolve-LocalPath (Join-Path $Root 'dist/client') $true
foreach ($requiredFile in @('index.html', 'data/main/index.json')) {
  if (-not (Test-Path -LiteralPath (Join-Path $buildRoot $requiredFile) -PathType Leaf)) {
    throw "Missing public build file: $requiredFile. Run npm.cmd run build:public first."
  }
}

$read = [System.Security.AccessControl.FileSystemRights]::Read
$readExecute = [System.Security.AccessControl.FileSystemRights]::ReadAndExecute
foreach ($directory in @($Root, (Split-Path -Parent $serverScript), (Split-Path -Parent $buildRoot), $buildRoot)) {
  Assert-ServiceReadAccess $directory $readExecute
}
Assert-ServiceReadAccess $NodePath $readExecute
Assert-ServiceReadAccess $serverScript $read
# Public build output is small enough to check every file; no private data or
# credentials need to be granted to the service account.
Get-ChildItem -LiteralPath $buildRoot -Recurse -Force | ForEach-Object {
  $required = if ($_.PSIsContainer) { $readExecute } else { $read }
  Assert-ServiceReadAccess $_.FullName $required
}

$description = "wagmi-public-server/v1; root=$Root; serves dist/client only"
Write-Host "Task:    $taskName"
Write-Host "Account: NT AUTHORITY\LocalService (no stored password)"
Write-Host "Root:    $Root"
Write-Host "Node:    $NodePath"
Write-Host "Public:  http://127.0.0.1:$port/ (also listens on the LAN)"
if ($ValidateOnly) {
  Write-Host 'Path and ACL preflight passed. No scheduled task or process was changed.'
  return
}
if (-not $PSCmdlet.ShouldProcess($taskName, 'Register/update the LocalService startup task for the public static website')) { return }

$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$administrator = [System.Security.Principal.WindowsPrincipal]::new($identity)
if (-not $administrator.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Run installation from an elevated PowerShell window. Use -ValidateOnly for a read-only preflight.'
}

Import-Module ScheduledTasks
$existing = @(Get-ScheduledTask -TaskPath $taskPath | Where-Object { $_.TaskName -eq $taskName })
if ($existing.Count -gt 0) { Assert-TaskOwnership $existing[0] $description $serverScript }
$action = New-ScheduledTaskAction -Execute $NodePath `
  -Argument "`"$serverScript`" --host 0.0.0.0 --port $port" -WorkingDirectory $Root
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'S-1-5-19' -LogonType ServiceAccount
$settings = New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) `
  -StartWhenAvailable -MultipleInstances IgnoreNew

Register-ScheduledTask -TaskPath $taskPath -TaskName $taskName -Action $action `
  -Trigger $trigger -Principal $principal -Settings $settings `
  -Description $description -Force | Out-Null
Write-Host 'Registered startup task. Existing processes and other tasks were left running.'

if (-not $StartNow) {
  Write-Host 'The task will start at the next Windows startup. Use -StartNow to start it now when port 8080 is free.'
  return
}

$registered = Get-ScheduledTask -TaskName $taskName -TaskPath $taskPath
if (Test-Port) {
  if ($registered.State -ne 'Running') {
    throw 'Task registered, but port 8080 is already in use. No process was stopped. Verify the existing listener before stopping it, then rerun with -StartNow.'
  }
} else {
  Start-ScheduledTask -TaskName $taskName -TaskPath $taskPath
}

$started = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  if (Test-Port) {
    $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $port)
    foreach ($listener in $listeners) {
      $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
      if ($process -and $process.CommandLine -and $process.ExecutablePath -ieq $NodePath -and
          $process.CommandLine.IndexOf($serverScript, [StringComparison]::OrdinalIgnoreCase) -ge 0) {
        $owner = Invoke-CimMethod -InputObject $process -MethodName GetOwnerSid
        if ($owner.ReturnValue -eq 0 -and $owner.Sid -eq 'S-1-5-19') { $started = $true; break }
      }
    }
    if ($started) { break }
  }
  Start-Sleep -Seconds 1
}
if (-not $started) {
  $info = Get-ScheduledTaskInfo -TaskName $taskName -TaskPath $taskPath
  throw "Task registered but its LocalService listener was not verified. LastTaskResult=$($info.LastTaskResult). Check Task Scheduler and read permissions; no unrelated process was stopped."
}
& $NodePath (Join-Path $Root 'scripts/check-public-url.mjs') "http://127.0.0.1:$port/" --attempts=1 --verbose
if ($LASTEXITCODE -ne 0) { throw 'The LocalService listener started, but the public site verification failed.' }
Write-Host 'Public site verified under LocalService. Startup task installation complete.'
