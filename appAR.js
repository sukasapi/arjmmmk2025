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
        // Simulate tracker detection after 3 seconds
        setTimeout(() => {
            this.trackerDetected = true;
            this.updateTrackerStatus('Tracker detected!', '✅');
            
            // Show AR features
            this.showAxisLines();
            this.showObjectOverlay();
            
            // Load default model if one is selected (no volume modal for AR mode)
            if (this.selectedModel) {
                this.loadMobileModel(this.selectedModel.file, this.selectedModel.audio);
            } else {
                // Load default model
                this.loadMobileModel('aztec.glb', 'aztec.mp3');
            }
        }, 3000);
    }
    
    // Enhanced fallback mode for non-WebXR devices
    enableFallbackMode() {
        console.log('Enabling fallback mode for non-WebXR devices');
        
        // Update AR instructions to reflect fallback mode
        this.updateARInstructionsForFallback();
        
        // Ensure all AR features work in fallback mode
        this.ensureFallbackFeatures();
    }
    
    // Update AR instructions for fallback mode
    updateARInstructionsForFallback() {
        const instructionText = document.querySelector('.instruction-text h3');
        const instructionP = document.querySelector('.instruction-text p');
        
        if (instructionText) {
            instructionText.textContent = 'AR Mode (Fallback)';
        }
        
        if (instructionP) {
            instructionP.textContent = 'Simulated AR experience - drag to rotate, pinch to zoom';
        }
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
