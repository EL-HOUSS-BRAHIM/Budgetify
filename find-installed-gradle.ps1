$paths = @("gradle-8.8-all", "gradle-8.6-all", "gradle-8.13-bin", "gradle-8.14.3-bin")
foreach ($p in $paths) {
    $dir = "C:\Users\dell\.gradle\wrapper\dists\$p"
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -Recurse -Filter "gradle.bat"
        foreach ($f in $files) {
            Write-Output "Found: $($f.FullName)"
        }
    }
}
