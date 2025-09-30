# 🔧 Server Troubleshooting Guide

## 🚨 Error yang Ditemukan

### **Error 1: 403 Forbidden**
```
GET https://www.augmented.owlorix.com/appAR.js
net::ERR_ABORTED 403 (Forbidden)
```

### **Error 2: MIME Type Error**
```
Refused to execute script from 'https://www.augmented.owlorix.com/appAR.js' 
because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
```

## 🔧 Solusi

### **1. Gunakan .htaccess_fix**
```bash
# Backup .htaccess yang ada
cp .htaccess .htaccess.backup

# Gunakan .htaccess_fix
cp .htaccess_fix .htaccess

# Upload ke server
```

### **2. Atau Gunakan .htaccess_minimal**
```bash
# Jika .htaccess_fix tidak bekerja
cp .htaccess_minimal .htaccess

# Upload ke server
```

### **3. Check File Permissions**
```bash
# Set permissions yang benar
chmod 644 appAR.js
chmod 644 app.js
chmod 644 indexAR.html
chmod 644 index.html
chmod 644 .htaccess

# Set directory permissions
chmod 755 Assets/
chmod 755 Vo/
```

## 📋 Checklist Server Fix

### **✅ File yang Harus Diupload:**
- [ ] `appAR.js` (permission: 644)
- [ ] `app.js` (permission: 644)
- [ ] `indexAR.html` (permission: 644)
- [ ] `index.html` (permission: 644)
- [ ] `.htaccess` (permission: 644)
- [ ] `Assets/models.json` (permission: 644)
- [ ] `Vo/aztec.mp3` (permission: 644)
- [ ] `Vo/jagannath_puri_temple_model.mp3` (permission: 644)

### **✅ Test URLs:**
- [ ] `https://www.augmented.owlorix.com/appAR.js` (should return JavaScript)
- [ ] `https://www.augmented.owlorix.com/app.js` (should return JavaScript)
- [ ] `https://www.augmented.owlorix.com/indexAR.html` (should return HTML)
- [ ] `https://www.augmented.owlorix.com/Assets/models.json` (should return JSON)

### **✅ Browser Console Check:**
- [ ] No 403 Forbidden errors
- [ ] No MIME type errors
- [ ] JavaScript files load correctly
- [ ] Camera permission prompt appears

## 🛠️ Langkah-langkah Fix

### **Step 1: Backup Current Files**
```bash
# Backup .htaccess
cp .htaccess .htaccess.backup

# Backup appAR.js
cp appAR.js appAR.js.backup
```

### **Step 2: Apply Server Fix**
```bash
# Windows
fix-server-issues.bat

# Manual
cp .htaccess_fix .htaccess
```

### **Step 3: Upload to Server**
```bash
# Upload semua file ke server
# Pastikan permissions benar:
# - Files: 644
# - Directories: 755
```

### **Step 4: Test Server**
```bash
# Test JavaScript files
curl -I https://www.augmented.owlorix.com/appAR.js
# Should return: Content-Type: application/javascript

# Test in browser
# Open: https://www.augmented.owlorix.com/indexAR.html
# Check console for errors
```

## 🔍 Debugging

### **Check Server Response:**
```bash
# Check if appAR.js is accessible
curl -I https://www.augmented.owlorix.com/appAR.js

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: application/javascript
# Content-Length: [size]
```

### **Check File Permissions:**
```bash
# Check file permissions
ls -la appAR.js
# Should show: -rw-r--r-- (644)

# Check directory permissions
ls -la Assets/
# Should show: drwxr-xr-x (755)
```

### **Check .htaccess:**
```bash
# Check if .htaccess is working
curl -I https://www.augmented.owlorix.com/appAR.js

# If still getting 403, try:
# 1. Check server error logs
# 2. Contact hosting provider
# 3. Try .htaccess_minimal
```

## 🚨 Common Issues

### **Issue 1: Still Getting 403**
**Solution:**
- Check file permissions (644 for files, 755 for directories)
- Check if .htaccess is uploaded correctly
- Check server error logs
- Contact hosting provider

### **Issue 2: Still Getting MIME Type Error**
**Solution:**
- Check if .htaccess is working
- Try .htaccess_minimal
- Check server configuration
- Contact hosting provider

### **Issue 3: Camera Not Working**
**Solution:**
- Ensure HTTPS is enabled
- Check browser console for errors
- Test camera permission
- Try different browser

## 📞 Support

### **If Issues Persist:**
1. **Check Server Logs**: Look for error messages
2. **Contact Hosting Provider**: Ask about .htaccess support
3. **Try Alternative**: Use .htaccess_minimal
4. **Check Browser**: Try different browser
5. **Check Network**: Test from different network

### **Hosting Provider Questions:**
- Does your server support .htaccess files?
- Are there any restrictions on JavaScript files?
- Can you check the server error logs?
- Is mod_headers enabled?

## 🎯 Quick Fix Commands

### **Windows:**
```bash
# Run the fix script
fix-server-issues.bat

# Or manual
copy .htaccess_fix .htaccess
```

### **Linux/Mac:**
```bash
# Backup and apply fix
cp .htaccess .htaccess.backup
cp .htaccess_fix .htaccess

# Set permissions
chmod 644 appAR.js app.js indexAR.html index.html .htaccess
chmod 755 Assets/ Vo/
```

---

**Good luck fixing the server issues! 🚀✨**
