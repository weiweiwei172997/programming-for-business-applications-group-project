$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $root "releases"
$packageName = "GymPath-collaborator-package.zip"
$packagePath = Join-Path $releaseDir $packageName

New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
Remove-Item $packagePath -ErrorAction SilentlyContinue

$excludedDirectoryNames = @(
    ".git",
    ".next",
    ".pytest_cache",
    "__pycache__",
    "node_modules",
    "logs",
    "tools",
    "releases"
)

$excludedFileNames = @(
    ".env",
    "gympath.db",
    "tsconfig.tsbuildinfo"
)

$files = Get-ChildItem -LiteralPath $root -Recurse -File -Force | Where-Object {
    $relative = $_.FullName.Substring($root.Path.Length + 1)
    $pathParts = $relative -split "[\\/]"
    $hasExcludedDir = $false
    foreach ($part in $pathParts) {
        if ($excludedDirectoryNames -contains $part) {
            $hasExcludedDir = $true
            break
        }
    }

    -not $hasExcludedDir -and
    -not ($excludedFileNames -contains $_.Name) -and
    -not ($_.Extension -eq ".pyc") -and
    -not ($_.Extension -eq ".log") -and
    -not ($relative -like "data\*.db")
}

$staging = Join-Path $env:TEMP ("gympath-package-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $staging | Out-Null

try {
    foreach ($file in $files) {
        $relative = $file.FullName.Substring($root.Path.Length + 1)
        $target = Join-Path $staging $relative
        New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $target
    }

    Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $packagePath -Force
    "PACKAGE_PATH=$packagePath"
} finally {
    Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
}
