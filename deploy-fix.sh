#!/bin/bash

# Deploy Fix Script untuk AR Model Viewer
# Script ini akan mengatasi masalah 403 dan MIME type

echo "🚀 Starting AR Model Viewer Deployment Fix..."

# Backup current .htaccess
if [ -f ".htaccess" ]; then
    echo "📁 Backing up current .htaccess..."
    cp .htaccess .htaccess_backup_$(date +%Y%m%d_%H%M%S)
fi

# Use simple .htaccess
echo "🔧 Using simple .htaccess configuration..."
cp .htaccess_simple .htaccess

# Set proper file permissions
echo "🔐 Setting file permissions..."
chmod 644 *.js *.css *.html *.json
chmod 644 Assets/*.glb Assets/*.gltf 2>/dev/null || true
chmod 644 Vo/*.mp3 2>/dev/null || true
chmod 755 Assets/ Vo/ 2>/dev/null || true

# Create test files
echo "🧪 Creating test files..."
echo "console.log('Test successful');" > test.js
echo "body { background: green; }" > test.css
echo '{"status": "success"}' > test.json

# Test MIME types
echo "🔍 Testing MIME types..."
echo "JavaScript MIME type:"
curl -s -I "https://www.augmented.owlorix.com/test.js" | grep -i content-type || echo "❌ Cannot test - check manually"

echo "CSS MIME type:"
curl -s -I "https://www.augmented.owlorix.com/test.css" | grep -i content-type || echo "❌ Cannot test - check manually"

echo "JSON MIME type:"
curl -s -I "https://www.augmented.owlorix.com/test.json" | grep -i content-type || echo "❌ Cannot test - check manually"

# Clean up test files
echo "🧹 Cleaning up test files..."
rm -f test.js test.css test.json

echo "✅ Deployment fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Test your application at: https://www.augmented.owlorix.com"
echo "2. Check browser console for any remaining errors"
echo "3. If still having issues, check server logs"
echo "4. Use test-mime.php to verify MIME types"
echo ""
echo "🔧 If problems persist:"
echo "- Check server logs for detailed error messages"
echo "- Contact hosting provider for server configuration"
echo "- Use web.config for Windows/IIS servers"
echo ""
echo "📞 Support files created:"
echo "- README_TROUBLESHOOTING.md (detailed troubleshooting guide)"
echo "- test-mime.php (MIME type testing)"
echo "- web.config (Windows/IIS alternative)"
echo "- .htaccess_simple (simplified configuration)"
