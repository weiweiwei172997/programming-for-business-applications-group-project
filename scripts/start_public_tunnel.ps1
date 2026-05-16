$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$tools = Join-Path $root "tools"
$logs = Join-Path $root "logs"
$cloudflared = Join-Path $tools "cloudflared.exe"
$stdout = Join-Path $logs "cloudflared.out.log"
$stderr = Join-Path $logs "cloudflared.err.log"

New-Item -ItemType Directory -Force -Path $tools | Out-Null
New-Item -ItemType Directory -Force -Path $logs | Out-Null

if (-not (Test-Path $cloudflared)) {
    Invoke-WebRequest `
        -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" `
        -OutFile $cloudflared `
        -UseBasicParsing `
        -TimeoutSec 120
}

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item $stdout, $stderr -ErrorAction SilentlyContinue

Start-Process `
    -FilePath $cloudflared `
    -ArgumentList @("tunnel", "--url", "http://127.0.0.1:3000", "--no-autoupdate") `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -WindowStyle Hidden

Start-Sleep -Seconds 3

$match = [regex]::Match("", "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
for ($i = 0; $i -lt 15; $i++) {
    $logText = ""
    if (Test-Path $stderr) {
        $logText = Get-Content $stderr -Raw
    }
    $match = [regex]::Match($logText, "https://[a-zA-Z0-9-]+\.trycloudflare\.com")
    if ($match.Success) {
        break
    }
    Start-Sleep -Seconds 2
}

if ($match.Success) {
    Write-Output ("PUBLIC_APP_URL=" + $match.Value)
    Write-Output ("PUBLIC_API_HEALTH=" + $match.Value + "/api/health")
} else {
    Write-Output "PUBLIC_TUNNEL_PENDING=Open logs/cloudflared.err.log and look for trycloudflare.com"
}
