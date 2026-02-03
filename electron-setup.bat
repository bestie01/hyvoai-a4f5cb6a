@echo off
REM Hyvo Stream Studio - Desktop App Setup Script (Windows)
REM This script automates the Electron desktop app setup process

echo.
echo ========================================
echo   Hyvo Stream Studio - Desktop Setup
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

echo [OK] Node.js detected
node -v
echo.

REM Install dependencies with legacy peer deps
echo [INFO] Installing dependencies...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

REM Build web assets
echo [INFO] Building web assets...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Failed to build web assets
    pause
    exit /b 1
)

REM Prepare Electron directory
echo [INFO] Preparing Electron directory...

if not exist "electron\app" mkdir electron\app
if not exist "electron\app\icons" mkdir electron\app\icons

REM Copy built files to Electron app directory
xcopy /E /Y /Q dist\* electron\app\

REM Copy app icon if it exists
if exist "public\app-icon-1024.png" (
    copy /Y "public\app-icon-1024.png" "electron\app\icons\appIcon.png"
) else if exist "public\hyvo-logo.png" (
    copy /Y "public\hyvo-logo.png" "electron\app\icons\appIcon.png"
)

echo [OK] Web build copied to electron\app

REM Navigate to electron directory
cd electron

REM Install electron dependencies
echo [INFO] Installing Electron dependencies...
call npm install

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install Electron dependencies
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. To run in development: cd electron ^&^& npm start
echo 2. To build Windows:      cd electron ^&^& npm run build:win
echo 3. To build macOS:        cd electron ^&^& npm run build:mac
echo 4. To build Linux:        cd electron ^&^& npm run build:linux
echo 5. To build all:          cd electron ^&^& npm run build:all
echo.
echo See QUICK_START_DESKTOP.md for detailed build instructions
echo.
pause
