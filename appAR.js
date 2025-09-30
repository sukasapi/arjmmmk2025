// AR Model Viewer - Mobile AR Mode
class ARModelViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.model = null;
        this.isARMode = false;
        this.isWebXRSupported = false;
        this.currentSession = null;
        this.currentStep = 1; // 1: Scan, 2: Modeling, 3: QR Codes
        this.selectedModel = null;
        
        // Audio system
        this.currentAudio = null;
        this.isAudioPlaying = false;
        
        // AR specific variables
        this.arScene = null;
        this.arCamera = null;
        this.arRenderer = null;
        this.arModel = null;
        this.isModelPlaced = false;
        
        // Desktop-like interface variables
        this.sidebarVisible = false;
        this.controlsVisible = false;
        this.trackerDetected = false;
        
        // AR Performance Metrics
        this.fps = 60;
        this.fpsHistory = [];
        this.lastTime = performance.now();
        this.frameCount = 0;
        
        // AR Tracking Visualization
        this.axisLinesVisible = false;
        this.objectOverlayVisible = false;
        
        // Camera feed
        this.cameraFeedActive = false;
        
        // Marker-based AR
        this.markerDetected = false;
        this.currentMarker = null;
        this.markerPatterns = new Map();
        this.markerSize = 0.1; // 10cm marker size
        
        this.audioContextEnabled = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeThreeJS();
        this.updateTime();
        this.updateUI();
        this.loadModelGallery();
        this.enableAudioContext();
        this.setupMobileDragControls();
        
        // Request camera permission after a short delay
        setTimeout(() => {
            this.requestCameraPermission();
        }, 1000);
        
        // Show marker instructions after a short delay
        setTimeout(() => {
            this.showMarkerInstructions();
        }, 2000);
        
        this.simulateTrackerDetection();
    }
    
    // Enable audio context with user interaction
    enableAudioContext() {
        // Add click event listener to enable audio context
        const enableAudio = () => {
            if (!this.audioContextEnabled) {
                // Create a silent audio context to enable audio
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                if (audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                this.audioContextEnabled = true;
                console.log('Audio context enabled');
                
                // Remove event listeners after first interaction
                document.removeEventListener('click', enableAudio);
                document.removeEventListener('touchstart', enableAudio);
            }
        };
        
        // Add event listeners for user interaction
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
    }
    
    // Setup mobile drag controls
    setupMobileDragControls() {
        const canvas = document.getElementById('mobile-canvas');
        if (!canvas) return;
        
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            canvas.style.cursor = 'grabbing';
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging || !this.model) return;
            
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            // Rotate model based on mouse movement
            this.model.rotation.y += deltaX * 0.01;
            this.model.rotation.x += deltaY * 0.01;
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        });
        
        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                isDragging = true;
                lastTouchX = e.touches[0].clientX;
                lastTouchY = e.touches[0].clientY;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!isDragging || !this.model || e.touches.length !== 1) return;
            
            const deltaX = e.touches[0].clientX - lastTouchX;
            const deltaY = e.touches[0].clientY - lastTouchY;
            
            // Rotate model based on touch movement
            this.model.rotation.y += deltaX * 0.01;
            this.model.rotation.x += deltaY * 0.01;
            
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isDragging = false;
        });
        
        // Wheel/scroll events for zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (!this.model) return;
            
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.model.scale.multiplyScalar(delta);
            
            // Limit scale
            const scale = this.model.scale.x;
            if (scale < 0.1) this.model.scale.setScalar(0.1);
            if (scale > 3) this.model.scale.setScalar(3);
            
            // Update scale slider
            const scaleSlider = document.getElementById('mobile-scale-slider');
            if (scaleSlider) {
                scaleSlider.value = scale;
            }
        });
        
        // Set initial cursor
        canvas.style.cursor = 'grab';
        
        // Double-tap to reset model
        let lastTapTime = 0;
        canvas.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < 500 && tapLength > 0) {
                // Double tap detected
                if (this.model) {
                    // Reset model position, rotation, and scale
                    this.model.position.set(0, 0, 0);
                    this.model.rotation.set(0, 0, 0);
                    this.model.scale.setScalar(1);
                    
                    // Update sliders
                    const scaleSlider = document.getElementById('mobile-scale-slider');
                    const rotationXSlider = document.getElementById('mobile-rotation-x');
                    const rotationYSlider = document.getElementById('mobile-rotation-y');
                    
                    if (scaleSlider) scaleSlider.value = 1;
                    if (rotationXSlider) rotationXSlider.value = 0;
                    if (rotationYSlider) rotationYSlider.value = 0;
                    
                    console.log('Model reset to default position');
                }
            }
            lastTapTime = currentTime;
        });
        
        // Pinch-to-zoom for mobile
        let initialDistance = 0;
        let initialScale = 1;
        
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Calculate initial distance between two touches
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                initialDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                initialScale = this.model ? this.model.scale.x : 1;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.model) {
                e.preventDefault();
                
                // Calculate current distance between two touches
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch2.clientX - touch1.clientX, 2) +
                    Math.pow(touch2.clientY - touch1.clientY, 2)
                );
                
                // Calculate scale factor
                const scaleFactor = currentDistance / initialDistance;
                const newScale = initialScale * scaleFactor;
                
                // Limit scale
                const clampedScale = Math.max(0.1, Math.min(3, newScale));
                this.model.scale.setScalar(clampedScale);
                
                // Update scale slider
                const scaleSlider = document.getElementById('mobile-scale-slider');
                if (scaleSlider) {
                    scaleSlider.value = clampedScale;
                }
            }
        });
    }

    // Update time display
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
        });
        
        const timeElement = document.getElementById('mobile-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
        
        // Update every minute
        setTimeout(() => this.updateTime(), 60000);
    }

    // Setup event listeners
    setupEventListeners() {
        // WebXR session events
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // Initialize Three.js
    initializeThreeJS() {
        // Initialize mobile canvas
        this.initializeMobileCanvas();
        
        // Check WebXR support
        this.checkWebXRSupport();
        
        // Start render loop
        this.animate();
    }

    // Initialize mobile canvas
    initializeMobileCanvas() {
        const mobileCanvas = document.getElementById('mobile-canvas');
        if (!mobileCanvas) return;
        
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, mobileCanvas.clientWidth / mobileCanvas.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 5);
        
        // Mobile Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: mobileCanvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(mobileCanvas.clientWidth, mobileCanvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting
        this.setupLighting();
        
        // Setup camera feed fallback
        this.setupCameraFeedFallback();
        
        // Setup marker patterns
        this.setupMarkerPatterns();
    }
    
    // Setup camera feed fallback
    setupCameraFeedFallback() {
        // Check if we can access camera
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Try to initialize camera feed
            this.initializeCameraFeed();
        } else {
            console.log('Camera access not available, using fallback background');
            this.setupFallbackBackground();
        }
    }
    
    // Request camera permission with user interaction
    requestCameraPermission() {
        // Show camera permission modal first
        this.showCameraPermissionModal();
    }
    
    // Setup marker patterns for each model
    setupMarkerPatterns() {
        // Define marker patterns for each model
        this.markerPatterns.set('aztec', {
            id: 'aztec',
            name: 'Aztec Marker',
            pattern: this.createAztecMarkerPattern(),
            model: 'aztec.glb',
            audio: 'aztec.mp3'
        });
        
        this.markerPatterns.set('jagannath', {
            id: 'jagannath',
            name: 'Jagannath Marker',
            pattern: this.createJagannathMarkerPattern(),
            model: 'jagannath_puri_temple_model.glb',
            audio: 'jagannath_puri_temple_model.mp3'
        });
        
        console.log('Marker patterns setup complete');
    }
    
    // Create Aztec marker pattern
    createAztecMarkerPattern() {
        // Create a simple pattern for Aztec marker
        const pattern = document.createElement('canvas');
        pattern.width = 256;
        pattern.height = 256;
        const ctx = pattern.getContext('2d');
        
        // Draw Aztec-inspired pattern
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 256);
        
        // Outer border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(16, 16, 224, 224);
        
        // Inner pattern - Aztec sun
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(128, 128, 80, 0, 2 * Math.PI);
        ctx.fill();
        
        // Aztec sun rays
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x1 = 128 + Math.cos(angle) * 60;
            const y1 = 128 + Math.sin(angle) * 60;
            const x2 = 128 + Math.cos(angle) * 100;
            const y2 = 128 + Math.sin(angle) * 100;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Center symbol
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(128, 128, 30, 0, 2 * Math.PI);
        ctx.fill();
        
        return pattern;
    }
    
    // Create Jagannath marker pattern
    createJagannathMarkerPattern() {
        // Create a simple pattern for Jagannath marker
        const pattern = document.createElement('canvas');
        pattern.width = 256;
        pattern.height = 256;
        const ctx = pattern.getContext('2d');
        
        // Draw Jagannath-inspired pattern
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 256, 256);
        
        // Outer border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(16, 16, 224, 224);
        
        // Inner pattern - Temple structure
        ctx.fillStyle = '#ff6b35';
        ctx.fillRect(64, 64, 128, 128);
        
        // Temple roof
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(64, 64);
        ctx.lineTo(128, 32);
        ctx.lineTo(192, 64);
        ctx.closePath();
        ctx.fill();
        
        // Temple pillars
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(80, 80, 16, 80);
        ctx.fillRect(160, 80, 16, 80);
        
        // Temple door
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(120, 120, 16, 40);
        
        // Center symbol
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(128, 128, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        return pattern;
    }
    
    // Initialize camera feed
    async initializeCameraFeed() {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            
            console.log('Camera access granted');
            
            // Create video element
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: -1;
            `;
            
            // Add video to canvas container
            const canvasContainer = document.getElementById('mobile-canvas-container');
            if (canvasContainer) {
                canvasContainer.appendChild(video);
            }
            
            // Wait for video to load
            video.addEventListener('loadedmetadata', () => {
                console.log('Camera feed loaded');
                this.cameraFeedActive = true;
            });
            
            // Handle video errors
            video.addEventListener('error', (error) => {
                console.error('Camera feed error:', error);
                this.setupFallbackBackground();
            });
            
        } catch (error) {
            console.error('Camera access denied:', error);
            this.showCameraPermissionModal();
        }
    }
    
    // Show camera permission modal
    showCameraPermissionModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('camera-permission-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create camera permission modal
        const modal = document.createElement('div');
        modal.id = 'camera-permission-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1c1c1e;
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            color: white;
        `;
        
        content.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">📷</div>
            <h2 style="margin-bottom: 15px; color: #007AFF;">Camera Access Required</h2>
            <p style="margin-bottom: 20px; color: #8e8e93; line-height: 1.5;">
                To use AR features, please allow camera access. The app will work in fallback mode without camera.
            </p>
            <div style="background: #2c2c2e; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                <h4 style="color: #007AFF; margin-bottom: 10px;">How to enable camera:</h4>
                <ul style="color: #8e8e93; font-size: 14px; line-height: 1.6;">
                    <li>• Click "Allow" when prompted</li>
                    <li>• Check browser settings</li>
                    <li>• Ensure HTTPS connection</li>
                    <li>• Try refreshing the page</li>
                </ul>
            </div>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.remove(); window.arApp.setupFallbackBackground();" style="
                    background: #8e8e93;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Continue Without Camera</button>
                <button onclick="this.parentElement.parentElement.remove(); window.arApp.initializeCameraFeed();" style="
                    background: #007AFF;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Try Again</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto remove after 15 seconds
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.remove();
                this.setupFallbackBackground();
            }
        }, 15000);
    }
    
    // Setup fallback background
    setupFallbackBackground() {
        console.log('Setting up fallback background');
        
        // Create a gradient background
        const canvas = document.getElementById('mobile-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(1, '#000000');
            
            // Set background
            this.scene.background = new THREE.Color(0x1a1a1a);
        }
        
        // Add some visual elements to make it look more like AR
        this.addFallbackVisualElements();
    }
    
    // Add fallback visual elements
    addFallbackVisualElements() {
        // Add a grid pattern
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);
        
        // Add some ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }

    // Setup lighting for mobile
    setupLighting() {
        if (!this.scene) return;
        
        // Clear existing lights
        this.scene.children = this.scene.children.filter(child => !child.isLight);
        
        // Ambient light - increased intensity for better overall lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        ambientLight.userData.originalIntensity = 1.0;
        this.scene.add(ambientLight);
        
        // Main directional light - increased intensity and better positioning
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -10;
        directionalLight.shadow.camera.right = 10;
        directionalLight.shadow.camera.top = 10;
        directionalLight.shadow.camera.bottom = -10;
        directionalLight.userData.originalIntensity = 1.5;
        this.scene.add(directionalLight);
        
        // Secondary directional light from opposite side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-5, 5, -5);
        directionalLight2.userData.originalIntensity = 0.8;
        this.scene.add(directionalLight2);
        
        // Point light for additional illumination
        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(0, 5, 0);
        pointLight.distance = 20;
        pointLight.userData.originalIntensity = 1.2;
        this.scene.add(pointLight);
        
        // Hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.6);
        hemisphereLight.userData.originalIntensity = 0.6;
        this.scene.add(hemisphereLight);
    }

    // Check WebXR support
    async checkWebXRSupport() {
        console.log('Checking WebXR support...');
        
        // Check if WebXR is available
        if (!('xr' in navigator)) {
            console.log('WebXR not available in this browser');
            this.isWebXRSupported = false;
            this.showWebXRNotSupported('WebXR not available in this browser');
            return;
        }
        
        // Check if we're on HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            console.log('WebXR requires HTTPS');
            this.isWebXRSupported = false;
            this.showWebXRNotSupported('WebXR requires HTTPS connection');
            return;
        }
        
        // Check AR session support
        try {
            this.isWebXRSupported = await navigator.xr.isSessionSupported('immersive-ar');
            console.log('WebXR AR support:', this.isWebXRSupported);
            
            if (this.isWebXRSupported) {
                this.showWebXRSupported();
            } else {
                this.showWebXRNotSupported('AR session not supported');
            }
        } catch (error) {
            console.log('WebXR not supported:', error);
            this.isWebXRSupported = false;
            this.showWebXRNotSupported('Error checking WebXR support: ' + error.message);
        }
    }
    
    // Show WebXR supported message
    showWebXRSupported() {
        console.log('WebXR AR is supported and ready');
        // You can add UI feedback here if needed
    }
    
    // Show WebXR not supported message
    showWebXRNotSupported(reason = 'WebXR AR not supported') {
        console.log('WebXR AR not supported:', reason);
        
        // Show notification to user
        this.showNotification(`WebXR AR not supported: ${reason}. Using fallback mode.`);
        
        // Enable fallback mode
        this.enableFallbackMode();
        
        // You can add more detailed UI feedback here
        this.showWebXRFallbackInfo(reason);
    }
    
    // Show WebXR fallback information
    showWebXRFallbackInfo(reason) {
        // Create info modal
        const modal = document.createElement('div');
        modal.id = 'webxr-fallback-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1c1c1e;
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            color: white;
        `;
        
        content.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
            <h2 style="margin-bottom: 15px; color: #007AFF;">WebXR AR Not Available</h2>
            <p style="margin-bottom: 20px; color: #8e8e93; line-height: 1.5;">
                ${reason}. The app will run in fallback mode with simulated AR experience.
            </p>
            <div style="background: #2c2c2e; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                <h4 style="color: #007AFF; margin-bottom: 10px;">Requirements for WebXR AR:</h4>
                <ul style="color: #8e8e93; font-size: 14px; line-height: 1.6;">
                    <li>• HTTPS connection (not HTTP)</li>
                    <li>• Compatible browser (Chrome, Edge, Firefox)</li>
                    <li>• AR-capable device</li>
                    <li>• WebXR API support</li>
                </ul>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #007AFF;
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Continue with Fallback Mode</button>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }

    // Load model gallery
    async loadModelGallery() {
        try {
            const response = await fetch('./Assets/models.json');
            this.availableModels = await response.json();
        } catch (error) {
            console.error('Error loading model gallery:', error);
            // Fallback to available models
            this.availableModels = [
                {
                    id: "aztec",
                    name: "Aztec Artifact",
                    file: "aztec.glb",
                    description: "Ancient Aztec ceremonial artifact",
                    icon: "🏛️",
                    category: "Historical",
                    thumbnail: "aztec.png",
                    audio: "aztec.mp3"
                },
                {
                    id: "jagannath_puri_temple",
                    name: "Jagannath Puri Temple",
                    file: "jagannath_puri_temple_model.glb",
                    description: "Sacred Hindu temple architecture",
                    icon: "🕉️",
                    category: "Religious",
                    thumbnail: "jagannath_puri_temple_model.png",
                    audio: "jagannath_puri_temple_model.mp3"
                }
            ];
        }
        
        // Populate mobile model gallery UI
        this.populateMobileGallery();
        this.populateMarkerGallery();
    }
    
    // Populate marker gallery
    populateMarkerGallery() {
        const markerGallery = document.getElementById('mobile-model-gallery');
        if (!markerGallery) return;
        
        // Add marker section header
        const markerHeader = document.createElement('div');
        markerHeader.style.cssText = `
            padding: 15px;
            background: #3a3a3c;
            border-bottom: 1px solid #48484a;
            color: #007AFF;
            font-weight: bold;
            font-size: 16px;
        `;
        markerHeader.textContent = 'AR Markers';
        markerGallery.appendChild(markerHeader);
        
        // Add markers
        this.markerPatterns.forEach((markerData, markerId) => {
            const markerElement = this.createMarkerElement(markerData);
            markerGallery.appendChild(markerElement);
        });
    }
    
    // Create marker element
    createMarkerElement(markerData) {
        const markerElement = document.createElement('div');
        markerElement.className = 'marker-item';
        markerElement.style.cssText = `
            padding: 15px;
            border-bottom: 1px solid #48484a;
            cursor: pointer;
            transition: background-color 0.3s ease;
        `;
        
        markerElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 60px; height: 60px; border: 2px solid #007AFF; border-radius: 8px; overflow: hidden; background: white; display: flex; align-items: center; justify-content: center;">
                    <canvas width="60" height="60" style="max-width: 100%; max-height: 100%;"></canvas>
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: white; margin-bottom: 5px;">${markerData.name}</div>
                    <div style="font-size: 12px; color: #8e8e93;">Model: ${markerData.model}</div>
                    <div style="font-size: 12px; color: #8e8e93;">Audio: ${markerData.audio}</div>
                </div>
            </div>
        `;
        
        // Draw marker pattern on canvas
        const canvas = markerElement.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const patternCanvas = markerData.pattern;
        ctx.drawImage(patternCanvas, 0, 0, 60, 60);
        
        // Add click event
        markerElement.addEventListener('click', () => {
            this.selectMarker(markerData);
        });
        
        // Add hover effect
        markerElement.addEventListener('mouseenter', () => {
            markerElement.style.backgroundColor = '#48484a';
        });
        
        markerElement.addEventListener('mouseleave', () => {
            markerElement.style.backgroundColor = 'transparent';
        });
        
        return markerElement;
    }
    
    // Select marker
    selectMarker(markerData) {
        console.log('Marker selected:', markerData.name);
        
        // Remove previous selection
        document.querySelectorAll('.marker-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        event.currentTarget.classList.add('selected');
        
        // Update current marker
        this.currentMarker = markerData;
        
        // Show marker download option
        this.showMarkerDownload(markerData);
        
        // If marker is already detected, load the model
        if (this.markerDetected) {
            this.loadMobileModel(markerData.model, markerData.audio);
        }
    }
    
    // Show marker download option
    showMarkerDownload(markerData) {
        // Remove existing download button if any
        const existingButton = document.getElementById('marker-download-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create download container
        const downloadContainer = document.createElement('div');
        downloadContainer.id = 'marker-download-container';
        downloadContainer.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 2000;
        `;
        
        // Create download button
        const downloadButton = document.createElement('button');
        downloadButton.id = 'marker-download-button';
        downloadButton.innerHTML = '📥 Download Marker';
        downloadButton.style.cssText = `
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
            transition: all 0.3s ease;
        `;
        
        // Create print guide button
        const printGuideButton = document.createElement('button');
        printGuideButton.id = 'print-guide-button';
        printGuideButton.innerHTML = '📖 Print Guide';
        printGuideButton.style.cssText = `
            background: #34C759;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
            transition: all 0.3s ease;
        `;
        
        // Add click event to download marker
        downloadButton.addEventListener('click', () => {
            this.downloadMarker(markerData);
        });
        
        // Add click event to show print guide
        printGuideButton.addEventListener('click', () => {
            this.showPrintGuide();
        });
        
        // Add hover effects
        downloadButton.addEventListener('mouseenter', () => {
            downloadButton.style.background = '#0056b3';
            downloadButton.style.transform = 'scale(1.05)';
        });
        
        downloadButton.addEventListener('mouseleave', () => {
            downloadButton.style.background = '#007AFF';
            downloadButton.style.transform = 'scale(1)';
        });
        
        printGuideButton.addEventListener('mouseenter', () => {
            printGuideButton.style.background = '#28a745';
            printGuideButton.style.transform = 'scale(1.05)';
        });
        
        printGuideButton.addEventListener('mouseleave', () => {
            printGuideButton.style.background = '#34C759';
            printGuideButton.style.transform = 'scale(1)';
        });
        
        // Add buttons to container
        downloadContainer.appendChild(downloadButton);
        downloadContainer.appendChild(printGuideButton);
        
        // Add to document
        document.body.appendChild(downloadContainer);
        
        // Auto remove after 15 seconds
        setTimeout(() => {
            if (downloadContainer && downloadContainer.parentNode) {
                downloadContainer.remove();
            }
        }, 15000);
    }
    
    // Download marker
    downloadMarker(markerData) {
        // Create download link
        const link = document.createElement('a');
        link.download = `${markerData.name.replace(/\s+/g, '_')}_marker.png`;
        link.href = markerData.pattern.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Marker downloaded:', markerData.name);
        
        // Show success message
        this.showNotification(`Marker ${markerData.name} downloaded successfully!`);
    }
    
    // Show print guide
    showPrintGuide() {
        // Remove existing print guide if any
        const existingGuide = document.getElementById('print-guide-modal');
        if (existingGuide) {
            existingGuide.remove();
        }
        
        // Create print guide modal
        const modal = document.createElement('div');
        modal.id = 'print-guide-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow-y: auto;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1c1c1e;
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
        `;
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="color: #007AFF; margin: 0;">📖 Panduan Mencetak Marker</h2>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: #8e8e93;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                ">×</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #007AFF; margin-bottom: 10px;">1. Download Marker</h3>
                <p style="color: #8e8e93; margin-bottom: 15px; line-height: 1.5;">
                    Klik tombol "📥 Download Marker" untuk mengunduh file PNG marker.
                </p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #007AFF; margin-bottom: 10px;">2. Ukuran Marker</h3>
                <ul style="color: #8e8e93; margin-bottom: 15px; line-height: 1.6;">
                    <li>• <strong>Ukuran Standar:</strong> 10cm x 10cm</li>
                    <li>• <strong>Ukuran Minimum:</strong> 8cm x 8cm</li>
                    <li>• <strong>Ukuran Maksimum:</strong> 15cm x 15cm</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #007AFF; margin-bottom: 10px;">3. Kertas yang Disarankan</h3>
                <ul style="color: #8e8e93; margin-bottom: 15px; line-height: 1.6;">
                    <li>• <strong>Kertas Foto:</strong> Kualitas terbaik, tahan lama</li>
                    <li>• <strong>Kertas HVS 80gsm:</strong> Kualitas baik, ekonomis</li>
                    <li>• <strong>Kertas Karton:</strong> Lebih tebal, lebih stabil</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #007AFF; margin-bottom: 10px;">4. Pengaturan Printer</h3>
                <ul style="color: #8e8e93; margin-bottom: 15px; line-height: 1.6;">
                    <li>• <strong>Quality:</strong> High/Photo Quality</li>
                    <li>• <strong>Color Mode:</strong> Color (Full Color)</li>
                    <li>• <strong>Paper Type:</strong> Photo Paper</li>
                    <li>• <strong>Margins:</strong> Minimum atau None</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #007AFF; margin-bottom: 10px;">5. Langkah-langkah Cetak</h3>
                <ol style="color: #8e8e93; margin-bottom: 15px; line-height: 1.6;">
                    <li>Buka file marker PNG dengan Paint/Preview</li>
                    <li>Set paper size ke A4</li>
                    <li>Set scale ke 100% (ukuran 10cm x 10cm)</li>
                    <li>Set quality ke High/Photo</li>
                    <li>Klik Print</li>
                </ol>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #007AFF; margin-bottom: 10px;">6. Tips Penggunaan</h3>
                <ul style="color: #8e8e93; margin-bottom: 15px; line-height: 1.6;">
                    <li>• Potong marker dengan rapi mengikuti border</li>
                    <li>• Letakkan di permukaan datar dan stabil</li>
                    <li>• Pastikan pencahayaan cukup (tidak terlalu terang/gelap)</li>
                    <li>• Jaga jarak kamera 20-50cm dari marker</li>
                </ul>
            </div>
            
            <div style="background: #2c2c2e; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <h4 style="color: #34C759; margin-bottom: 10px;">⚠️ Penting!</h4>
                <p style="color: #8e8e93; margin: 0; line-height: 1.5;">
                    Pastikan marker dicetak dengan kualitas tinggi dan ukuran yang tepat. 
                    Marker yang blur atau ukuran salah akan menyebabkan deteksi AR tidak akurat.
                </p>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: #8e8e93;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Tutup</button>
                <button onclick="this.parentElement.parentElement.remove(); window.arApp.downloadMarker(window.arApp.currentMarker);" style="
                    background: #007AFF;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px 25px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">Download Marker</button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Auto remove after 30 seconds
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.remove();
            }
        }, 30000);
    }
    
    // Populate mobile model gallery UI
    populateMobileGallery() {
        const galleryContainer = document.getElementById('mobile-model-gallery');
        if (!galleryContainer) return;
        
        galleryContainer.innerHTML = '';
        
        this.availableModels.forEach(model => {
            const modelElement = this.createMobileModelElement(model);
            galleryContainer.appendChild(modelElement);
        });
        
        console.log('Mobile model gallery populated');
    }
    
    // Create model element for mobile gallery
    createMobileModelElement(model) {
        const modelDiv = document.createElement('div');
        modelDiv.className = 'model-item';
        modelDiv.onclick = () => this.selectMobileModel(model.id);
        
        const thumbnail = this.createMobileThumbnailElement(model);
        
        modelDiv.innerHTML = `
            <div class="model-thumbnail">
                ${thumbnail}
            </div>
            <div class="model-info">
                <h4>${model.name}</h4>
                <p>${model.description}</p>
            </div>
        `;
        
        return modelDiv;
    }
    
    // Create thumbnail element with fallback for mobile
    createMobileThumbnailElement(model) {
        const thumbnailFile = model.thumbnail || 'default.png';
        return `<img src="Assets/thumbnail/${thumbnailFile}" alt="${model.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; font-size:24px;">${model.icon}</div>`;
    }
    
    // Select mobile model
    selectMobileModel(modelId) {
        const model = this.availableModels.find(m => m.id === modelId);
        if (!model) return;
        
        // Remove previous selection
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        event.currentTarget.classList.add('selected');
        this.selectedModel = model;
        
        // Load model if tracker is detected (no volume modal for AR mode)
        if (this.trackerDetected) {
            this.loadMobileModel(model.file, model.audio);
        }
    }

    // Toggle mobile sidebar
    toggleMobileSidebar() {
        const sidebar = document.getElementById('mobile-sidebar');
        const main = document.getElementById('mobile-main');
        const hamburger = document.getElementById('mobile-hamburger-menu');
        
        if (!sidebar || !main || !hamburger) return;
        
        this.sidebarVisible = !this.sidebarVisible;
        
        if (this.sidebarVisible) {
            sidebar.classList.add('show');
            main.classList.add('sidebar-open');
            hamburger.classList.add('active');
        } else {
            sidebar.classList.remove('show');
            main.classList.remove('sidebar-open');
            hamburger.classList.remove('active');
        }
    }
    
    // Toggle mobile object controls
    toggleMobileControls() {
        const controls = document.getElementById('mobile-object-controls');
        if (!controls) return;
        
        this.controlsVisible = !this.controlsVisible;
        
        if (this.controlsVisible) {
            controls.classList.add('show');
        } else {
            controls.classList.remove('show');
        }
    }
    
    // Update mobile scale
    updateMobileScale(value) {
        if (this.model) {
            this.model.scale.setScalar(parseFloat(value));
        }
    }
    
    // Update mobile rotation
    updateMobileRotation(axis, value) {
        if (this.model) {
            const radians = (parseFloat(value) * Math.PI) / 180;
            if (axis === 'x') {
                this.model.rotation.x = radians;
            } else if (axis === 'y') {
                this.model.rotation.y = radians;
            }
        }
    }
    
    // Update mobile lighting
    updateMobileLighting(value) {
        const intensity = parseFloat(value);
        
        // Update all lights in the scene
        this.scene.children.forEach(child => {
            if (child.isLight) {
                child.intensity = child.userData.originalIntensity * intensity;
            }
        });
    }
    
    // Toggle AR Features
    toggleARFeatures() {
        const toggle = document.getElementById('ar-features-toggle');
        
        if (this.axisLinesVisible && this.objectOverlayVisible) {
            // Hide AR features
            this.hideAxisLines();
            this.hideObjectOverlay();
            if (toggle) {
                toggle.textContent = 'Show AR';
                toggle.style.background = '#007AFF';
            }
        } else {
            // Show AR features
            this.showAxisLines();
            this.showObjectOverlay();
            if (toggle) {
                toggle.textContent = 'Hide AR';
                toggle.style.background = '#ff3b30';
            }
        }
    }
    
    // Simulate AR tracker detection
    simulateTrackerDetection() {
        // Start marker detection
        this.startMarkerDetection();
    }
    
    // Start marker detection
    startMarkerDetection() {
        console.log('Starting marker detection...');
        this.updateTrackerStatus('Looking for markers...', '🔍');
        
        // Simulate marker detection after 2 seconds
        setTimeout(() => {
            this.simulateMarkerDetection();
        }, 2000);
    }
    
    // Simulate marker detection
    simulateMarkerDetection() {
        // Simulate detecting Aztec marker first
        const aztecMarker = this.markerPatterns.get('aztec');
        if (aztecMarker) {
            this.detectMarker(aztecMarker);
        }
    }
    
    // Detect marker
    detectMarker(markerData) {
        console.log('Marker detected:', markerData.name);
        this.markerDetected = true;
        this.currentMarker = markerData;
        
        // Update tracker status
        this.updateTrackerStatus(`Marker detected: ${markerData.name}`, '✅');
        
        // Show AR features
        this.showAxisLines();
        this.showObjectOverlay();
        
        // Load model for this marker
        this.loadMobileModel(markerData.model, markerData.audio);
        
        // Show marker info
        this.showMarkerInfo(markerData);
    }
    
    // Show marker info
    showMarkerInfo(markerData) {
        // Create marker info overlay
        const markerInfo = document.createElement('div');
        markerInfo.id = 'marker-info';
        markerInfo.style.cssText = `
            position: absolute;
            top: 80px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 1000;
            max-width: 200px;
        `;
        
        markerInfo.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px; color: #007AFF;">${markerData.name}</div>
            <div style="color: #8e8e93; font-size: 12px;">Model: ${markerData.model}</div>
            <div style="color: #8e8e93; font-size: 12px;">Audio: ${markerData.audio}</div>
        `;
        
        // Add to canvas container
        const canvasContainer = document.getElementById('mobile-canvas-container');
        if (canvasContainer) {
            canvasContainer.appendChild(markerInfo);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (markerInfo && markerInfo.parentNode) {
                markerInfo.remove();
            }
        }, 5000);
    }
    
    // Enhanced fallback mode for non-WebXR devices
    enableFallbackMode() {
        console.log('Enabling fallback mode for non-WebXR devices');
        
        // Update AR instructions to reflect fallback mode
        this.updateARInstructionsForFallback();
        
        // Ensure all AR features work in fallback mode
        this.ensureFallbackFeatures();
        
        // Try to initialize camera feed
        this.setupCameraFeedFallback();
    }
    
    // Update AR instructions for fallback mode
    updateARInstructionsForFallback() {
        const instructionText = document.querySelector('.instruction-text h3');
        const instructionP = document.querySelector('.instruction-text p');
        
        if (instructionText) {
            instructionText.textContent = 'Marker-Based AR Mode';
        }
        
        if (instructionP) {
            instructionP.textContent = 'Point your camera at the AR marker to see the 3D model';
        }
    }
    
    // Show marker instructions
    showMarkerInstructions() {
        // Remove existing instructions if any
        const existingInstructions = document.getElementById('marker-instructions');
        if (existingInstructions) {
            existingInstructions.remove();
        }
        
        // Create marker instructions
        const instructions = document.createElement('div');
        instructions.id = 'marker-instructions';
        instructions.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 30px;
            border-radius: 20px;
            max-width: 350px;
            width: 90%;
            text-align: center;
            z-index: 3000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        instructions.innerHTML = `
            <div style="font-size: 48px; margin-bottom: 20px;">📱</div>
            <h2 style="margin-bottom: 15px; color: #007AFF;">Marker-Based AR</h2>
            <p style="margin-bottom: 20px; color: #8e8e93; line-height: 1.5;">
                To use AR features, you need to print and use the AR markers. Each marker corresponds to a specific 3D model.
            </p>
            <div style="background: #2c2c2e; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: left;">
                <h4 style="color: #007AFF; margin-bottom: 10px;">How to use:</h4>
                <ul style="color: #8e8e93; font-size: 14px; line-height: 1.6;">
                    <li>• Download the AR markers from the sidebar</li>
                    <li>• Print the markers on paper</li>
                    <li>• Point your camera at the marker</li>
                    <li>• The 3D model will appear on the marker</li>
                </ul>
            </div>
            <button onclick="this.parentElement.remove()" style="
                background: #007AFF;
                color: white;
                border: none;
                border-radius: 12px;
                padding: 12px 25px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            ">Got it!</button>
        `;
        
        document.body.appendChild(instructions);
        
        // Auto remove after 15 seconds
        setTimeout(() => {
            if (instructions && instructions.parentNode) {
                instructions.remove();
            }
        }, 15000);
    }
    
    // Ensure fallback features work properly
    ensureFallbackFeatures() {
        // Make sure drag controls are working
        this.setupMobileDragControls();
        
        // Ensure AR features are visible
        this.showAxisLines();
        this.showObjectOverlay();
        
        // Update performance metrics
        this.updatePerformanceMetrics();
    }
    
    // Update tracker status
    updateTrackerStatus(text, icon) {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (statusText) statusText.textContent = text;
        if (statusIndicator) statusIndicator.textContent = icon;
    }
    
    // AR Performance Metrics
    updatePerformanceMetrics() {
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        
        if (deltaTime >= 1000) { // Update every second
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.fpsHistory.push(this.fps);
            
            // Keep only last 10 FPS readings
            if (this.fpsHistory.length > 10) {
                this.fpsHistory.shift();
            }
            
            // Update FPS display
            const minFps = Math.min(...this.fpsHistory);
            const maxFps = Math.max(...this.fpsHistory);
            const fpsDisplay = document.getElementById('fps-display');
            const performanceFill = document.getElementById('performance-fill');
            
            if (fpsDisplay) {
                fpsDisplay.textContent = `${this.fps} FPS (${minFps}-${maxFps})`;
            }
            
            if (performanceFill) {
                // Calculate performance percentage (60 FPS = 100%)
                const performancePercent = Math.min((this.fps / 60) * 100, 100);
                performanceFill.style.width = `${performancePercent}%`;
            }
            
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    // AR Tracking Visualization
    showAxisLines() {
        const axisLines = document.getElementById('ar-axis-lines');
        if (axisLines) {
            axisLines.style.display = 'block';
            this.axisLinesVisible = true;
        }
    }
    
    hideAxisLines() {
        const axisLines = document.getElementById('ar-axis-lines');
        if (axisLines) {
            axisLines.style.display = 'none';
            this.axisLinesVisible = false;
        }
    }
    
    updateAxisLines() {
        if (!this.axisLinesVisible || !this.model) return;
        
        // Get model position and rotation
        const modelPosition = this.model.position;
        const modelRotation = this.model.rotation;
        
        // Calculate screen position (simplified)
        const canvas = document.getElementById('mobile-canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        // Center of canvas
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        // Update axis lines position
        const axisX = document.getElementById('axis-x');
        const axisY = document.getElementById('axis-y');
        const axisZ = document.getElementById('axis-z');
        
        if (axisX) {
            axisX.style.left = `${centerX}px`;
            axisX.style.top = `${centerY}px`;
            axisX.style.transform = `rotate(${modelRotation.y * 180 / Math.PI}deg)`;
        }
        
        if (axisY) {
            axisY.style.left = `${centerX}px`;
            axisY.style.top = `${centerY}px`;
            axisY.style.transform = `rotate(${90 + modelRotation.x * 180 / Math.PI}deg)`;
        }
        
        if (axisZ) {
            axisZ.style.left = `${centerX}px`;
            axisZ.style.top = `${centerY}px`;
            axisZ.style.transform = `rotate(${45 + modelRotation.z * 180 / Math.PI}deg)`;
        }
    }
    
    // AR Object Overlay
    showObjectOverlay() {
        const overlay = document.getElementById('ar-object-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            this.objectOverlayVisible = true;
        }
    }
    
    hideObjectOverlay() {
        const overlay = document.getElementById('ar-object-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            this.objectOverlayVisible = false;
        }
    }
    
    updateObjectOverlay() {
        if (!this.objectOverlayVisible || !this.model) return;
        
        // Get model bounding box
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        
        // Calculate overlay position and size
        const canvas = document.getElementById('mobile-canvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        const centerX = canvasRect.width / 2;
        const centerY = canvasRect.height / 2;
        
        const overlay = document.getElementById('ar-object-overlay');
        if (overlay) {
            const scale = Math.max(size.x, size.y, size.z) * 100;
            overlay.style.left = `${centerX - scale/2}px`;
            overlay.style.top = `${centerY - scale/2}px`;
            overlay.style.width = `${scale}px`;
            overlay.style.height = `${scale}px`;
        }
    }

    // Load mobile model from Assets folder
    loadMobileModel(modelFile = 'aztec.glb', audioFile = null) {
        const loader = new THREE.GLTFLoader();
        
        loader.load(`./Assets/${modelFile}`, (gltf) => {
            // Remove existing model
            if (this.model) {
                this.scene.remove(this.model);
            }
            
            // Add new model
            this.model = gltf.scene;
            
            // Scale and position model
            this.model.scale.setScalar(1);
            this.model.position.set(0, 0, 0);
            
            // Enable shadows
            this.model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Add to scene
            this.scene.add(this.model);
            
            // Fit model to view
            this.fitModelToView();
            
            console.log('Mobile model loaded successfully');
            
            // Update AR features after model is loaded
            this.updateAxisLines();
            this.updateObjectOverlay();
            
            // Load and play audio after model is loaded
            // Small delay to ensure model is fully rendered
            setTimeout(() => {
                this.loadMobileAudio(modelFile);
            }, 500);
            
        }, (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        }, (error) => {
            console.error('Error loading mobile model:', error);
            this.showNotification('Failed to load model: ' + error.message);
        });
    }

    // Fit model to view (mobile)
    fitModelToView() {
        if (!this.model) return;
        
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Make model larger and more proportional to screen
        const scale = 3.5 / maxDim; // Increased from 2 to 3.5
        
        this.model.scale.setScalar(scale);
        
        // Center model
        const center = box.getCenter(new THREE.Vector3());
        this.model.position.sub(center.multiplyScalar(scale));
        
        // Position model slightly lower for better visibility
        this.model.position.y -= 0.5;
    }

    // Show specific step
    showStep(step) {
        // Hide all screens
        const screens = ['scan-screen', 'modeling-screen', 'qr-screen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.style.display = 'none';
            }
        });
        
        // Show current step
        const currentScreen = document.getElementById(screens[step - 1]);
        if (currentScreen) {
            currentScreen.style.display = 'block';
        }
        
        this.currentStep = step;
        this.updateProgressIndicator();
    }

    // Next step
    nextStep() {
        if (this.currentStep < 3) {
            this.showStep(this.currentStep + 1);
        }
    }

    // Update progress indicator
    updateProgressIndicator() {
        const indicators = document.querySelectorAll('.progress-indicator');
        indicators.forEach(indicator => {
            indicator.textContent = `${this.currentStep}/3`;
        });
    }

    // Show loading
    showLoading(show, type = 'mobile') {
        const loadingId = type === 'mobile' ? 'mobile-loading' : 'desktop-loading';
        const loading = document.getElementById(loadingId);
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    }

    // Show notification
    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Handle window resize
    onWindowResize() {
        // Mobile canvas resize
        const mobileCanvas = document.getElementById('ar-canvas');
        if (mobileCanvas && this.camera && this.renderer) {
            const width = mobileCanvas.clientWidth;
            const height = mobileCanvas.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    // Enter AR Mode
    async enterARMode() {
        if (!this.isWebXRSupported) {
            this.showNotification('WebXR tidak didukung di browser ini! Using fallback mode.');
            this.enableFallbackMode();
            return;
        }

        if (!this.model) {
            this.showNotification('Silakan load model 3D terlebih dahulu!');
            return;
        }

        try {
            this.currentSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['dom-overlay'],
                domOverlay: { root: document.body }
            });

            this.isARMode = true;
            this.renderer.xr.enabled = true;
            this.renderer.xr.setSession(this.currentSession);
            
            // Setup AR scene
            this.setupARScene();
            
            // Show AR mode overlay
            this.showARMode();
            
            console.log('AR mode activated');
            
        } catch (error) {
            console.error('Failed to enter AR mode:', error);
            this.showNotification('Gagal masuk mode AR: ' + error.message + '. Using fallback mode.');
            this.enableFallbackMode();
        }
    }

    // Setup AR Scene
    setupARScene() {
        // Clear scene
        this.scene.clear();
        
        // Add lighting back
        this.setupLighting();
        
        // Add model if exists
        if (this.model) {
            this.scene.add(this.model);
        }
        
        // Set camera for AR
        this.camera.position.set(0, 0, 0);
    }

    // Show AR mode overlay
    showARMode() {
        const arMode = document.getElementById('ar-mode');
        if (arMode) {
            arMode.style.display = 'block';
        }
    }

    // Hide AR mode overlay
    hideARMode() {
        const arMode = document.getElementById('ar-mode');
        if (arMode) {
            arMode.style.display = 'none';
        }
    }

    // Exit AR Mode
    exitAR() {
        if (this.currentSession) {
            this.currentSession.end();
            this.currentSession = null;
        }
        
        this.isARMode = false;
        this.renderer.xr.enabled = false;
        
        // Hide AR mode overlay
        this.hideARMode();
        
        // Setup Non-AR scene
        this.setupNonARScene();
        
        console.log('AR mode exited');
    }

    // Setup Non-AR Scene
    setupNonARScene() {
        // Clear scene
        this.scene.clear();
        
        // Add lighting
        this.setupLighting();
        
        // Add model if exists
        if (this.model) {
            this.scene.add(this.model);
        }
        
        // Set camera for Non-AR
        this.camera.position.set(0, 0, 5);
    }

    // Place model in AR
    placeModel() {
        if (!this.isARMode || !this.model) return;
        
        // Simple placement - in real implementation, this would use hit testing
        this.model.position.set(0, 0, -2);
        this.isModelPlaced = true;
        
        this.showNotification('Model placed in AR space!');
    }

    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Render mobile scene
        if (this.renderer && this.scene && this.camera) {
            // Rotate model in mobile mode
            if (this.model && this.currentStep === 2 && !this.isARMode) {
                this.model.rotation.y += 0.005;
            }
            
            // Update AR features
            if (this.trackerDetected && this.model) {
                this.updateAxisLines();
                this.updateObjectOverlay();
            }
            
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Update UI based on current state
    updateUI() {
        // Update progress indicator
        this.updateProgressIndicator();
    }

    // Audio system for mobile
    loadMobileAudio(modelFile) {
        // Find corresponding audio file
        const model = this.availableModels.find(m => m.file === modelFile);
        if (!model || !model.audio) {
            console.log('No audio file found for model:', modelFile);
            return;
        }
        
        // Stop current audio
        this.stopMobileAudio();
        
        console.log('Loading mobile audio:', model.audio);
        
        // Create new audio element
        this.currentAudio = new Audio(`./Vo/${model.audio}`);
        this.currentAudio.preload = 'auto';
        this.currentAudio.volume = 0.7; // Slightly higher volume for mobile
        
        // Set up event listeners
        this.currentAudio.addEventListener('loadeddata', () => {
            console.log('Mobile audio loaded successfully:', model.audio);
            // Auto-play audio after model is loaded
            this.playMobileAudio();
        });
        
        this.currentAudio.addEventListener('canplaythrough', () => {
            console.log('Mobile audio ready to play:', model.audio);
            // Alternative trigger for audio play
            if (!this.isAudioPlaying) {
                this.playMobileAudio();
            }
        });
        
        this.currentAudio.addEventListener('error', (e) => {
            console.error('Error loading mobile audio:', e);
        });
        
        this.currentAudio.addEventListener('ended', () => {
            this.isAudioPlaying = false;
            console.log('Mobile audio ended');
        });
    }
    
    playMobileAudio() {
        if (!this.currentAudio) {
            console.log('No mobile audio to play');
            return;
        }
        
        // Check if audio context is enabled
        if (!this.audioContextEnabled) {
            console.log('Audio context not enabled, showing play button');
            this.showAudioPlayButton();
            return;
        }
        
        this.currentAudio.play().then(() => {
            this.isAudioPlaying = true;
            const modelName = this.availableModels.find(m => m.file === this.currentAudio?.src.split('/').pop()?.replace('.mp3', '.glb'))?.name;
            console.log('Mobile audio playing:', modelName);
        }).catch(error => {
            console.error('Error playing mobile audio:', error);
            // Audio might not play due to browser autoplay policy
            if (error.name === 'NotAllowedError') {
                console.log('Mobile audio autoplay blocked by browser policy');
                this.showAudioPlayButton();
            }
        });
    }
    
    // Show audio play button when autoplay is blocked
    showAudioPlayButton() {
        // Remove existing audio button if any
        const existingButton = document.getElementById('audio-play-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create audio play button
        const audioButton = document.createElement('button');
        audioButton.id = 'audio-play-button';
        audioButton.innerHTML = '🔊 Play Audio';
        audioButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #007AFF;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 24px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            z-index: 2000;
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
            transition: all 0.3s ease;
        `;
        
        // Add click event to play audio
        audioButton.addEventListener('click', () => {
            if (this.currentAudio) {
                // Enable audio context first
                this.enableAudioContext();
                
                this.currentAudio.play().then(() => {
                    console.log('Mobile audio started after user interaction');
                    audioButton.remove();
                }).catch(error => {
                    console.error('Error playing mobile audio after interaction:', error);
                    // Show error message
                    audioButton.innerHTML = '❌ Audio Error';
                    audioButton.style.background = '#ff3b30';
                    setTimeout(() => {
                        audioButton.remove();
                    }, 3000);
                });
            }
        });
        
        // Add hover effect
        audioButton.addEventListener('mouseenter', () => {
            audioButton.style.background = '#0056b3';
            audioButton.style.transform = 'translateX(-50%) scale(1.05)';
        });
        
        audioButton.addEventListener('mouseleave', () => {
            audioButton.style.background = '#007AFF';
            audioButton.style.transform = 'translateX(-50%) scale(1)';
        });
        
        // Add to document
        document.body.appendChild(audioButton);
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (audioButton && audioButton.parentNode) {
                audioButton.remove();
            }
        }, 10000);
    }
    
    stopMobileAudio() {
        if (!this.currentAudio) return;
        
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.isAudioPlaying = false;
    }



    // Cleanup
    cleanup() {
        if (this.currentSession) {
            this.currentSession.end();
        }
        this.stopMobileAudio();
    }
}

// Global functions for mobile navigation
function resetApp() {
    const app = window.arApp;
    if (app) {
        app.currentStep = 1;
        app.showStep(1);
        app.showNotification('App reset to initial state');
    }
}

function startCapture() {
    const app = window.arApp;
    if (app) {
        // Start capture directly (no volume modal for AR mode)
        app.showLoading(true, 'mobile');
        app.showNotification('Starting object capture...');
        
        // Load default model and simulate capture process
        app.loadMobileModel();
        
        setTimeout(() => {
            app.showLoading(false, 'mobile');
            app.nextStep();
        }, 2000);
    }
}

function nextStep() {
    const app = window.arApp;
    if (app) {
        app.nextStep();
    }
}

function viewInAR() {
    const app = window.arApp;
    if (app) {
        app.enterARMode();
    }
}

function exitAR() {
    const app = window.arApp;
    if (app) {
        app.exitAR();
    }
}

function placeModel() {
    const app = window.arApp;
    if (app) {
        app.placeModel();
    }
}


// Mobile interface functions
function toggleMobileSidebar() {
    const app = window.arApp;
    if (app) {
        app.toggleMobileSidebar();
    }
}

function toggleMobileControls() {
    const app = window.arApp;
    if (app) {
        app.toggleMobileControls();
    }
}

function updateMobileScale(value) {
    const app = window.arApp;
    if (app) {
        app.updateMobileScale(value);
    }
}

function updateMobileRotation(axis, value) {
    const app = window.arApp;
    if (app) {
        app.updateMobileRotation(axis, value);
    }
}

function updateMobileLighting(value) {
    const app = window.arApp;
    if (app) {
        app.updateMobileLighting(value);
    }
}

function toggleARFeatures() {
    const app = window.arApp;
    if (app) {
        app.toggleARFeatures();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arApp = new ARModelViewer();
});
