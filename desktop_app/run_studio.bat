@echo off
setlocal
title AERO-SYNC AIO & Cabinet Display Studio

echo =========================================================
echo    AERO-SYNC PRO DISPLAY STUDIO - HYBRID DESKTOP APP
echo =========================================================
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

echo [INFO] Launching AERO-SYNC Studio...
echo Opening in default browser and launching local server...
echo.

start "" http://localhost:5173
call npm run dev
