@echo off
echo ========================================
echo    AR Model Viewer - Server Fix
echo ========================================
echo.

echo Fixing server issues for AR Model Viewer...
echo.

echo 1. Creating backup of current .htaccess...
if exist ".htaccess" (
    copy ".htaccess" ".htaccess.backup" >nul
    echo    Backup created: .htaccess.backup
) else (
    echo    No existing .htaccess found
)

echo.
echo 2. Applying server fix...
if exist ".htaccess_fix" (
    copy ".htaccess_fix" ".htaccess" >nul
    echo    Server fix applied successfully
) else (
    echo    Error: .htaccess_fix not found
    pause
    exit /b 1
)

echo.
echo 3. Checking file permissions...
echo    Make sure these files have correct permissions:
echo    - appAR.js (644 or 755)
echo    - app.js (644 or 755)
echo    - indexAR.html (644 or 755)
echo    - index.html (644 or 755)
echo    - .htaccess (644 or 755)

echo.
echo 4. Server configuration applied:
echo    - Fixed JavaScript MIME types
echo    - Fixed 403 Forbidden errors
echo    - Added CORS headers
echo    - Relaxed Content Security Policy
echo    - Enabled compression
echo    - Set proper caching

echo.
echo 5. Next steps:
echo    - Upload all files to server
echo    - Test https://www.augmented.owlorix.com/appAR.js
echo    - Check browser console for errors
echo    - Test camera access

echo.
echo 6. If issues persist:
echo    - Check server error logs
echo    - Verify file permissions (644 for files, 755 for directories)
echo    - Contact hosting provider
echo    - Try .htaccess_simple as alternative

echo.
echo Server fix completed!
echo.
pause
