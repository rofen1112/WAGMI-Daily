$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root '.env.dingtalk.local'
$publicCheckScript = Join-Path $PSScriptRoot 'check-public-url.mjs'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source

function Get-EndpointStatus([string]$Name, [string]$Url) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5
    [PSCustomObject]@{ Name = $Name; Status = 'online'; Http = $response.StatusCode; Url = $Url }
  } catch {
    $httpStatus = if ($_.Exception.Response) { [int]$_.Exception.Response.StatusCode } else { '-' }
    $endpointState = if ($Name -eq 'Watchdog' -and $httpStatus -eq 503) { 'degraded' } else { 'offline' }
    [PSCustomObject]@{ Name = $Name; Status = $endpointState; Http = $httpStatus; Url = $Url }
  }
}

function Get-ConfiguredPublicUrl {
  if (-not (Test-Path -LiteralPath $envPath)) { return $null }
  $content = [System.IO.File]::ReadAllText($envPath)
  $match = [regex]::Match($content, '(?m)^WAGMI_PUBLIC_URL=(.+)$')
  if ($match.Success) { return $match.Groups[1].Value.Trim() }
  return $null
}

function Get-PublicTunnelStatus([string]$Url) {
  if (-not $Url) {
    return [PSCustomObject]@{ Name = 'Public tunnel'; Status = 'offline'; Http = '-'; Url = '-' }
  }
  & $nodePath $publicCheckScript $Url '--health'
  $status = if ($LASTEXITCODE -eq 0) { 'online' } else { 'offline' }
  $http = if ($LASTEXITCODE -eq 0) { 200 } else { '-' }
  return [PSCustomObject]@{ Name = 'Public tunnel'; Status = $status; Http = $http; Url = $Url }
}

$publicUrl = Get-ConfiguredPublicUrl

$checks = @(
  Get-EndpointStatus 'Watchdog' 'http://127.0.0.1:43127/health'
  Get-EndpointStatus 'Admin' 'http://127.0.0.1:5174/'
  Get-EndpointStatus 'Public' 'http://127.0.0.1:8080/'
  Get-EndpointStatus 'Main data' 'http://127.0.0.1:8080/data/main/index.json'
  Get-PublicTunnelStatus $publicUrl
)

$checks | Format-Table -AutoSize
if ($checks.Status -contains 'offline' -or $checks.Status -contains 'degraded') { exit 1 }
