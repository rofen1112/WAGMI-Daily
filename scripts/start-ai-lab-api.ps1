param([int]$Port = 8786)
$ErrorActionPreference = 'Stop'
$LabRoot = Split-Path -Parent $PSScriptRoot
$env:PYTHONPATH = Join-Path $LabRoot 'ai-lab'
Push-Location $LabRoot
try {
    python -m server --root $LabRoot --port $Port
} finally {
    Pop-Location
}
