@echo off
echo ========================================
echo    AR Model Viewer - Local Setup
echo ========================================
echo.

echo Checking if Python is available...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Python found! Starting local server...
    echo.
    echo Server will start at: http://localhost:8000
    echo Desktop Mode: http://localhost:8000/
    echo Mobile/AR Mode: http://localhost:8000/indexAR.html
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Python not found! Please install Python or use XAMPP/Laragon
    echo.
    echo Alternative options:
    echo 1. Install Python from https://python.org
    echo 2. Use XAMPP: https://www.apachefriends.org/
    echo 3. Use Laragon: https://laragon.org/
    echo.
    pause
)
