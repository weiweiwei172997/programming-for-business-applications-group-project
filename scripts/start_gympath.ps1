$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$ports = @(8000, 3000)

foreach ($port in $ports) {
    $lines = netstat -ano | Select-String ":$port"
    foreach ($line in $lines) {
        $parts = ($line.ToString() -split "\s+") | Where-Object { $_ }
        if ($parts.Count -ge 5 -and $parts[3] -eq "LISTENING") {
            Stop-Process -Id ([int]$parts[4]) -Force -ErrorAction SilentlyContinue
        }
    }
}

Start-Process `
    -FilePath "python" `
    -ArgumentList @("-m", "uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000") `
    -WorkingDirectory $root `
    -WindowStyle Hidden

$frontendRoot = Join-Path $root "frontend"
Push-Location $frontendRoot
try {
    npm.cmd run build
} finally {
    Pop-Location
}

Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "start:lan") `
    -WorkingDirectory $frontendRoot `
    -WindowStyle Hidden

Start-Sleep -Seconds 12

try {
    "NEXT_STATUS=" + (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/ -TimeoutSec 30).StatusCode
} catch {
    "NEXT_FAILED=" + $_.Exception.Message
}

try {
    "API_HEALTH=" + (Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/health -TimeoutSec 10).Content
} catch {
    "API_FAILED=" + $_.Exception.Message
}

$lanIp = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress

if ($lanIp) {
    "LAN_APP_URL=http://$lanIp`:3000"
    "LAN_API_URL=http://$lanIp`:8000"
}
