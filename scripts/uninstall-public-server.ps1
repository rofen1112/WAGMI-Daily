[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$Root
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
$taskName = 'ark.insight Public Static Server'
$taskPath = '\'
$Root = (Get-Item -LiteralPath $Root).FullName.TrimEnd('\')
$serverScript = Join-Path $Root 'scripts/serve-public-dist.mjs'
$description = "wagmi-public-server/v1; root=$Root; serves dist/client only"

Import-Module ScheduledTasks
$tasks = @(Get-ScheduledTask -TaskPath $taskPath | Where-Object { $_.TaskName -eq $taskName })
if ($tasks.Count -eq 0) {
  Write-Host "Task is not installed: $taskName"
  return
}
$task = $tasks[0]
$actions = @($task.Actions)
if ($task.Description -ne $description -or $actions.Count -ne 1 -or
    [System.IO.Path]::GetFileName($actions[0].Execute) -ine 'node.exe' -or
    $actions[0].WorkingDirectory -ine $Root -or
    $actions[0].Arguments -ne "`"$serverScript`" --host 0.0.0.0 --port 8080") {
  throw "Refusing to stop or delete an unrecognized task using this name: $taskName"
}
if (-not $PSCmdlet.ShouldProcess($taskName, 'Stop and unregister only the public static server task')) { return }
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
$administrator = [System.Security.Principal.WindowsPrincipal]::new($identity)
if (-not $administrator.IsInRole([System.Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Run uninstallation from an elevated PowerShell window.'
}

Stop-ScheduledTask -TaskName $taskName -TaskPath $taskPath
Unregister-ScheduledTask -TaskName $taskName -TaskPath $taskPath -Confirm:$false
Write-Host "Removed task: $taskName. No project files, credentials, firewall rules, or other tasks were removed."
