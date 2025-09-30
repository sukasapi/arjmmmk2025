@echo off
echo ========================================
echo    AR Model Viewer - Browser Testing
echo ========================================
echo.

echo Testing application in different browsers...
echo.

echo Starting local server...
start /B python -m http.server 8000

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Opening browsers...
echo.

echo 1. Opening Chrome...
start chrome "http://localhost:8000/"

echo 2. Opening Firefox...
start firefox "http://localhost:8000/"

echo 3. Opening Edge...
start msedge "http://localhost:8000/"

echo 4. Opening mobile view (Chrome)...
start chrome "http://localhost:8000/indexAR.html" --user-agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"

echo.
echo All browsers opened!
echo.
echo Test the following features:
echo - Desktop mode: http://localhost:8000/
echo - Mobile/AR mode: http://localhost:8000/indexAR.html
echo - Camera access (HTTPS required for production)
echo - 3D model loading
echo - Audio playback
echo - AR marker detection
echo.
echo Press any key to stop the server...
pause >nul

echo Stopping server...
taskkill /f /im python.exe >nul 2>&1
echo Server stopped.
