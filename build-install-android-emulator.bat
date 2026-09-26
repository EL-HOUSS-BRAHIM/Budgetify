@echo off
setlocal

set "ROOT=%~dp0"
set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
if not defined JAVA_HOME set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.20.8-hotspot"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ProgramFiles%\nodejs;%PATH%"
set "NODE_ENV=development"

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo Java 17 not found at "%JAVA_HOME%".
  echo Set JAVA_HOME to an installed JDK 17 and run this shortcut again.
  pause
  exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
  echo Android SDK platform-tools not found at "%ANDROID_HOME%".
  pause
  exit /b 1
)

"%ANDROID_HOME%\platform-tools\adb.exe" get-state >nul 2>&1
if errorlevel 1 (
  echo No Android device is connected. Start the Medium_Phone emulator first.
  pause
  exit /b 1
)

pushd "%ROOT%apps\mobile\android"
call gradlew.bat assembleDebug -PreactNativeArchitectures=x86_64
if errorlevel 1 (
  echo Android debug build failed.
  popd
  pause
  exit /b 1
)
popd

set "APK=%ROOT%apps\mobile\android\app\build\outputs\apk\debug\app-debug.apk"
if not exist "%APK%" (
  echo Build succeeded but the APK was not found: "%APK%"
  pause
  exit /b 1
)

"%ANDROID_HOME%\platform-tools\adb.exe" install -r "%APK%"
if errorlevel 1 (
  echo APK installation failed.
  pause
  exit /b 1
)

"%ANDROID_HOME%\platform-tools\adb.exe" reverse tcp:8081 tcp:8081 >nul 2>&1
"%ANDROID_HOME%\platform-tools\adb.exe" shell am start -n tech.brahimcrafts.budgetify/.MainActivity
echo.
echo Debug app built and installed. Use the Start Expo shortcut to load the app bundle.
