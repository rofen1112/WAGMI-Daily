param(
  [int]$Port = 43127
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$taskName = 'ark.insight Local Health Watchdog'
$watchdogScript = Join-Path $PSScriptRoot 'local-watchdog.mjs'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$healthUrl = "http://127.0.0.1:$Port/health"
$liveUrl = "http://127.0.0.1:$Port/live"

function Test-LocalPort([int]$TargetPort) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync('127.0.0.1', $TargetPort)
    if (-not $task.Wait(500)) { return $false }
    return $client.Connected
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Read-Watchdog([string]$Url) {
  try {
    return Invoke-RestMethod -Uri $Url -TimeoutSec 5
  } catch {
    return $null
  }
}

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    if (-not (Test-LocalPort $Port)) { break }
    Start-Sleep -Milliseconds 500
  }
}

if (Test-LocalPort $Port) {
  $existingService = Read-Watchdog $liveUrl
  $owner = if ($existingService.service -eq 'ark.insight-local-watchdog') { 'another watchdog process' } else { 'another process' }
  throw "Port $Port is still occupied by $owner. Stop it or choose another watchdog port."
}

$action = New-ScheduledTaskAction `
  -Execute $nodePath `
  -Argument "`"$watchdogScript`" --port $Port" `
  -WorkingDirectory $root
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal `
  -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
  -LogonType Interactive `
  -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1) `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description 'Starts ark.insight after Windows sign-in and keeps the local/public stack healthy in the background.' `
  -Force | Out-Null
Start-ScheduledTask -TaskName $taskName

$live = $null
for ($attempt = 0; $attempt -lt 60; $attempt++) {
  $live = Read-Watchdog $liveUrl
  if ($live.service -eq 'ark.insight-local-watchdog') { break }
  Start-Sleep -Milliseconds 500
}
if ($live.service -ne 'ark.insight-local-watchdog') {
  throw "The watchdog task was registered but port $Port did not start. Check .tmp-local-watchdog.log."
}

$health = $null
for ($attempt = 0; $attempt -lt 180; $attempt++) {
  $health = Read-Watchdog $healthUrl
  if ($health.status -eq 'healthy') { break }
  Start-Sleep -Seconds 1
}

Write-Host "Task:   $taskName"
Write-Host "Health: $healthUrl"
if ($health.status -ne 'healthy') {
  $live = Read-Watchdog $liveUrl
  $details = ($live.endpoints | Where-Object { -not $_.healthy } | ForEach-Object { $_.name }) -join ', '
  throw "The watchdog is running but the stack is not healthy. Unhealthy endpoints: $details"
}
$health | ConvertTo-Json -Depth 6
