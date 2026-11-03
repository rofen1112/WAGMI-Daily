[CmdletBinding(SupportsShouldProcess)]
param(
  [string]$Root,
  [string]$TunnelId,
  [string]$ConfigPath,
  [string]$CredentialsPath,
  [string]$CloudflaredPath,
  [ValidateRange(1024, 65535)][int]$MetricsPort = 20246,
  [switch]$SetLocalPermissions,
  [switch]$StartNow,
  [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
. (Join-Path $PSScriptRoot 'public-tunnel-task-common.ps1')
$spec = Get-TunnelTaskSpec $Root $TunnelId $ConfigPath $CredentialsPath $CloudflaredPath $MetricsPort

function Get-SimpleConfigScalar([string]$Text, [string]$Key) {
  $matches = [regex]::Matches($Text, "(?m)^$([regex]::Escape($Key)):[ \t]*(.*?)\r?$")
  if ($matches.Count -ne 1) { throw "Expected exactly one top-level '$Key' in the tunnel YAML config." }
  $value = $matches[0].Groups[1].Value.Trim()
  if ($value.StartsWith("'") -and $value.EndsWith("'")) { return $value.Substring(1, $value.Length - 2).Replace("''", "'") }
  if ($value.StartsWith('"') -and $value.EndsWith('"')) {
    try { return ($value | ConvertFrom-Json) } catch { throw "Use a plain or single-quoted value for '$Key' in tunnel YAML." }
  }
  if (-not $value -or $value -match '^[&*!|>{\[]' -or $value.Contains('#')) { throw "Use a simple scalar value for '$Key' in tunnel YAML." }
  return $value
}

$configText = [IO.File]::ReadAllText($spec.ConfigPath)
if ($configText -match '(?m)^\s*(token|token-file|credentials-contents|origincert)\s*:') { throw 'Use only a single-tunnel credentials file; account certificates and inline tokens are not accepted in this config.' }
if ((Get-SimpleConfigScalar $configText 'tunnel') -ine $spec.TunnelId) { throw 'Config tunnel UUID does not match -TunnelId.' }
if ((Get-SimpleConfigScalar $configText 'credentials-file') -ine $spec.CredentialsPath) { throw 'Config credentials-file must equal the explicit absolute credentials path.' }
$services = [regex]::Matches($configText, '(?m)^\s*(?:-\s*)?service:\s*([^\r\n]+)')
if ($services.Count -lt 2) { throw 'Use explicit public-site ingress rules followed by an http_status:404 catch-all.' }
foreach ($service in $services) {
  $value = $service.Groups[1].Value.Trim().Trim('"', "'")
  if ($value -notin @('http://127.0.0.1:8080', 'http_status:404')) { throw 'This public tunnel may route only to http://127.0.0.1:8080 and the 404 catch-all.' }
}
try {
  $credentials = [IO.File]::ReadAllText($spec.CredentialsPath) | ConvertFrom-Json
  if ($credentials.TunnelID -ine $spec.TunnelId -or -not $credentials.AccountTag -or -not $credentials.TunnelSecret) { throw 'invalid' }
} catch { throw 'The tunnel JSON credentials are invalid or do not match -TunnelId. Credential contents were not printed.' }
$credentials = $null

# This validates YAML and ingress locally; it does not create/authenticate/run a tunnel.
$savedPreference = $ErrorActionPreference
try {
  $ErrorActionPreference = 'Continue'
  $validationOutput = & $spec.CloudflaredPath tunnel --config $spec.ConfigPath ingress validate 2>&1
  $validationExit = $LASTEXITCODE
} finally { $ErrorActionPreference = $savedPreference }
if ($validationExit -ne 0) { throw 'cloudflared rejected the local ingress configuration. Review the YAML; output is suppressed to avoid exposing configuration values.' }
$validationOutput = $null

$read = [Security.AccessControl.FileSystemRights]::Read
$readExecute = [Security.AccessControl.FileSystemRights]::ReadAndExecute
if (-not $SetLocalPermissions -or $ValidateOnly) {
  Assert-TunnelReadAccess $spec.StateRoot $readExecute -Private
  Assert-TunnelReadAccess $spec.ConfigPath $read -Private
  Assert-TunnelReadAccess $spec.CredentialsPath $read -Private
  Assert-TunnelReadAccess $spec.CloudflaredPath $readExecute
}
Write-Host "Task: $($spec.TaskName)"
Write-Host "Tunnel UUID: $($spec.TunnelId)"
Write-Host 'Account: NT AUTHORITY\LocalService. Runtime uses the single-tunnel JSON file; no secret is placed on the command line.'
if ($ValidateOnly) { Write-Host 'Local config, credentials structure, ingress, and ACL checks passed. No changes were made.'; return }
if (-not $PSCmdlet.ShouldProcess($spec.TaskName, 'Register/update the named tunnel startup task (and restrict .local-server ACLs if requested)')) { return }
$administrator = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $administrator.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) { throw 'Use an elevated PowerShell window to install the tunnel task or change its local ACLs.' }

$existing = @(Get-ScheduledTask -TaskPath $spec.TaskPath | Where-Object { $_.TaskName -eq $spec.TaskName })
if ($existing.Count) { Assert-TunnelTaskOwnership $existing[0] $spec }
if ($SetLocalPermissions) { Set-TunnelLocalPermissions $spec }
Assert-TunnelReadAccess $spec.StateRoot $readExecute -Private
Assert-TunnelReadAccess $spec.ConfigPath $read -Private
Assert-TunnelReadAccess $spec.CredentialsPath $read -Private
Assert-TunnelReadAccess $spec.CloudflaredPath $readExecute

$action = New-ScheduledTaskAction -Execute $spec.CloudflaredPath -Argument $spec.Arguments -WorkingDirectory $spec.StateRoot
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId 'S-1-5-19' -LogonType ServiceAccount
$settings = New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $spec.TaskName -TaskPath $spec.TaskPath -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description $spec.Description -Force | Out-Null
Write-Host 'Registered. No existing tunnel, Windows service, process, or DNS record was stopped or changed.'
if (-not $StartNow) { Write-Host 'The task will start at the next Windows startup. Use -StartNow for an immediate start.'; return }
Start-ScheduledTask -TaskName $spec.TaskName -TaskPath $spec.TaskPath
Write-Host "Start requested. Verify http://127.0.0.1:$MetricsPort/ready and the public HTTPS hostname; task registration alone does not confirm public availability."
