param([string]$CloudflaredPath)

$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $root '.tmp-cloudflared-public.log'
$pidPath = Join-Path $root '.tmp-cloudflared-public.pid'
$cloudflared = $CloudflaredPath
if (-not $cloudflared) {
  $wingetLink = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\cloudflared.exe'
  $cloudflared = if (Test-Path -LiteralPath $wingetLink) {
    $wingetLink
  } else {
    (Get-Command cloudflared.exe -ErrorAction Stop).Source
  }
}
$utf8 = [System.Text.UTF8Encoding]::new($false)

[System.IO.File]::WriteAllText($logPath, '', $utf8)
[System.IO.File]::WriteAllText($pidPath, "$PID`r`n", $utf8)
try {
  & $cloudflared tunnel --url http://127.0.0.1:8080 --protocol http2 --no-autoupdate 2>&1 | ForEach-Object {
    [System.IO.File]::AppendAllText($logPath, "$_`r`n", $utf8)
  }
  exit $LASTEXITCODE
} finally {
  if (Test-Path -LiteralPath $pidPath) {
    $recordedPid = [System.IO.File]::ReadAllText($pidPath).Trim()
    if ($recordedPid -eq "$PID") {
      Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
    }
  }
}
