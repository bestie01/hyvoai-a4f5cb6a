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

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install

REM Add Electron platform if not exists
if not exist "electron\" (
    echo [INFO] Adding Electron platform...
    call npx cap add electron
) else (
    echo [OK] Electron platform already exists
)

REM Build web assets
echo [INFO] Building web assets...
call npm run build

REM Sync to Electron
echo [INFO] Syncing to Electron...
call npx cap sync electron

REM Navigate to electron directory
cd electron

REM Install electron dependencies
echo [INFO] Installing Electron dependencies...
call npm install

REM Install electron-builder
echo [INFO] Installing electron-builder...
call npm install --save-dev electron-builder

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. To run in development: cd electron ^&^& npm start
echo 2. To build Windows: cd electron ^&^& npm run build:win
echo 3. To build macOS: cd electron ^&^& npm run build:mac
echo 4. To build Linux: cd electron ^&^& npm run build:linux
echo.
echo See BUILD_RELEASE.md for detailed build instructions
echo.
pause
