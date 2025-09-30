# 🎮 AR Code Object Capture

Aplikasi web yang menampilkan model 3D dengan format GLB dalam mode AR (Augmented Reality) dan Non-AR. Aplikasi ini mengikuti desain referensi dengan 3 tahapan utama: 3D Scan, 3D Modeling, dan AR QR Codes.

## ✨ Fitur

### 📱 **Mobile Interface (Sesuai Referensi)**
- **3D Scan**: Interface capture dengan area tangkapan dan handle untuk resize
- **3D Modeling**: Preview model 3D dengan indikator penempatan
- **AR QR Codes**: Konfirmasi pembuatan model dengan QR code dan tombol "View in AR"
- **Status Bar**: Menampilkan waktu, sinyal, dan baterai seperti perangkat mobile
- **Progress Indicator**: Menampilkan tahapan 1/3, 2/3, 3/3

### 💻 **Desktop Interface**
- **Sidebar**: Kontrol untuk load model default dan reset
- **Main View**: Area tampilan model 3D dengan background putih
- **Default Model**: Model Aztec artifact yang sudah tersedia
- **Status**: Indikator bahwa AR tidak tersedia di desktop

### 🔧 **Fitur Teknis**
- **Mode AR**: Menampilkan model 3D dalam augmented reality menggunakan WebXR
- **Mode Non-AR**: Menampilkan model 3D dengan background putih untuk desktop
- **Deteksi Perangkat**: Otomatis mendeteksi mobile/desktop dan menyesuaikan UI
- **Format GLB**: Mendukung model 3D dengan format GLB/GLTF
- **UI Responsif**: Interface yang modern dengan desain sesuai referensi
- **Notifikasi**: Memberikan notifikasi yang informatif untuk user

## 🚀 Cara Menjalankan

### Opsi 1: Menggunakan Live Server (Recommended)
```bash
npm install
npm run dev
```

### Opsi 2: Menggunakan HTTP Server
```bash
npm install
npm start
```

### Opsi 3: Manual
Buka file `index.html` langsung di browser (beberapa fitur mungkin tidak berfungsi karena CORS)

## 📱 Persyaratan

### Untuk Mode AR (Mobile):
- Browser yang mendukung WebXR (Chrome, Edge, Firefox)
- Perangkat mobile dengan sensor AR
- HTTPS connection (diperlukan untuk WebXR)

### Untuk Mode Non-AR (Desktop):
- Browser modern dengan dukungan WebGL
- Tidak memerlukan sensor khusus

## 🎯 Cara Penggunaan

### 📱 **Mobile (Sesuai Referensi)**
1. **3D Scan**: 
   - Aplikasi akan menampilkan area capture dengan handle untuk resize
   - Klik "Start Capture" untuk memulai proses capture
   - Loading akan muncul selama proses capture

2. **3D Modeling**:
   - Model 3D akan ditampilkan dengan indikator penempatan
   - Model akan berputar otomatis
   - Klik "Next" untuk melanjutkan ke tahap berikutnya

3. **AR QR Codes**:
   - Konfirmasi bahwa model 3D telah dibuat
   - QR code akan ditampilkan dengan logo AR
   - Klik "View in AR" untuk melihat model dalam AR

### 💻 **Desktop**
1. **Buka aplikasi** di browser desktop
2. **Klik "Load Default Model"** untuk memuat model 3D default (Aztec artifact)
3. **Model akan ditampilkan** dengan background putih dan berputar otomatis

## 🔧 Teknologi yang Digunakan

- **Three.js**: Library 3D JavaScript
- **WebXR**: API untuk augmented reality
- **GLTFLoader**: Loader untuk format GLB/GLTF
- **HTML5 Canvas**: Rendering 3D
- **CSS3**: Styling modern dengan gradient dan animasi

## 📁 Struktur File

```
├── index.html          # File HTML utama
├── app.js             # JavaScript aplikasi
├── package.json       # Dependencies dan scripts
├── README.md          # Dokumentasi
└── Assets/            # Folder model 3D
    └── aztec.glb      # Model 3D default (Aztec artifact)
```

## 🎨 Fitur UI

### 📱 **Mobile UI (Sesuai Referensi)**
- **Status Bar**: Menampilkan waktu real-time, sinyal, dan baterai
- **3 Tahapan**: Scan → Modeling → QR Codes dengan navigasi yang jelas
- **Capture Area**: Area tangkapan dengan handle untuk resize manual
- **Progress Indicator**: Menampilkan tahapan saat ini (1/3, 2/3, 3/3)
- **QR Code**: QR code dengan logo AR di tengah
- **Dark Theme**: Background gelap dengan elemen putih untuk kontras

### 💻 **Desktop UI**
- **Sidebar**: Kontrol dan informasi di sisi kiri
- **Main Area**: Area tampilan model 3D yang besar
- **Light Theme**: Background putih dengan elemen gelap
- **Default Model**: Model Aztec artifact yang sudah tersedia di folder Assets

## 🔍 Deteksi Perangkat

Aplikasi secara otomatis mendeteksi:
- **Mobile/Tablet**: Mode AR tersedia
- **Desktop**: Mode AR tidak tersedia, notifikasi ditampilkan

## 📝 Catatan Penting

- Mode AR hanya berfungsi di perangkat mobile dengan browser yang mendukung WebXR
- Model 3D akan berputar otomatis di mode Non-AR
- Model default (Aztec artifact) sudah tersedia di folder Assets
- Untuk testing AR, gunakan perangkat mobile dengan koneksi HTTPS
- Tidak perlu upload file model, aplikasi menggunakan model default

## 🐛 Troubleshooting

### Model tidak muncul:
- Pastikan folder Assets dan file aztec.glb tersedia
- Cek console browser untuk error
- Pastikan server berjalan dengan benar

### Mode AR tidak berfungsi:
- Pastikan menggunakan perangkat mobile
- Pastikan browser mendukung WebXR
- Pastikan koneksi menggunakan HTTPS
- Cek permission camera dan sensor

### Performance lambat:
- Gunakan model dengan polygon count yang wajar
- Pastikan perangkat memiliki spesifikasi yang memadai
- Tutup aplikasi lain yang menggunakan resource tinggi
