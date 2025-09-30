@echo off
echo ========================================
echo    AR Model Viewer - Server Test
echo ========================================
echo.

echo Testing server configuration...
echo.

echo 1. Testing JavaScript files...
echo.

echo Testing appAR.js...
curl -I "https://www.augmented.owlorix.com/appAR.js" 2>nul
if %errorlevel% == 0 (
    echo    appAR.js: OK
) else (
    echo    appAR.js: ERROR - Check server configuration
)

echo.
echo Testing app.js...
curl -I "https://www.augmented.owlorix.com/app.js" 2>nul
if %errorlevel% == 0 (
    echo    app.js: OK
) else (
    echo    app.js: ERROR - Check server configuration
)

echo.
echo 2. Testing HTML files...
echo.

echo Testing indexAR.html...
curl -I "https://www.augmented.owlorix.com/indexAR.html" 2>nul
if %errorlevel% == 0 (
    echo    indexAR.html: OK
) else (
    echo    indexAR.html: ERROR - Check server configuration
)

echo.
echo Testing index.html...
curl -I "https://www.augmented.owlorix.com/index.html" 2>nul
if %errorlevel% == 0 (
    echo    index.html: OK
) else (
    echo    index.html: ERROR - Check server configuration
)

echo.
echo 3. Testing Assets...
echo.

echo Testing models.json...
curl -I "https://www.augmented.owlorix.com/Assets/models.json" 2>nul
if %errorlevel% == 0 (
    echo    models.json: OK
) else (
    echo    models.json: ERROR - Check server configuration
)

echo.
echo 4. Testing Audio files...
echo.

echo Testing aztec.mp3...
curl -I "https://www.augmented.owlorix.com/Vo/aztec.mp3" 2>nul
if %errorlevel% == 0 (
    echo    aztec.mp3: OK
) else (
    echo    aztec.mp3: ERROR - Check server configuration
)

echo.
echo 5. Opening browser for manual test...
echo.

echo Opening browser to test application...
start chrome "https://www.augmented.owlorix.com/indexAR.html"

echo.
echo Manual test instructions:
echo 1. Open browser console (F12)
echo 2. Check for 403 Forbidden errors
echo 3. Check for MIME type errors
echo 4. Test camera access
echo 5. Test model loading

echo.
echo If you see errors:
echo - Run fix-server-issues.bat
echo - Check file permissions
echo - Contact hosting provider

echo.
pause
