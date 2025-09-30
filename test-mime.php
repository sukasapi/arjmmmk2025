<?php
// Test MIME Types untuk AR Model Viewer
// File ini untuk testing apakah server mengembalikan MIME type yang benar

// Test JavaScript MIME type
if (isset($_GET['type']) && $_GET['type'] === 'js') {
    header('Content-Type: application/javascript');
    echo "console.log('JavaScript MIME type test successful');";
    exit;
}

// Test CSS MIME type
if (isset($_GET['type']) && $_GET['type'] === 'css') {
    header('Content-Type: text/css');
    echo "body { background: green; }";
    exit;
}

// Test JSON MIME type
if (isset($_GET['type']) && $_GET['type'] === 'json') {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'success', 'message' => 'JSON MIME type test successful']);
    exit;
}

// Default: Show test page
?>
<!DOCTYPE html>
<html>
<head>
    <title>MIME Type Test - AR Model Viewer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .test-link { display: block; margin: 10px 0; padding: 10px; background: #f0f0f0; text-decoration: none; border-radius: 5px; }
        .test-link:hover { background: #e0e0e0; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>MIME Type Test - AR Model Viewer</h1>
    
    <h2>Test Links:</h2>
    <a href="?type=js" class="test-link">Test JavaScript MIME Type</a>
    <a href="?type=css" class="test-link">Test CSS MIME Type</a>
    <a href="?type=json" class="test-link">Test JSON MIME Type</a>
    
    <h2>Expected Results:</h2>
    <ul>
        <li><strong>JavaScript:</strong> Should return <code>Content-Type: application/javascript</code></li>
        <li><strong>CSS:</strong> Should return <code>Content-Type: text/css</code></li>
        <li><strong>JSON:</strong> Should return <code>Content-Type: application/json</code></li>
    </ul>
    
    <h2>How to Test:</h2>
    <ol>
        <li>Click each test link above</li>
        <li>Check browser developer tools (F12) → Network tab</li>
        <li>Look for the <code>Content-Type</code> header in the response</li>
        <li>If MIME types are correct, your server is configured properly</li>
    </ol>
    
    <h2>Troubleshooting:</h2>
    <p>If you see <code>Content-Type: text/html</code> instead of the expected types:</p>
    <ul>
        <li>Check your <code>.htaccess</code> file</li>
        <li>Ensure server supports <code>mod_mime</code></li>
        <li>Contact your hosting provider</li>
        <li>Use the <code>.htaccess_simple</code> file provided</li>
    </ul>
    
    <script>
        // Test if JavaScript is working
        console.log('MIME type test page loaded successfully');
        
        // Test if we can load external JavaScript
        fetch('?type=js')
            .then(response => {
                console.log('JavaScript test response:', response.headers.get('content-type'));
                if (response.headers.get('content-type').includes('javascript')) {
                    console.log('✅ JavaScript MIME type is correct');
                } else {
                    console.log('❌ JavaScript MIME type is incorrect');
                }
            })
            .catch(error => {
                console.log('❌ Error testing JavaScript MIME type:', error);
            });
    </script>
</body>
</html>
