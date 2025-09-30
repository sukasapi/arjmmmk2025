# 🚀 Deployment Checklist - AR Model Viewer

## ✅ Pre-Deployment Checklist

### 📁 File Structure Verification
- [ ] `index.html` - Desktop mode
- [ ] `indexAR.html` - Mobile/AR mode  
- [ ] `app.js` - Desktop JavaScript
- [ ] `appAR.js` - Mobile/AR JavaScript
- [ ] `.htaccess` - Server configuration
- [ ] `robots.txt` - SEO configuration
- [ ] `sitemap.xml` - Search engine sitemap
- [ ] `web.config` - IIS configuration (optional)
- [ ] `package.json` - Dependencies documentation

### 📂 Assets Folder
- [ ] `Assets/models.json` - Model configuration
- [ ] `Assets/aztec.glb` - 3D model
- [ ] `Assets/jagannath_puri_temple_model.glb` - 3D model
- [ ] `Assets/thumbnail/default.png` - Default thumbnail
- [ ] `Assets/thumbnail/aztec.png` - Aztec thumbnail
- [ ] `Assets/thumbnail/jagannath_puri_temple_model.png` - Temple thumbnail

### 🎵 Audio Folder
- [ ] `Vo/aztec.mp3` - Aztec audio
- [ ] `Vo/jagannath_puri_temple_model.mp3` - Temple audio

## 🔧 Server Configuration

### 📋 cPanel Setup
- [ ] Login to cPanel
- [ ] Open File Manager
- [ ] Navigate to `public_html`
- [ ] Upload all files maintaining folder structure
- [ ] Set file permissions:
  - Files: `644` (rw-r--r--)
  - Folders: `755` (rwxr-xr-x)
- [ ] Test file access via browser

### 🔒 SSL Configuration
- [ ] Enable SSL certificate
- [ ] Force HTTPS redirect
- [ ] Test HTTPS access
- [ ] Verify no mixed content warnings

### ⚙️ .htaccess Configuration
- [ ] Update domain in `.htaccess`:
  ```apache
  # Change this line:
  RewriteCond %{HTTP_REFERER} !^https?://(www\.)?yourdomain\.com [NC]
  # To your actual domain:
  RewriteCond %{HTTP_REFERER} !^https?://(www\.)?yourdomain.com [NC]
  ```
- [ ] Verify mod_rewrite is enabled
- [ ] Test URL rewriting

## 🌐 Domain Configuration

### 📝 Update Domain References
- [ ] Update `sitemap.xml`:
  ```xml
  <loc>https://yourdomain.com/</loc>
  <loc>https://yourdomain.com/indexAR.html</loc>
  ```
- [ ] Update `robots.txt`:
  ```
  Sitemap: https://yourdomain.com/sitemap.xml
  ```

## 🧪 Testing Checklist

### 🖥️ Desktop Testing
- [ ] Open `https://yourdomain.com/`
- [ ] Verify desktop mode loads
- [ ] Test model gallery
- [ ] Click model to load 3D model
- [ ] Verify audio plays automatically
- [ ] Test object controls (zoom, rotate, lighting)
- [ ] Test sidebar toggle
- [ ] Test full screen mode

### 📱 Mobile Testing
- [ ] Open `https://yourdomain.com/` on mobile
- [ ] Verify redirect to `indexAR.html`
- [ ] Test 3D Scan screen
- [ ] Click "Start Capture"
- [ ] Verify model loads
- [ ] Verify audio plays
- [ ] Test AR mode (if supported)
- [ ] Test all 3 steps of AR flow

### 🔍 Cross-Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Firefox (desktop & mobile)
- [ ] Safari (desktop & mobile)
- [ ] Edge (desktop)

### 🎯 Feature Testing
- [ ] Model loading works
- [ ] Audio plays correctly
- [ ] 3D model displays properly
- [ ] Object controls function
- [ ] Responsive design works
- [ ] AR mode functions (mobile)
- [ ] Error handling works

## 🚨 Troubleshooting

### ❌ Common Issues

#### Model Not Loading
- [ ] Check file paths in `models.json`
- [ ] Verify `.glb` files are uploaded
- [ ] Check browser console for errors
- [ ] Verify MIME types in `.htaccess`

#### Audio Not Playing
- [ ] Check `.mp3` files are uploaded
- [ ] Verify audio MIME types
- [ ] Check browser autoplay policy
- [ ] Test with user interaction

#### AR Mode Not Working
- [ ] Ensure HTTPS is enabled
- [ ] Test on mobile device
- [ ] Check WebXR support
- [ ] Verify camera permissions

#### Performance Issues
- [ ] Check file sizes
- [ ] Enable compression
- [ ] Verify caching headers
- [ ] Test loading times

## 📊 Performance Monitoring

### 📈 Metrics to Track
- [ ] Page load time
- [ ] Model loading time
- [ ] Audio loading time
- [ ] Mobile performance
- [ ] Error rates

### 🔧 Optimization
- [ ] Enable gzip compression
- [ ] Set proper cache headers
- [ ] Optimize image sizes
- [ ] Minify CSS/JS (if needed)

## 🔐 Security Verification

### 🛡️ Security Checklist
- [ ] HTTPS enforced
- [ ] Security headers active
- [ ] Sensitive files protected
- [ ] Hotlinking prevention
- [ ] Directory browsing disabled
- [ ] CORS properly configured

## 📝 Post-Deployment

### 📋 Final Steps
- [ ] Update DNS if needed
- [ ] Test from different locations
- [ ] Monitor error logs
- [ ] Set up monitoring
- [ ] Create backup
- [ ] Document any customizations

### 📞 Support Information
- [ ] Document server details
- [ ] Note any custom configurations
- [ ] Keep backup of working version
- [ ] Document troubleshooting steps

---

## 🎉 Deployment Complete!

Your AR Model Viewer is now live at:
- **Desktop**: `https://yourdomain.com/`
- **Mobile**: `https://yourdomain.com/indexAR.html`

### 📱 Quick Test URLs
- Desktop Mode: `https://yourdomain.com/`
- Mobile Mode: `https://yourdomain.com/indexAR.html`
- Model Gallery: `https://yourdomain.com/Assets/models.json`
- Audio Test: `https://yourdomain.com/Vo/aztec.mp3`

### 🔗 Share Your App
- Share the main URL with users
- Test on various devices
- Monitor performance
- Gather user feedback

**Happy AR Viewing! 🎮✨**
