# AR Model Viewer - Local Setup Script
# PowerShell script untuk menjalankan aplikasi AR di lokal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    AR Model Viewer - Local Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
Write-Host "Checking if Python is available..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
    Write-Host ""
    
    # Get local IP address
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress
    
    Write-Host "Starting local server..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Local Access:" -ForegroundColor Cyan
    Write-Host "  Desktop Mode: http://localhost:8000/" -ForegroundColor White
    Write-Host "  Mobile/AR Mode: http://localhost:8000/indexAR.html" -ForegroundColor White
    Write-Host ""
    
    if ($localIP) {
        Write-Host "Mobile Access (same network):" -ForegroundColor Cyan
        Write-Host "  Desktop Mode: http://$localIP:8000/" -ForegroundColor White
        Write-Host "  Mobile/AR Mode: http://$localIP:8000/indexAR.html" -ForegroundColor White
        Write-Host ""
    }
    
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    # Start Python server
    python -m http.server 8000
}
catch {
    Write-Host "Python not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative options:" -ForegroundColor Yellow
    Write-Host "1. Install Python from https://python.org" -ForegroundColor White
    Write-Host "2. Use XAMPP: https://www.apachefriends.org/" -ForegroundColor White
    Write-Host "3. Use Laragon: https://laragon.org/" -ForegroundColor White
    Write-Host ""
    
    # Check if XAMPP is available
    if (Test-Path "C:\xampp\apache\bin\httpd.exe") {
        Write-Host "XAMPP found! Starting XAMPP..." -ForegroundColor Green
        Start-Process "C:\xampp\xampp-control.exe"
        Write-Host "Please start Apache from XAMPP Control Panel" -ForegroundColor Yellow
        Write-Host "Then access: http://localhost/ARTRIAL/" -ForegroundColor White
    }
    elseif (Test-Path "C:\laragon\laragon.exe") {
        Write-Host "Laragon found! Starting Laragon..." -ForegroundColor Green
        Start-Process "C:\laragon\laragon.exe"
        Write-Host "Please start Apache from Laragon" -ForegroundColor Yellow
        Write-Host "Then access: http://localhost/ARTRIAL/" -ForegroundColor White
    }
    
    Write-Host ""
    Read-Host "Press Enter to exit"
}
