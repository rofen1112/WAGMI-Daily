param([int]$Port = 8787)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$runtime = Join-Path $root '.local-ai-lab-public'
$python = (Get-Command python -CommandType Application -ErrorAction Stop | Select-Object -First 1).Source
New-Item -ItemType Directory -Path $runtime -Force | Out-Null
$tokenFile = Join-Path $runtime 'proxy-token'
if (-not (Test-Path -LiteralPath $tokenFile)) {
    $bytes = New-Object byte[] 48
    $random = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $random.GetBytes($bytes) } finally { $random.Dispose() }
    [IO.File]::WriteAllText($tokenFile, ([BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()))
}
$token = [IO.File]::ReadAllText($tokenFile).Trim()
$expectedArguments = '-m server.public --root "' + $root + '" --port ' + $Port
$listeners = @(Get-NetTCPConnection -State Listen -ErrorAction Stop | Where-Object LocalPort -eq $Port)
if ($listeners.Count -gt 0) {
    foreach ($listener in $listeners) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction Stop
        if ($listener.LocalAddress -ne '127.0.0.1' -or $owner.ExecutablePath -ine $python -or $owner.CommandLine.TrimEnd() -cne ('"' + $python + '" ' + $expectedArguments)) {
            throw "Port $Port is not owned by this project's public AI Lab. No process was changed."
        }
    }
} else {
    $previousPythonPath = $env:PYTHONPATH
    try {
        $env:PYTHONPATH = Join-Path $root 'ai-lab'
        $started = Start-Process -FilePath $python -ArgumentList $expectedArguments -WorkingDirectory $root -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $runtime 'server.log') -RedirectStandardError (Join-Path $runtime 'server-error.log')
        $started.Id | Set-Content -LiteralPath (Join-Path $runtime 'server.pid')
    } finally { $env:PYTHONPATH = $previousPythonPath }
}
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    try {
        $health = Invoke-RestMethod "http://127.0.0.1:$Port/api/ai-lab/v1/health" -Headers @{ 'X-Ark-Lab-Proxy' = $token } -TimeoutSec 2
        if ($health.status -eq 'ok' -and $health.publicDeployment -eq $true -and $health.model -eq 'gpt-6.1-sol' -and $health.providerConfigured) {
            Write-Output "Public AI Lab ready on 127.0.0.1:$Port (GPT-6.1 Sol API; isolated visitor storage)"
            exit 0
        }
    } catch { }
    if ($started -and $started.HasExited) { throw 'Public AI Lab exited. Inspect .local-ai-lab-public/server-error.log.' }
    Start-Sleep -Milliseconds 250
}
throw 'Public AI Lab did not become ready. Inspect .local-ai-lab-public/server-error.log.'
