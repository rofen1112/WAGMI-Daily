param(
  [switch]$SkipBuild,
  [switch]$LocalOnly
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$publicCheckScript = Join-Path $PSScriptRoot 'check-public-url.mjs'
$publicPidPath = Join-Path $root '.tmp-vite-public.pid'

function Test-LocalPort([int]$Port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync('127.0.0.1', $Port)
    if (-not $task.Wait(750)) { return $false }
    return $client.Connected
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Test-PublicPreview {
  & $nodePath $publicCheckScript 'http://127.0.0.1:8080/' --attempts=1
  return $LASTEXITCODE -eq 0
}

function Get-PublicServerTask {
  $taskName = 'ark.insight Public Static Server'
  # Fail closed if task ownership cannot be checked. Never bypass a managed
  # service by launching an interactive process into its port.
  $tasks = @(Get-ScheduledTask -TaskPath '\' -ErrorAction Stop | Where-Object { $_.TaskName -eq $taskName })
  if ($tasks.Count -eq 0) { return $null }
  $task = $tasks[0]
  $actions = @($task.Actions)
  $serverScript = Join-Path $root 'scripts/serve-public-dist.mjs'
  $description = "wagmi-public-server/v1; root=$root; serves dist/client only"
  if ($task.Description -cne $description -or $actions.Count -ne 1 -or
      $actions[0].Execute -ine $nodePath -or
      $actions[0].WorkingDirectory -ine $root -or
      $actions[0].Arguments -cne "`"$serverScript`" --host 0.0.0.0 --port 8080") {
    throw "Unrecognized scheduled task '$taskName'. Refusing to launch or replace the public server."
  }
  return $task
}

if (-not $SkipBuild) {
  & npm.cmd run build:public
  if ($LASTEXITCODE -ne 0) { throw 'Public build failed.' }
}

if (-not (Test-LocalPort 5174)) {
  Start-Process -FilePath $env:ComSpec -ArgumentList '/d', '/c', 'npm.cmd run dev:admin >> .tmp-vite-admin.log 2>&1' -WorkingDirectory $root -WindowStyle Hidden
}

if (-not (Test-PublicPreview)) {
  $publicTask = Get-PublicServerTask
  if ($publicTask) {
    if ($publicTask.State -eq 'Disabled') { throw 'The public server task is disabled. Enable it explicitly before requesting recovery.' }
    if ($publicTask.State -ne 'Running') {
      Start-ScheduledTask -TaskName $publicTask.TaskName -TaskPath $publicTask.TaskPath -ErrorAction Stop
    }
    Write-Host 'Waiting for the managed public server task. No interactive replacement will be started.'
  } else {
    if (Test-LocalPort 8080) {
      throw 'Port 8080 is occupied but public verification failed. No process was stopped. Verify the listener before restarting it.'
    }
    # Old PID files can be stale or refer to a reused PID. They are never used
    # to terminate a process; unmanaged preview startup requires a free port.
    $publicProcess = Start-Process -FilePath $env:ComSpec -ArgumentList '/d', '/c', 'npm.cmd run preview:public >> .tmp-vite-public.log 2>&1' -WorkingDirectory $root -WindowStyle Hidden -PassThru
    [System.IO.File]::WriteAllText($publicPidPath, "$($publicProcess.Id)`r`n", [System.Text.UTF8Encoding]::new($false))
  }
}

for ($attempt = 0; $attempt -lt 20; $attempt++) {
  if (Test-LocalPort 5174) { break }
  Start-Sleep -Milliseconds 250
}
if (-not (Test-LocalPort 5174)) { throw 'Port 5174 did not become ready.' }

$publicReadyDeadline = (Get-Date).AddSeconds(60)
for ($attempt = 0; $attempt -lt 40 -and (Get-Date) -lt $publicReadyDeadline; $attempt++) {
  if (Test-PublicPreview) { break }
  Start-Sleep -Milliseconds 250
}
if (-not (Test-PublicPreview)) { throw 'Public preview at http://127.0.0.1:8080/ did not become healthy.' }

$publicationMode = $env:WAGMI_PUBLICATION_MODE
$publicationConfig = Join-Path $root '.env.publication.local'
if (-not $publicationMode -and (Test-Path -LiteralPath $publicationConfig)) {
  $modeMatch = [regex]::Match([System.IO.File]::ReadAllText($publicationConfig), '(?m)^WAGMI_PUBLICATION_MODE=(.+)$')
  if ($modeMatch.Success) { $publicationMode = $modeMatch.Groups[1].Value.Trim() }
}
if (-not $LocalOnly -and $publicationMode -ne 'local') {
  $publicLinkScript = Join-Path $PSScriptRoot 'ensure-public-link.ps1'
  & $publicLinkScript
  if ($LASTEXITCODE -ne 0) { throw 'Public link startup failed.' }
} else {
  Write-Host 'Local hosting is ready. Public domain/tunnel readiness is verified separately.'
}

Write-Host 'Admin:  http://127.0.0.1:5174/'
Write-Host 'Public: http://127.0.0.1:8080/'
