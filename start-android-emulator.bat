@echo off
setlocal

set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"
set "EMULATOR=%ANDROID_HOME%\emulator\emulator.exe"

if not exist "%ADB%" (
  echo Android SDK platform-tools not found at "%ANDROID_HOME%".
  pause
  exit /b 1
)

if not exist "%EMULATOR%" (
  echo Android emulator was not found at "%EMULATOR%".
  pause
  exit /b 1
)

"%ADB%" devices | findstr /B /C:"emulator-" >nul
if errorlevel 1 (
  start "Medium_Phone Emulator" "%EMULATOR%" -avd Medium_Phone
)

echo Waiting for the Android emulator...
"%ADB%" wait-for-device
if errorlevel 1 (
  echo Android emulator did not connect to adb.
  pause
  exit /b 1
)

:wait_for_boot
set "BOOTED=0"
for /f "delims=" %%B in ('"%ADB%" shell getprop sys.boot_completed 2^>nul') do set "BOOTED=%%B"
if not "%BOOTED%"=="1" (
  timeout /t 2 /nobreak >nul
  goto wait_for_boot
)

"%ADB%" reverse tcp:8081 tcp:8081 >nul 2>&1
echo Medium_Phone is ready. Start Expo to load Lyvora.
