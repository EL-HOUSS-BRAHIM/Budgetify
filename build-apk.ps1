$ErrorActionPreference = 'Stop'
$env:ANDROID_HOME = "C:\Users\dell\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:PATH = "C:\Program Files\nodejs;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"

Write-Output "Building Android Debug APK with Gradle 8.8..."
Set-Location "C:\dev\Budgetify\apps\mobile\android"

& ".\gradlew.bat" assembleDebug -PreactNativeArchitectures=arm64-v8a

Write-Output "Gradle build exit code: $LASTEXITCODE"

$apkPath = "C:\dev\Budgetify\apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $apkPath) {
    $apkItem = Get-Item $apkPath
    Write-Output "===================================================="
    Write-Output "SUCCESS: Debug APK built successfully!"
    Write-Output "Path: $apkPath"
    Write-Output "Size: $([math]::Round($apkItem.Length / 1MB, 2)) MB"
    Write-Output "===================================================="
} else {
    Write-Output "APK not found at $apkPath"
}
