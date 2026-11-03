[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$Root,
  [string]$TunnelId,
  [string]$ConfigPath,
  [string]$CredentialsPath,
  [string]$CloudflaredPath,
  [ValidateRange(1024, 65535)][int]$MetricsPort = 20246
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
. (Join-Path $PSScriptRoot 'public-tunnel-task-common.ps1')
$spec = Get-TunnelTaskSpec $Root $TunnelId $ConfigPath $CredentialsPath $CloudflaredPath $MetricsPort -AllowMissingArtifacts
$tasks = @(Get-ScheduledTask -TaskPath $spec.TaskPath | Where-Object { $_.TaskName -eq $spec.TaskName })
if (-not $tasks.Count) { Write-Host 'The named public tunnel task is not installed.'; return }
Assert-TunnelTaskOwnership $tasks[0] $spec
if (-not $PSCmdlet.ShouldProcess($spec.TaskName, 'Stop and unregister only the named public tunnel startup task')) { return }
$administrator = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $administrator.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Use an elevated PowerShell window to uninstall the tunnel task.' }
Stop-ScheduledTask -TaskName $spec.TaskName -TaskPath $spec.TaskPath
Unregister-ScheduledTask -TaskName $spec.TaskName -TaskPath $spec.TaskPath -Confirm:$false
Write-Host 'Removed only the local named tunnel task. Config, credentials, ACLs, Cloudflare tunnel, DNS, and other services were retained.'
