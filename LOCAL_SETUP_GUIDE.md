# 🚀 Panduan Menjalankan Aplikasi AR di Lokal

## 📋 Prerequisites

### 1. **Software yang Diperlukan:**
- **Web Server**: Apache, Nginx, atau XAMPP/Laragon
- **Browser**: Chrome, Firefox, Safari (versi terbaru)
- **HTTPS**: Diperlukan untuk camera access (AR features)

### 2. **Sistem Operasi:**
- **Windows**: XAMPP, Laragon, atau IIS
- **macOS**: MAMP, XAMPP, atau built-in Apache
- **Linux**: Apache, Nginx, atau built-in web server

## 🛠️ Setup Lokal

### **Opsi 1: Menggunakan Laragon (Windows)**

#### **1. Download dan Install Laragon:**
```
1. Download Laragon dari: https://laragon.org/download/
2. Install Laragon
3. Start Laragon
4. Pastikan Apache dan MySQL running
```

#### **2. Setup Project:**
```bash
# Copy project ke folder www Laragon
C:\laragon\www\ARTRIAL\

# Struktur folder:
C:\laragon\www\ARTRIAL\
├── index.html
├── indexAR.html
├── app.js
├── appAR.js
├── Assets/
│   ├── models.json
│   └── thumbnail/
├── Vo/
│   ├── aztec.mp3
│   └── jagannath_puri_temple_model.mp3
└── .htaccess
```

#### **3. Akses Aplikasi:**
```
Desktop Mode: http://localhost/ARTRIAL/
Mobile/AR Mode: http://localhost/ARTRIAL/indexAR.html
```

### **Opsi 2: Menggunakan XAMPP**

#### **1. Download dan Install XAMPP:**
```
1. Download XAMPP dari: https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache dari XAMPP Control Panel
```

#### **2. Setup Project:**
```bash
# Copy project ke folder htdocs XAMPP
C:\xampp\htdocs\ARTRIAL\

# Struktur folder sama seperti Laragon
```

#### **3. Akses Aplikasi:**
```
Desktop Mode: http://localhost/ARTRIAL/
Mobile/AR Mode: http://localhost/ARTRIAL/indexAR.html
```

### **Opsi 3: Menggunakan Python Simple Server**

#### **1. Setup Project:**
```bash
# Buka terminal/command prompt
cd C:\laragon\www\ARTRIAL

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### **2. Akses Aplikasi:**
```
Desktop Mode: http://localhost:8000/
Mobile/AR Mode: http://localhost:8000/indexAR.html
```

### **Opsi 4: Menggunakan Node.js Live Server**

#### **1. Install Live Server:**
```bash
# Install globally
npm install -g live-server

# Atau install locally
npm install live-server
```

#### **2. Setup Project:**
```bash
# Buka terminal/command prompt
cd C:\laragon\www\ARTRIAL

# Start live server
live-server --port=8000
```

#### **3. Akses Aplikasi:**
```
Desktop Mode: http://localhost:8000/
Mobile/AR Mode: http://localhost:8000/indexAR.html
```

## 🔒 HTTPS Setup (Diperlukan untuk AR)

### **Menggunakan Laragon dengan HTTPS:**

#### **1. Enable HTTPS di Laragon:**
```
1. Buka Laragon
2. Klik kanan pada Laragon
3. Pilih "Apache" → "SSL" → "Enable"
4. Restart Apache
```

#### **2. Akses dengan HTTPS:**
```
Desktop Mode: https://localhost/ARTRIAL/
Mobile/AR Mode: https://localhost/ARTRIAL/indexAR.html
```

### **Menggunakan XAMPP dengan HTTPS:**

#### **1. Enable HTTPS di XAMPP:**
```
1. Buka XAMPP Control Panel
2. Klik "Config" pada Apache
3. Pilih "Apache (httpd-ssl.conf)"
4. Uncomment line: Listen 443
5. Restart Apache
```

#### **2. Akses dengan HTTPS:**
```
Desktop Mode: https://localhost/ARTRIAL/
Mobile/AR Mode: https://localhost/ARTRIAL/indexAR.html
```

## 📱 Testing di Mobile

### **1. Akses dari Mobile:**
```
1. Pastikan komputer dan mobile dalam jaringan yang sama
2. Cari IP address komputer:
   - Windows: ipconfig
   - macOS: ifconfig
   - Linux: ip addr
3. Akses dari mobile:
   Desktop Mode: http://[IP_ADDRESS]/ARTRIAL/
   Mobile/AR Mode: http://[IP_ADDRESS]/ARTRIAL/indexAR.html
```

### **2. Contoh IP Address:**
```
# Jika IP komputer adalah 192.168.1.100
Desktop Mode: http://192.168.1.100/ARTRIAL/
Mobile/AR Mode: http://192.168.1.100/ARTRIAL/indexAR.html
```

## 🐛 Troubleshooting

### **1. Camera Tidak Bisa Diakses:**
```
✅ Pastikan menggunakan HTTPS
✅ Pastikan browser mendukung getUserMedia
✅ Pastikan camera permission diizinkan
✅ Coba refresh halaman
✅ Coba browser yang berbeda
```

### **2. Model 3D Tidak Muncul:**
```
✅ Pastikan file .glb ada di folder Assets
✅ Pastikan file audio .mp3 ada di folder Vo
✅ Check console browser untuk error
✅ Pastikan Three.js library ter-load
```

### **3. Audio Tidak Berfungsi:**
```
✅ Pastikan volume device dihidupkan
✅ Pastikan browser mendukung autoplay
✅ Coba klik/touch layar dulu
✅ Check console browser untuk error
```

### **4. AR Features Tidak Berfungsi:**
```
✅ Pastikan menggunakan HTTPS
✅ Pastikan browser mendukung WebXR
✅ Pastikan camera permission diizinkan
✅ Coba browser yang berbeda (Chrome recommended)
```

## 🔧 Development Tips

### **1. Browser Developer Tools:**
```
1. Buka browser
2. Tekan F12 atau Ctrl+Shift+I
3. Check Console tab untuk error
4. Check Network tab untuk loading issues
5. Check Application tab untuk camera permissions
```

### **2. Mobile Testing:**
```
1. Buka browser mobile
2. Akses aplikasi
3. Check console untuk error
4. Test camera access
5. Test AR features
```

### **3. File Structure Check:**
```
✅ index.html - Desktop mode
✅ indexAR.html - Mobile/AR mode
✅ app.js - Desktop JavaScript
✅ appAR.js - Mobile/AR JavaScript
✅ Assets/models.json - Model configuration
✅ Assets/thumbnail/ - Thumbnail images
✅ Vo/ - Audio files
✅ .htaccess - Server configuration
```

## 📊 Performance Tips

### **1. Optimasi Loading:**
```
✅ Gunakan CDN untuk Three.js
✅ Compress file audio
✅ Optimize 3D models
✅ Use proper image formats
```

### **2. Mobile Optimization:**
```
✅ Test di berbagai device
✅ Check memory usage
✅ Optimize for touch
✅ Test camera performance
```

## 🚀 Quick Start Commands

### **Laragon (Windows):**
```bash
# Start Laragon
# Copy project ke C:\laragon\www\ARTRIAL\
# Akses: http://localhost/ARTRIAL/
```

### **XAMPP:**
```bash
# Start XAMPP
# Copy project ke C:\xampp\htdocs\ARTRIAL\
# Akses: http://localhost/ARTRIAL/
```

### **Python Server:**
```bash
cd C:\laragon\www\ARTRIAL
python -m http.server 8000
# Akses: http://localhost:8000/
```

### **Node.js Live Server:**
```bash
cd C:\laragon\www\ARTRIAL
live-server --port=8000
# Akses: http://localhost:8000/
```

## 📝 Notes

### **1. Browser Compatibility:**
```
✅ Chrome: Full support
✅ Firefox: Full support
✅ Safari: Full support (iOS 11.3+)
✅ Edge: Full support
```

### **2. Mobile Compatibility:**
```
✅ Android Chrome: Full support
✅ iOS Safari: Full support
✅ Android Firefox: Full support
✅ iOS Chrome: Full support
```

### **3. AR Requirements:**
```
✅ HTTPS connection
✅ Camera permission
✅ WebXR support (optional)
✅ Modern browser
```

---

**Selamat mencoba aplikasi AR di lokal! 🚀✨**
