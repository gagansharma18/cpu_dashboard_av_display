@echo off
setlocal
title ESP32 Cyberpunk AV Dashboard Agent

echo =========================================================
echo    ESP32 CYBERPUNK AV DASHBOARD - WINDOWS LAUNCHER
echo =========================================================
echo.

:: Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.9+ from python.org and check "Add Python to PATH".
    pause
    exit /b 1
)

:: Check if virtual environment exists, if not create it
if not exist "venv" (
    echo [INFO] Creating Python virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

:: Activate virtualenv
call venv\Scripts\activate.bat

:: Install / Update dependencies
echo [INFO] Verifying dependencies...
pip install -r requirements.txt >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARN] Upgrading pip and retrying dependency installation...
    python -m pip install --upgrade pip
    pip install -r requirements.txt
)

echo.
echo [INFO] Starting telemetry agent...
echo (Make sure your ESP32 is plugged into USB)
echo.

python dashboard_agent.py

echo.
echo [INFO] Agent stopped.
pause
