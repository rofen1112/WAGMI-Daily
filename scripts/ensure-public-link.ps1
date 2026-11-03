$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $root '.tmp-cloudflared-public.log'
$envPath = Join-Path $root '.env.dingtalk.local'
$workerScript = Join-Path $PSScriptRoot 'cloudflare-tunnel-worker.ps1'
$checkScript = Join-Path $PSScriptRoot 'check-public-url.mjs'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$taskName = 'WAGMI Daily Public Tunnel'

function Test-PublicUrl([string]$Url, [int]$Attempts = 1, [int]$RequiredSuccesses = 1) {
  if (-not $Url) { return $false }
  if ($Url -notmatch '^https://') { return $false }
  try {
    $hostName = ([System.Uri]$Url).DnsSafeHost
    if ($hostName -in @('localhost', '127.0.0.1', '::1')) { return $false }
  } catch {
    return $false
  }
  $consecutiveSuccesses = 0
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    & $nodePath $checkScript ($Url.TrimEnd('/') + '/') '--health'
    if ($LASTEXITCODE -eq 0) {
      $consecutiveSuccesses += 1
      if ($consecutiveSuccesses -ge $RequiredSuccesses) { return $true }
    } else {
      $consecutiveSuccesses = 0
    }
    if ($attempt -lt $Attempts) { Start-Sleep -Seconds 2 }
  }
  return $false
}

function Test-LocalPublicOrigin {
  & $nodePath $checkScript 'http://127.0.0.1:8080/' '--health'
  return $LASTEXITCODE -eq 0
}

function Read-ConfiguredUrl {
  if (-not (Test-Path -LiteralPath $envPath)) { return $null }
  $content = [System.IO.File]::ReadAllText($envPath)
  $match = [regex]::Match($content, '(?m)^WAGMI_PUBLIC_URL=(.+)$')
  if ($match.Success) { return $match.Groups[1].Value.Trim() }
  return $null
}

function Write-ConfiguredUrl([string]$Url) {
  $content = if (Test-Path -LiteralPath $envPath) { [System.IO.File]::ReadAllText($envPath) } else { '' }
  if ([regex]::IsMatch($content, '(?m)^WAGMI_PUBLIC_URL=.*$')) {
    $content = [regex]::Replace($content, '(?m)^WAGMI_PUBLIC_URL=.*$', "WAGMI_PUBLIC_URL=$Url")
  } else {
    if ($content.Length -gt 0 -and -not $content.EndsWith("`n")) { $content += "`r`n" }
    $content += "WAGMI_PUBLIC_URL=$Url`r`n"
  }
  [System.IO.File]::WriteAllText($envPath, $content, [System.Text.UTF8Encoding]::new($false))
}

$configuredUrl = Read-ConfiguredUrl
if (Test-PublicUrl $configuredUrl 3 2) {
  Write-Host "Public: $configuredUrl"
  exit 0
}

if ($configuredUrl -and $configuredUrl -notmatch '^https://[a-z0-9-]+\.trycloudflare\.com/?$') {
  throw "Configured fixed public URL is unreachable; refusing to replace it with a temporary tunnel: $configuredUrl"
}

if (Test-Path -LiteralPath $logPath) {
  $existingLog = [System.IO.File]::ReadAllText($logPath)
  $existingMatch = [regex]::Match($existingLog, 'https://[a-z0-9-]+\.trycloudflare\.com')
  if ($existingMatch.Success -and (Test-PublicUrl $existingMatch.Value 3 2)) {
    Write-ConfiguredUrl $existingMatch.Value
    Write-Host "Public: $($existingMatch.Value)"
    exit 0
  }
}

if (-not (Test-LocalPublicOrigin)) {
  throw 'Local public origin http://127.0.0.1:8080/ is unhealthy. Run npm.cmd run start:local to rebuild and restart the public site before creating the external link.'
}

if (-not (Get-Command cloudflared.exe -ErrorAction SilentlyContinue)) {
  throw 'cloudflared.exe is required to create the public report link.'
}
$cloudflaredPath = (Get-Command cloudflared.exe -ErrorAction Stop).Source
$powershell = Join-Path $PSHOME 'powershell.exe'
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask -and $existingTask.State -eq 'Running') {
  Stop-ScheduledTask -TaskName $taskName
  Start-Sleep -Seconds 2
}
Remove-Item -LiteralPath $logPath -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath (Join-Path $root '.tmp-cloudflared-public.pid') -Force -ErrorAction SilentlyContinue
$action = New-ScheduledTaskAction `
  -Execute $powershell `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$workerScript`" -CloudflaredPath `"$cloudflaredPath`"" `
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
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal `
  -Settings $settings `
  -Description 'Keeps the WAGMI public visitor site available through Cloudflare Tunnel.' `
  -Force | Out-Null
Start-ScheduledTask -TaskName $taskName

$publicUrl = $null
for ($attempt = 0; $attempt -lt 90; $attempt++) {
  if (Test-Path -LiteralPath $logPath) {
    $content = [System.IO.File]::ReadAllText($logPath)
    $match = [regex]::Match($content, 'https://[a-z0-9-]+\.trycloudflare\.com')
    if ($match.Success) {
      $candidate = $match.Value
      if (Test-PublicUrl $candidate 3 2) {
        $publicUrl = $candidate
        break
      }
    }
  }
  Start-Sleep -Seconds 1
}

if (-not $publicUrl) {
  $details = if (Test-Path -LiteralPath $logPath) {
    [System.IO.File]::ReadAllText($logPath)
  } else {
    'No tunnel log was created.'
  }
  throw "Unable to create a reachable public link.`n$details"
}

Write-ConfiguredUrl $publicUrl
Write-Host "Public: $publicUrl"
