# AR Model Viewer - Deployment Guide for cPanel

## 📋 Persiapan Upload ke Server Produksi

### 1. File yang Perlu Diupload

```
📁 public_html/
├── index.html              # Desktop mode
├── indexAR.html            # Mobile/AR mode
├── app.js                  # Desktop JavaScript
├── appAR.js                # Mobile/AR JavaScript
├── .htaccess               # Server configuration
├── robots.txt              # SEO configuration
├── sitemap.xml             # Search engine sitemap
├── 📁 Assets/
│   ├── models.json         # Model configuration
│   ├── aztec.glb           # 3D model
│   ├── jagannath_puri_temple_model.glb
│   └── 📁 thumbnail/
│       ├── default.png
│       ├── aztec.png
│       └── jagannath_puri_temple_model.png
└── 📁 Vo/
    ├── aztec.mp3           # Audio file
    └── jagannath_puri_temple_model.mp3
```

### 2. Langkah Upload via cPanel

#### A. Login ke cPanel
1. Buka cPanel hosting Anda
2. Login dengan username dan password

#### B. Buka File Manager
1. Klik "File Manager" di cPanel
2. Navigasi ke folder `public_html`
3. Hapus file default (jika ada): `index.html`, `index.php`

#### C. Upload File Aplikasi
1. **Upload file utama:**
   - `index.html`
   - `indexAR.html`
   - `app.js`
   - `appAR.js`
   - `.htaccess`
   - `robots.txt`
   - `sitemap.xml`

2. **Buat folder Assets:**
   - Klik "New Folder" → nama: `Assets`
   - Upload `models.json` ke folder Assets
   - Upload file `.glb` ke folder Assets
   - Buat subfolder `thumbnail` di dalam Assets
   - Upload file thumbnail ke folder `Assets/thumbnail`

3. **Buat folder Vo:**
   - Klik "New Folder" → nama: `Vo`
   - Upload file `.mp3` ke folder Vo

#### D. Set Permissions
1. Klik kanan pada file `.htaccess`
2. Pilih "Change Permissions"
3. Set ke `644` (rw-r--r--)

### 3. Konfigurasi Domain

#### A. Update .htaccess
1. Buka file `.htaccess` di File Manager
2. Ganti `yourdomain.com` dengan domain Anda:
   ```apache
   # Ganti baris ini:
   RewriteCond %{HTTP_REFERER} !^https?://(www\.)?yourdomain\.com [NC]
   
   # Menjadi:
   RewriteCond %{HTTP_REFERER} !^https?://(www\.)?domainanda.com [NC]
   ```

#### B. Update sitemap.xml
1. Buka file `sitemap.xml`
2. Ganti `yourdomain.com` dengan domain Anda:
   ```xml
   <loc>https://domainanda.com/</loc>
   <loc>https://domainanda.com/indexAR.html</loc>
   ```

#### C. Update robots.txt
1. Buka file `robots.txt`
2. Ganti `yourdomain.com` dengan domain Anda:
   ```
   Sitemap: https://domainanda.com/sitemap.xml
   ```

### 4. Testing Aplikasi

#### A. Test Desktop Mode
1. Buka `https://domainanda.com/`
2. Pastikan model gallery muncul
3. Klik model untuk memuat 3D model
4. Pastikan audio berjalan

#### B. Test Mobile/AR Mode
1. Buka `https://domainanda.com/` dari mobile device
2. Pastikan redirect ke `indexAR.html`
3. Test 3 tahapan AR
4. Pastikan audio berjalan

### 5. SSL Certificate

#### A. Aktifkan SSL
1. Di cPanel, cari "SSL/TLS"
2. Klik "Manage SSL sites"
3. Aktifkan SSL untuk domain Anda
4. Pastikan "Force HTTPS Redirect" aktif

#### B. Test HTTPS
1. Buka `https://domainanda.com/`
2. Pastikan tidak ada warning SSL
3. Test semua fitur dengan HTTPS

### 6. Performance Optimization

#### A. Enable Compression
- File `.htaccess` sudah include compression
- Pastikan mod_deflate aktif di server

#### B. Browser Caching
- File `.htaccess` sudah include caching rules
- Test dengan browser dev tools

#### C. CDN (Optional)
- Pertimbangkan menggunakan CDN untuk file static
- Upload file besar ke CDN jika perlu

### 7. Troubleshooting

#### A. File Tidak Muncul
1. Cek permissions file (644 untuk file, 755 untuk folder)
2. Cek path file di browser
3. Cek error log di cPanel

#### B. Audio Tidak Berjalan
1. Cek file audio di folder Vo
2. Cek MIME type di .htaccess
3. Test dengan browser yang berbeda

#### C. 3D Model Tidak Load
1. Cek file .glb di folder Assets
2. Cek models.json configuration
3. Cek browser console untuk error

#### D. AR Mode Tidak Bekerja
1. Pastikan menggunakan HTTPS
2. Test di mobile device
3. Cek WebXR support browser

### 8. Maintenance

#### A. Backup Regular
1. Backup file aplikasi secara berkala
2. Backup database jika ada
3. Simpan backup di tempat aman

#### B. Update Content
1. Tambah model baru: upload .glb ke Assets
2. Update models.json dengan model baru
3. Tambah audio: upload .mp3 ke Vo
4. Update thumbnail jika perlu

#### C. Monitor Performance
1. Cek loading time aplikasi
2. Monitor error log
3. Update browser cache jika perlu

### 9. Security Checklist

- ✅ SSL Certificate aktif
- ✅ HTTPS redirect aktif
- ✅ Security headers di .htaccess
- ✅ File sensitive tidak accessible
- ✅ Hotlinking protection aktif
- ✅ Directory browsing disabled

### 10. Support

Jika mengalami masalah:
1. Cek error log di cPanel
2. Test di browser yang berbeda
3. Cek console browser untuk error JavaScript
4. Pastikan semua file terupload dengan benar

---

**Catatan Penting:**
- Pastikan server mendukung mod_rewrite
- Pastikan PHP version compatible
- Test di berbagai device dan browser
- Monitor performance setelah deployment
