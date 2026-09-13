$dists = Get-ChildItem "C:\Users\dell\.gradle\wrapper\dists" -Directory
foreach ($d in $dists) {
    Write-Output "Distribution: $($d.Name)"
}

$targetDir = "C:\Users\dell\.gradle\wrapper\dists\gradle-8.10.2-bin"
if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
}

$subDirs = Get-ChildItem $targetDir -Directory
if ($subDirs.Count -eq 0) {
    $hashDir = Join-Path $targetDir "download"
    New-Item -ItemType Directory -Path $hashDir -Force | Out-Null
} else {
    $hashDir = $subDirs[0].FullName
}

$zipTarget = Join-Path $hashDir "gradle-8.10.2-bin.zip"
Write-Output "Downloading gradle-8.10.2-bin.zip to $zipTarget using curl..."
& curl.exe -L "https://services.gradle.org/distributions/gradle-8.10.2-bin.zip" -o $zipTarget --retry 5 --retry-delay 2 --continue-at -

Write-Output "Download result: $LASTEXITCODE"
if (Test-Path $zipTarget) {
    $z = Get-Item $zipTarget
    Write-Output "Size: $([math]::Round($z.Length / 1MB, 2)) MB"
}
