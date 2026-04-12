# Build spoiti-lists.spotiflac-ext and copy to extensions/ for GitHub raw URL.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$extDir = Join-Path $root "extensions"
if (-not (Test-Path $extDir)) { New-Item -ItemType Directory -Path $extDir | Out-Null }

$zip = Join-Path $root "spoiti-lists.zip"
$out = Join-Path $root "spoiti-lists.spotiflac-ext"
$published = Join-Path $extDir "spoiti-lists.spotiflac-ext"

if (Test-Path $zip) { Remove-Item $zip -Force }
if (Test-Path $out) { Remove-Item $out -Force }

Compress-Archive -Path (Join-Path $root "manifest.json"), (Join-Path $root "index.js") -DestinationPath $zip -Force
Rename-Item $zip $out
Copy-Item $out $published -Force
Write-Host "Created $out"
Write-Host "Published copy: $published"
