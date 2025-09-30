# 🚀 AR Model Viewer - Local Setup

## Quick Start

### **Windows (Recommended):**
```bash
# Double-click to run
start-local.bat

# Or run PowerShell script
.\start-local.ps1
```

### **Manual Setup:**
```bash
# Navigate to project directory
cd C:\laragon\www\ARTRIAL

# Start Python server
python -m http.server 8000

# Access application
# Desktop: http://localhost:8000/
# Mobile: http://localhost:8000/indexAR.html
```

## 📁 Project Structure

```
ARTRIAL/
├── index.html              # Desktop mode
├── indexAR.html            # Mobile/AR mode
├── app.js                  # Desktop JavaScript
├── appAR.js                # Mobile/AR JavaScript
├── Assets/
│   ├── models.json         # Model configuration
│   └── thumbnail/          # Thumbnail images
├── Vo/                     # Audio files
├── .htaccess               # Server configuration
├── start-local.bat         # Windows batch script
├── start-local.ps1         # PowerShell script
├── setup-https.bat         # HTTPS setup script
├── test-browsers.bat       # Browser testing script
├── dev-config.json         # Development configuration
└── README_LOCAL.md         # This file
```

## 🔧 Available Scripts

### **start-local.bat**
- Starts Python HTTP server
- Shows local and mobile access URLs
- Windows batch script

### **start-local.ps1**
- PowerShell script with advanced features
- Shows local IP for mobile testing
- Auto-detects XAMPP/Laragon

### **setup-https.bat**
- Creates self-signed SSL certificate
- Required for camera access in production
- Uses OpenSSL

### **test-browsers.bat**
- Opens application in multiple browsers
- Tests desktop and mobile views
- Useful for cross-browser testing

## 🌐 Access URLs

### **Local Access:**
- **Desktop Mode**: http://localhost:8000/
- **Mobile/AR Mode**: http://localhost:8000/indexAR.html

### **Mobile Access (Same Network):**
- **Desktop Mode**: http://[YOUR_IP]:8000/
- **Mobile/AR Mode**: http://[YOUR_IP]:8000/indexAR.html

### **HTTPS (Production):**
- **Desktop Mode**: https://localhost:8000/
- **Mobile/AR Mode**: https://localhost:8000/indexAR.html

## 📱 Mobile Testing

### **1. Find Your IP Address:**
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### **2. Access from Mobile:**
```
# Example: If your IP is 192.168.1.100
Desktop: http://192.168.1.100:8000/
Mobile: http://192.168.1.100:8000/indexAR.html
```

## 🔒 HTTPS Setup

### **For Camera Access:**
```bash
# Run HTTPS setup script
setup-https.bat

# Or manually create certificate
openssl genrsa -out ssl/server.key 2048
openssl req -new -x509 -key ssl/server.key -out ssl/server.crt -days 365
```

### **Browser Security Warning:**
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. Camera access will work

## 🐛 Troubleshooting

### **Camera Not Working:**
- ✅ Use HTTPS (required for camera access)
- ✅ Allow camera permission in browser
- ✅ Check browser console for errors
- ✅ Try different browser

### **3D Models Not Loading:**
- ✅ Check Assets folder exists
- ✅ Verify .glb files are present
- ✅ Check browser console for errors
- ✅ Ensure Three.js library loads

### **Audio Not Playing:**
- ✅ Enable device volume
- ✅ Allow autoplay in browser
- ✅ Check Vo folder for .mp3 files
- ✅ Try clicking/touching screen first

## 🔧 Development Tools

### **Browser Developer Tools:**
- **F12**: Open developer tools
- **Console**: Check for errors
- **Network**: Monitor file loading
- **Application**: Check permissions

### **Mobile Testing:**
- **Chrome DevTools**: Remote debugging
- **Safari Web Inspector**: iOS testing
- **Firefox Developer Tools**: Mobile testing

## 📊 Performance Tips

### **Optimization:**
- Use CDN for Three.js library
- Compress audio files
- Optimize 3D models
- Enable browser caching

### **Testing:**
- Test on various devices
- Check memory usage
- Monitor network requests
- Test camera performance

## 🚀 Production Deployment

### **Requirements:**
- HTTPS certificate
- Web server (Apache/Nginx)
- Proper MIME types
- CORS configuration

### **Files to Upload:**
- All HTML, JS, CSS files
- Assets folder
- Vo folder
- .htaccess file

## 📝 Notes

### **Browser Compatibility:**
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

### **Mobile Compatibility:**
- ✅ Android Chrome
- ✅ iOS Safari
- ✅ Android Firefox
- ✅ iOS Chrome

### **AR Requirements:**
- HTTPS connection
- Camera permission
- Modern browser
- Mobile device (recommended)

---

**Happy coding! 🚀✨**
