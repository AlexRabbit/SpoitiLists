# Build SpotiLists.spotiflac-ext (friendly install name) + legacy spoiti-lists copy for old URLs.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$extDir = Join-Path $root "extensions"
if (-not (Test-Path $extDir)) { New-Item -ItemType Directory -Path $extDir | Out-Null }

$zip = Join-Path $root "SpotiLists-temp.zip"
$outPrimary = Join-Path $root "SpotiLists.spotiflac-ext"
$publishedPrimary = Join-Path $extDir "SpotiLists.spotiflac-ext"
$publishedLegacy = Join-Path $extDir "spoiti-lists.spotiflac-ext"

if (Test-Path $zip) { Remove-Item $zip -Force }
if (Test-Path $outPrimary) { Remove-Item $outPrimary -Force }

Compress-Archive -Path (Join-Path $root "manifest.json"), (Join-Path $root "index.js") -DestinationPath $zip -Force
Rename-Item $zip $outPrimary
Copy-Item $outPrimary $publishedPrimary -Force
Copy-Item $outPrimary $publishedLegacy -Force
Write-Host "Created $outPrimary"
Write-Host "Published: $publishedPrimary"
Write-Host "Legacy copy (same bytes): $publishedLegacy"
