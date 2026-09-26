@echo off
setlocal

set "ROOT=%~dp0"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
set "PATH=%ANDROID_HOME%\platform-tools;%ProgramFiles%\nodejs;%PATH%"
set "NODE_ENV=development"

if not exist "%ProgramFiles%\nodejs\npm.cmd" (
  echo npm.cmd was not found under "%ProgramFiles%\nodejs".
  pause
  exit /b 1
)

if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
  "%ANDROID_HOME%\platform-tools\adb.exe" reverse tcp:8081 tcp:8081 >nul 2>&1
)

netstat -ano -p tcp | findstr ":8081" | findstr "LISTENING" >nul
if not errorlevel 1 (
  echo Expo is already running on port 8081. Opening Lyvora in the Android development build.
  if exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    "%ANDROID_HOME%\platform-tools\adb.exe" shell am start -a android.intent.action.VIEW -d "tech.brahimcrafts.budgetify://expo-development-client/?url=http%%3A%%2F%%2F127.0.0.1%%3A8081"
  )
  exit /b 0
)

cd /d "%ROOT%"
call "%ProgramFiles%\nodejs\npm.cmd" run start --workspace apps/mobile -- --localhost --android
pause