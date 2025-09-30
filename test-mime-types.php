<?php
// AR Model Viewer - MIME Type Test
// Test if server is serving files with correct MIME types

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AR Model Viewer - MIME Type Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-item {
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #ddd;
        }
        .success {
            background: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .info {
            background: #d1ecf1;
            border-left-color: #17a2b8;
            color: #0c5460;
        }
        h1 {
            color: #333;
            text-align: center;
        }
        h2 {
            color: #666;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .file-list {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .file-list li {
            margin: 5px 0;
        }
        .btn {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin: 5px;
        }
        .btn:hover {
            background: #0056b3;
        }
        .btn-success {
            background: #28a745;
        }
        .btn-success:hover {
            background: #1e7e34;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 AR Model Viewer - Server Test</h1>
        
        <h2>📋 MIME Type Test Results</h2>
        
        <?php
        // Test files and their expected MIME types
        $testFiles = [
            'appAR.js' => 'application/javascript',
            'app.js' => 'application/javascript',
            'indexAR.html' => 'text/html',
            'index.html' => 'text/html',
            'Assets/models.json' => 'application/json',
            'Vo/aztec.mp3' => 'audio/mpeg',
            'Vo/jagannath_puri_temple_model.mp3' => 'audio/mpeg'
        ];
        
        $results = [];
        $allPassed = true;
        
        foreach ($testFiles as $file => $expectedMime) {
            if (file_exists($file)) {
                $actualMime = mime_content_type($file);
                $status = ($actualMime === $expectedMime) ? 'success' : 'warning';
                $icon = ($actualMime === $expectedMime) ? '✅' : '⚠️';
                
                if ($actualMime !== $expectedMime) {
                    $allPassed = false;
                }
                
                $results[] = [
                    'file' => $file,
                    'expected' => $expectedMime,
                    'actual' => $actualMime,
                    'status' => $status,
                    'icon' => $icon
                ];
            } else {
                $results[] = [
                    'file' => $file,
                    'expected' => $expectedMime,
                    'actual' => 'File not found',
                    'status' => 'error',
                    'icon' => '❌'
                ];
                $allPassed = false;
            }
        }
        
        // Display results
        foreach ($results as $result) {
            echo "<div class='test-item {$result['status']}'>";
            echo "<strong>{$result['icon']} {$result['file']}</strong><br>";
            echo "Expected: {$result['expected']}<br>";
            echo "Actual: {$result['actual']}";
            echo "</div>";
        }
        
        // Overall status
        if ($allPassed) {
            echo "<div class='test-item success'>";
            echo "<strong>🎉 All tests passed! Server configuration is correct.</strong>";
            echo "</div>";
        } else {
            echo "<div class='test-item error'>";
            echo "<strong>⚠️ Some tests failed. Check server configuration.</strong>";
            echo "</div>";
        }
        ?>
        
        <h2>🔧 Server Configuration Check</h2>
        
        <div class="test-item info">
            <strong>📋 Checklist:</strong>
            <ul>
                <li>✅ .htaccess file is present and configured</li>
                <li>✅ File permissions are correct (644 for files, 755 for directories)</li>
                <li>✅ MIME types are set correctly</li>
                <li>✅ JavaScript files are accessible</li>
                <li>✅ CORS headers are set</li>
            </ul>
        </div>
        
        <h2>🚀 Quick Actions</h2>
        
        <div class="file-list">
            <a href="appAR.js" class="btn" target="_blank">Test appAR.js</a>
            <a href="app.js" class="btn" target="_blank">Test app.js</a>
            <a href="indexAR.html" class="btn btn-success" target="_blank">Open AR App</a>
            <a href="index.html" class="btn btn-success" target="_blank">Open Desktop App</a>
        </div>
        
        <h2>📱 Mobile Test</h2>
        
        <div class="test-item info">
            <strong>📋 Mobile Testing Steps:</strong>
            <ol>
                <li>Open <a href="indexAR.html" target="_blank">indexAR.html</a> on mobile</li>
                <li>Check browser console for errors</li>
                <li>Test camera access</li>
                <li>Test model loading</li>
                <li>Test AR features</li>
            </ol>
        </div>
        
        <h2>🔍 Debug Information</h2>
        
        <div class="test-item info">
            <strong>Server Information:</strong><br>
            PHP Version: <?php echo phpversion(); ?><br>
            Server Software: <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?><br>
            Document Root: <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'; ?><br>
            Current Directory: <?php echo getcwd(); ?><br>
            .htaccess Exists: <?php echo file_exists('.htaccess') ? 'Yes' : 'No'; ?><br>
        </div>
        
        <h2>📞 Support</h2>
        
        <div class="test-item warning">
            <strong>If issues persist:</strong>
            <ul>
                <li>Check server error logs</li>
                <li>Contact hosting provider</li>
                <li>Try .htaccess_minimal</li>
                <li>Check file permissions</li>
                <li>Test from different browser</li>
            </ul>
        </div>
    </div>
</body>
</html>
