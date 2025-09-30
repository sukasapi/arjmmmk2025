@echo off
echo ========================================
echo    AR Model Viewer - HTTPS Setup
echo ========================================
echo.

echo Setting up HTTPS for AR features...
echo.

echo Checking if OpenSSL is available...
openssl version >nul 2>&1
if %errorlevel% == 0 (
    echo OpenSSL found! Creating self-signed certificate...
    echo.
    
    echo Creating certificate directory...
    if not exist "ssl" mkdir ssl
    
    echo Generating private key...
    openssl genrsa -out ssl/server.key 2048
    
    echo Generating certificate...
    openssl req -new -x509 -key ssl/server.key -out ssl/server.crt -days 365 -subj "/C=ID/ST=Jakarta/L=Jakarta/O=AR Model Viewer/OU=Development/CN=localhost"
    
    echo.
    echo Certificate created successfully!
    echo.
    echo To use HTTPS with Python:
    echo python -m http.server 8000 --bind 127.0.0.1
    echo.
    echo Or use a proper web server like Apache/Nginx with SSL
    echo.
    echo Note: Browser will show security warning for self-signed certificate
    echo Click "Advanced" and "Proceed to localhost" to continue
    echo.
) else (
    echo OpenSSL not found!
    echo.
    echo Please install OpenSSL or use XAMPP/Laragon with SSL enabled
    echo.
    echo For XAMPP:
    echo 1. Open XAMPP Control Panel
    echo 2. Click "Config" on Apache
    echo 3. Select "Apache (httpd-ssl.conf)"
    echo 4. Uncomment "Listen 443"
    echo 5. Restart Apache
    echo.
    echo For Laragon:
    echo 1. Right-click Laragon
    echo 2. Select "Apache" - "SSL" - "Enable"
    echo 3. Restart Apache
    echo.
)

pause
