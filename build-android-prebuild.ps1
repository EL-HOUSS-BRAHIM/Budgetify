$ErrorActionPreference = 'Stop'
$env:ANDROID_HOME = "C:\Users\dell\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:PATH"

Write-Output "JAVA_HOME: $env:JAVA_HOME"
Write-Output "ANDROID_HOME: $env:ANDROID_HOME"

Set-Location "C:\dev\Budgetify\apps\mobile"

$npx = Join-Path $env:ProgramFiles 'nodejs\npx.cmd'
Write-Output "Running expo prebuild..."
& $npx expo prebuild --platform android --clean --no-install

Write-Output "Prebuild completed. Checking android directory..."
Test-Path "android"
