// Aplikasi AR Model 3D Viewer - Sesuai Referensi
class ARModelViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mobileRenderer = null;
        this.desktopRenderer = null;
        this.model = null;
        this.isMobile = false;
        this.isARMode = false;
        this.isWebXRSupported = false;
        this.currentSession = null;
        this.currentStep = 1; // 1: Scan, 2: Modeling, 3: QR Codes
        
        // Object control variables
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.autoRotate = true;
        this.rotationSpeed = 0.005;
        this.zoomLevel = 1;
        this.originalScale = 1;
        this.lightingIntensity = 1;
        
        // Light references
        this.desktopLights = [];
        this.mobileLights = [];
        
        // Model gallery
        this.availableModels = [];
        this.selectedModel = null;
        this.sidebarVisible = true;
        
        // Audio system
        this.currentAudio = null;
        this.audioContext = null;
        this.isAudioPlaying = false;
        
        this.init();
    }

    init() {
        this.detectDevice();
        this.setupEventListeners();
        
        // Wait for DOM to be fully loaded before initializing canvas
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeThreeJS();
            });
        } else {
            this.initializeThreeJS();
        }
        
        this.updateTime();
        this.updateUI();
        this.loadModelGallery();
    }

    // Deteksi perangkat mobile atau desktop
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
        const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
        
        this.isMobile = isMobileDevice || isTablet;
        
        // Show appropriate container
        const mobileContainer = document.getElementById('mobile-container');
        const desktopContainer = document.getElementById('desktop-container');
        
        if (this.isMobile) {
            mobileContainer.style.display = 'block';
            desktopContainer.style.display = 'none';
        } else {
            mobileContainer.style.display = 'none';
            desktopContainer.style.display = 'flex';
        }

        console.log('Device detected:', this.isMobile ? 'Mobile' : 'Desktop');
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
        
        // Setup desktop canvas drag controls
        this.setupDesktopDragControls();
    }

    // Setup desktop drag controls
    setupDesktopDragControls() {
        const canvas = document.getElementById('desktop-canvas');
        if (!canvas) return;
        
        // Mouse events
        canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        canvas.addEventListener('mouseup', () => this.onMouseUp());
        canvas.addEventListener('mouseleave', () => this.onMouseUp());
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (event) => this.onTouchStart(event));
        canvas.addEventListener('touchmove', (event) => this.onTouchMove(event));
        canvas.addEventListener('touchend', () => this.onTouchEnd());
        
        // Wheel event for zoom
        canvas.addEventListener('wheel', (event) => this.onWheel(event));
    }

    // Mouse event handlers
    onMouseDown(event) {
        this.isDragging = true;
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseMove(event) {
        if (!this.isDragging || !this.desktopModel) return;
        
        const deltaMove = {
            x: event.clientX - this.previousMousePosition.x,
            y: event.clientY - this.previousMousePosition.y
        };
        
        // Rotate model based on mouse movement
        this.desktopModel.rotation.y += deltaMove.x * 0.01;
        this.desktopModel.rotation.x += deltaMove.y * 0.01;
        
        this.previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }

    onMouseUp() {
        this.isDragging = false;
    }

    // Touch event handlers
    onTouchStart(event) {
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
    }

    onTouchMove(event) {
        if (!this.isDragging || !this.desktopModel || event.touches.length !== 1) return;
        
        const deltaMove = {
            x: event.touches[0].clientX - this.previousMousePosition.x,
            y: event.touches[0].clientY - this.previousMousePosition.y
        };
        
        // Rotate model based on touch movement
        this.desktopModel.rotation.y += deltaMove.x * 0.01;
        this.desktopModel.rotation.x += deltaMove.y * 0.01;
        
        this.previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }

    onTouchEnd() {
        this.isDragging = false;
    }

    // Wheel event for zoom
    onWheel(event) {
        event.preventDefault();
        
        if (!this.desktopModel) return;
        
        const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
        this.zoomLevel *= zoomFactor;
        this.zoomLevel = Math.max(0.5, Math.min(3, this.zoomLevel));
        
        this.desktopModel.scale.setScalar(this.originalScale * this.zoomLevel);
        
        // Update zoom slider
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.value = this.zoomLevel;
        }
    }

    // Initialize Three.js
    initializeThreeJS() {
        // Initialize mobile canvas
        this.initializeMobileCanvas();
        
        // Initialize desktop canvas
        this.initializeDesktopCanvas();
        
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
        this.mobileRenderer = new THREE.WebGLRenderer({ 
            canvas: mobileCanvas, 
            antialias: true,
            alpha: true 
        });
        this.mobileRenderer.setSize(mobileCanvas.clientWidth, mobileCanvas.clientHeight);
        this.mobileRenderer.setPixelRatio(window.devicePixelRatio);
        this.mobileRenderer.shadowMap.enabled = true;
        this.mobileRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Lighting
        this.setupLighting();
    }

    // Initialize desktop canvas
    initializeDesktopCanvas() {
        const desktopCanvas = document.getElementById('desktop-canvas');
        if (!desktopCanvas) return;
        
        // Get container dimensions
        const container = desktopCanvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Set canvas size to match container
        desktopCanvas.style.width = containerWidth + 'px';
        desktopCanvas.style.height = containerHeight + 'px';
        desktopCanvas.width = containerWidth;
        desktopCanvas.height = containerHeight;
        
        // Desktop Scene
        this.desktopScene = new THREE.Scene();
        this.desktopScene.background = new THREE.Color(0xffffff);
        
        // Desktop Camera
        this.desktopCamera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
        this.desktopCamera.position.set(0, 0, 5);
        
        // Desktop Renderer
        this.desktopRenderer = new THREE.WebGLRenderer({ 
            canvas: desktopCanvas, 
            antialias: true,
            alpha: false 
        });
        this.desktopRenderer.setSize(containerWidth, containerHeight);
        this.desktopRenderer.setPixelRatio(window.devicePixelRatio);
        this.desktopRenderer.shadowMap.enabled = true;
        this.desktopRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Desktop Lighting
        this.setupDesktopLighting();
    }

    // Setup lighting for mobile
    setupLighting() {
        if (!this.scene) return;
        
        // Clear existing lights
        this.scene.children = this.scene.children.filter(child => !child.isLight);
        this.mobileLights = [];
        
        // Ambient light - increased intensity for better overall lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        this.scene.add(ambientLight);
        this.mobileLights.push({ light: ambientLight, baseIntensity: 1.0 });
        
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
        this.scene.add(directionalLight);
        this.mobileLights.push({ light: directionalLight, baseIntensity: 1.5 });
        
        // Secondary directional light from opposite side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-5, 5, -5);
        this.scene.add(directionalLight2);
        this.mobileLights.push({ light: directionalLight2, baseIntensity: 0.8 });
        
        // Point light for additional illumination
        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(0, 5, 0);
        pointLight.distance = 20;
        this.scene.add(pointLight);
        this.mobileLights.push({ light: pointLight, baseIntensity: 1.2 });
        
        // Hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.6);
        this.scene.add(hemisphereLight);
        this.mobileLights.push({ light: hemisphereLight, baseIntensity: 0.6 });
    }

    // Setup lighting for desktop
    setupDesktopLighting() {
        if (!this.desktopScene) return;
        
        // Clear existing lights
        this.desktopScene.children = this.desktopScene.children.filter(child => !child.isLight);
        this.desktopLights = [];
        
        // Ambient light - increased intensity for better overall lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.desktopScene.add(ambientLight);
        this.desktopLights.push({ light: ambientLight, baseIntensity: 1.2 });
        
        // Main directional light - increased intensity and better positioning
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
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
        this.desktopScene.add(directionalLight);
        this.desktopLights.push({ light: directionalLight, baseIntensity: 2.0 });
        
        // Secondary directional light from opposite side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight2.position.set(-5, 5, -5);
        this.desktopScene.add(directionalLight2);
        this.desktopLights.push({ light: directionalLight2, baseIntensity: 1.0 });
        
        // Point light for additional illumination
        const pointLight = new THREE.PointLight(0xffffff, 1.5);
        pointLight.position.set(0, 5, 0);
        pointLight.distance = 20;
        this.desktopScene.add(pointLight);
        this.desktopLights.push({ light: pointLight, baseIntensity: 1.5 });
        
        // Hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.8);
        this.desktopScene.add(hemisphereLight);
        this.desktopLights.push({ light: hemisphereLight, baseIntensity: 0.8 });
        
        // Spot light for focused lighting
        const spotLight = new THREE.SpotLight(0xffffff, 1.0);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 6;
        spotLight.penumbra = 0.1;
        spotLight.decay = 2;
        spotLight.distance = 20;
        this.desktopScene.add(spotLight);
        this.desktopLights.push({ light: spotLight, baseIntensity: 1.0 });
    }

    // Check WebXR support
    async checkWebXRSupport() {
        if ('xr' in navigator) {
            try {
                this.isWebXRSupported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log('WebXR AR support:', this.isWebXRSupported);
            } catch (error) {
                console.log('WebXR not supported:', error);
                this.isWebXRSupported = false;
            }
        }
    }

    // Enter AR Mode
    async enterARMode() {
        if (!this.isMobile) {
            this.showNotification('Mode AR hanya tersedia di perangkat mobile!');
            return;
        }

        if (!this.isWebXRSupported) {
            this.showNotification('WebXR tidak didukung di browser ini!');
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
            
            // Update UI
            this.updateUI();
            
            console.log('AR mode activated');
            
        } catch (error) {
            console.error('Failed to enter AR mode:', error);
            this.showNotification('Gagal masuk mode AR: ' + error.message);
        }
    }

    // Enter Non-AR Mode
    enterNonARMode() {
        if (this.currentSession) {
            this.currentSession.end();
            this.currentSession = null;
        }
        
        this.isARMode = false;
        this.renderer.xr.enabled = false;
        
        // Setup Non-AR scene
        this.setupNonARScene();
        
        // Update UI
        this.updateUI();
        
        console.log('Non-AR mode activated');
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

    // Setup Non-AR Scene
    setupNonARScene() {
        // Clear scene
        this.scene.clear();
        
        // Add white background
        this.scene.background = new THREE.Color(0xffffff);
        
        // Add lighting
        this.setupLighting();
        
        // Add model if exists
        if (this.model) {
            this.scene.add(this.model);
        }
        
        // Set camera for Non-AR
        this.camera.position.set(0, 0, 5);
    }


    // Update UI based on current state
    updateUI() {
        // Update progress indicator
        this.updateProgressIndicator();
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
        const mobileCanvas = document.getElementById('mobile-canvas');
        if (mobileCanvas && this.camera && this.mobileRenderer) {
            const width = mobileCanvas.clientWidth;
            const height = mobileCanvas.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.mobileRenderer.setSize(width, height);
        }
        
        // Desktop canvas resize - use the dedicated method
        this.resizeDesktopCanvas();
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

    // Load model gallery
    async loadModelGallery() {
        try {
            const response = await fetch('./Assets/models.json');
            this.availableModels = await response.json();
            this.renderModelGallery();
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
                    thumbnail: "aztec.png"
                },
                {
                    id: "jagannath_puri_temple",
                    name: "Jagannath Puri Temple",
                    file: "jagannath_puri_temple_model.glb",
                    description: "Sacred Hindu temple architecture",
                    icon: "🕉️",
                    category: "Religious",
                    thumbnail: "jagannath_puri_temple_model.png"
                }
            ];
            this.renderModelGallery();
        }
    }

    // Render model gallery
    renderModelGallery() {
        const gallery = document.getElementById('model-gallery');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        this.availableModels.forEach(model => {
            const modelItem = document.createElement('div');
            modelItem.className = 'model-item';
            modelItem.onclick = () => this.selectModel(model);
            
            // Create thumbnail element
            const thumbnailElement = this.createThumbnailElement(model);
            
            modelItem.innerHTML = `
                <div class="model-preview">${thumbnailElement}</div>
                <div class="model-info">
                    <h4>${model.name}</h4>
                    <p>${model.description}</p>
                    <p style="color: #007AFF; font-size: 11px;">${model.category}</p>
                </div>
                <button class="model-load-btn" onclick="event.stopPropagation(); loadSelectedModel('${model.id}')">
                    Load Model
                </button>
            `;
            
            gallery.appendChild(modelItem);
        });
    }

    // Create thumbnail element for model
    createThumbnailElement(model) {
        const thumbnailName = model.thumbnail || 'default.png';
        const thumbnailPath = `./Assets/thumbnail/${thumbnailName}`;
        
        // Return HTML string for img element with error handling
        return `
            <img class="model-thumbnail" 
                 src="${thumbnailPath}" 
                 alt="${model.name}"
                 onerror="this.onerror=null; 
                          if('${thumbnailName}' !== 'default.png') {
                              this.src='./Assets/thumbnail/default.png';
                              this.onerror=function(){this.style.display='none'; this.parentNode.innerHTML='<div class=\\'model-thumbnail-error\\'>${model.icon}</div>';};
                          } else {
                              this.style.display='none'; 
                              this.parentNode.innerHTML='<div class=\\'model-thumbnail-error\\'>${model.icon}</div>';
                          }">
        `;
    }

    // Select model
    selectModel(model) {
        // Remove previous selection
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked item
        event.currentTarget.classList.add('selected');
        this.selectedModel = model;
    }

    // Load selected model
    loadSelectedModel(modelId) {
        const model = this.availableModels.find(m => m.id === modelId);
        if (!model) return;
        
        this.selectedModel = model;
        this.loadDesktopModel(model.file, model.audio);
    }

    // Audio system methods
    loadAudio(audioFile) {
        if (!audioFile) {
            console.log('No audio file provided');
            return;
        }
        
        // Stop current audio
        this.stopAudio();
        
        console.log('Loading desktop audio:', audioFile);
        
        // Create new audio element
        this.currentAudio = new Audio(`./Vo/${audioFile}`);
        this.currentAudio.preload = 'auto';
        this.currentAudio.volume = 0.5;
        
        // Set up event listeners
        this.currentAudio.addEventListener('loadeddata', () => {
            console.log('Desktop audio loaded successfully:', audioFile);
            // Auto-play audio after model is loaded
            this.playAudio();
        });
        
        this.currentAudio.addEventListener('canplaythrough', () => {
            console.log('Desktop audio ready to play:', audioFile);
            // Alternative trigger for audio play
            if (!this.isAudioPlaying) {
                this.playAudio();
            }
        });
        
        this.currentAudio.addEventListener('error', (e) => {
            console.error('Error loading desktop audio:', e);
        });
        
        this.currentAudio.addEventListener('ended', () => {
            this.isAudioPlaying = false;
            console.log('Desktop audio ended');
        });
    }
    
    playAudio() {
        if (!this.currentAudio) {
            console.log('No audio to play');
            return;
        }
        
        this.currentAudio.play().then(() => {
            this.isAudioPlaying = true;
            console.log('Desktop audio playing:', this.selectedModel?.name);
        }).catch(error => {
            console.error('Error playing desktop audio:', error);
            // Audio might not play due to browser autoplay policy
            if (error.name === 'NotAllowedError') {
                console.log('Audio autoplay blocked by browser policy');
            }
        });
    }
    
    stopAudio() {
        if (!this.currentAudio) return;
        
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.isAudioPlaying = false;
    }


    // Load desktop model from Assets folder
    loadDesktopModel(modelFile = 'aztec.glb', audioFile = null) {
        this.showLoading(true, 'desktop');
        
        // Ensure canvas is properly sized before loading model
        this.resizeDesktopCanvas();
        
        const loader = new THREE.GLTFLoader();
        
        loader.load(`./Assets/${modelFile}`, (gltf) => {
            // Remove existing model
            if (this.desktopModel) {
                this.desktopScene.remove(this.desktopModel);
            }
            
            // Add new model
            this.desktopModel = gltf.scene;
            
            // Scale and position model
            this.desktopModel.scale.setScalar(1);
            this.desktopModel.position.set(0, 0, 0);
            
            // Enable shadows
            this.desktopModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            // Add to scene
            this.desktopScene.add(this.desktopModel);
            
            // Fit model to view
            this.fitDesktopModelToView();
            
            this.showLoading(false, 'desktop');
            this.showNotification('Model loaded successfully!');
            
            console.log('Desktop model loaded successfully');
            
            // Load and play audio after model is loaded
            if (audioFile) {
                // Small delay to ensure model is fully rendered
                setTimeout(() => {
                    this.loadAudio(audioFile);
                }, 500);
            }
            
        }, (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        }, (error) => {
            console.error('Error loading desktop model:', error);
            this.showLoading(false, 'desktop');
            this.showNotification('Failed to load model: ' + error.message);
        });
    }

    // Resize desktop canvas to match container
    resizeDesktopCanvas() {
        const desktopCanvas = document.getElementById('desktop-canvas');
        if (!desktopCanvas || !this.desktopRenderer || !this.desktopCamera) return;
        
        const container = desktopCanvas.parentElement;
        let containerWidth, containerHeight;
        
        // Check if sidebar is closed (full screen mode)
        if (container.classList.contains('sidebar-closed')) {
            containerWidth = window.innerWidth;
            containerHeight = window.innerHeight;
        } else {
            containerWidth = container.clientWidth;
            containerHeight = container.clientHeight;
        }
        
        // Update canvas size to match container
        desktopCanvas.style.width = containerWidth + 'px';
        desktopCanvas.style.height = containerHeight + 'px';
        desktopCanvas.width = containerWidth;
        desktopCanvas.height = containerHeight;
        
        // Update camera and renderer
        this.desktopCamera.aspect = containerWidth / containerHeight;
        this.desktopCamera.updateProjectionMatrix();
        this.desktopRenderer.setSize(containerWidth, containerHeight);
    }

    // Fit desktop model to view
    fitDesktopModelToView() {
        if (!this.desktopModel) return;
        
        const box = new THREE.Box3().setFromObject(this.desktopModel);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        
        // Make model larger and more proportional to screen
        const scale = 4 / maxDim; // Increased from 2 to 4 for desktop
        
        this.desktopModel.scale.setScalar(scale);
        this.originalScale = scale; // Store original scale for zoom control
        
        // Center model
        const center = box.getCenter(new THREE.Vector3());
        this.desktopModel.position.sub(center.multiplyScalar(scale));
        
        // Position model slightly lower for better visibility
        this.desktopModel.position.y -= 0.3;
    }

    // Reset desktop
    resetDesktop() {
        if (this.desktopModel) {
            this.desktopScene.remove(this.desktopModel);
            this.desktopModel = null;
        }
        
        this.showNotification('Desktop view reset');
    }

    // Toggle sidebar visibility
    toggleSidebar() {
        const sidebar = document.getElementById('desktop-sidebar');
        const hamburger = document.getElementById('hamburger-menu');
        const main = document.querySelector('.desktop-main');
        const canvasContainer = document.querySelector('.desktop-canvas-container');
        
        if (!sidebar || !hamburger || !main || !canvasContainer) return;
        
        this.sidebarVisible = !this.sidebarVisible;
        
        if (this.sidebarVisible) {
            sidebar.classList.remove('hidden');
            hamburger.classList.remove('sidebar-hidden');
            hamburger.textContent = '☰';
            main.classList.remove('sidebar-closed');
            canvasContainer.classList.remove('sidebar-closed');
        } else {
            sidebar.classList.add('hidden');
            hamburger.classList.add('sidebar-hidden');
            hamburger.textContent = '☰';
            main.classList.add('sidebar-closed');
            canvasContainer.classList.add('sidebar-closed');
        }
        
        // Resize canvas after transition
        setTimeout(() => {
            this.resizeDesktopCanvas();
        }, 300);
    }

    // Load mobile model from Assets folder
    loadMobileModel() {
        const loader = new THREE.GLTFLoader();
        
        loader.load('./Assets/aztec.glb', (gltf) => {
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
            
        }, (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
        }, (error) => {
            console.error('Error loading mobile model:', error);
            this.showNotification('Failed to load default model: ' + error.message);
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

    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Render mobile scene
        if (this.mobileRenderer && this.scene && this.camera) {
            // Rotate model in mobile mode
            if (this.model && this.currentStep === 2) {
                this.model.rotation.y += 0.005;
            }
            this.mobileRenderer.render(this.scene, this.camera);
        }
        
        // Render desktop scene
        if (this.desktopRenderer && this.desktopScene && this.desktopCamera) {
            // Rotate model in desktop mode if auto rotate is enabled
            if (this.desktopModel && this.autoRotate && !this.isDragging) {
                this.desktopModel.rotation.y += this.rotationSpeed;
            }
            this.desktopRenderer.render(this.desktopScene, this.desktopCamera);
        }
    }

    // Cleanup
    cleanup() {
        if (this.currentSession) {
            this.currentSession.end();
        }
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

function loadDesktopModel() {
    const app = window.arApp;
    if (app) {
        app.loadDesktopModel();
    }
}

function resetDesktop() {
    const app = window.arApp;
    if (app) {
        app.resetDesktop();
    }
}

// Object control functions
function toggleObjectControls() {
    const controls = document.getElementById('object-controls');
    const toggle = document.getElementById('controls-toggle');
    
    if (controls.classList.contains('open')) {
        controls.classList.remove('open');
        toggle.textContent = '⚙️';
    } else {
        controls.classList.add('open');
        toggle.textContent = '✕';
    }
}

function updateZoom(value) {
    const app = window.arApp;
    if (app && app.desktopModel) {
        app.zoomLevel = parseFloat(value);
        app.desktopModel.scale.setScalar(app.originalScale * app.zoomLevel);
    }
}

function updateRotationSpeed(value) {
    const app = window.arApp;
    if (app) {
        app.rotationSpeed = parseFloat(value);
    }
}

function resetPosition() {
    const app = window.arApp;
    if (app && app.desktopModel) {
        app.desktopModel.rotation.set(0, 0, 0);
        app.desktopModel.position.set(0, -0.3, 0);
        app.zoomLevel = 1;
        app.desktopModel.scale.setScalar(app.originalScale);
        
        // Update sliders
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.value = 1;
        }
    }
}

function centerObject() {
    const app = window.arApp;
    if (app && app.desktopModel) {
        app.desktopModel.position.set(0, -0.3, 0);
    }
}

function toggleAutoRotate() {
    const app = window.arApp;
    const btn = document.getElementById('auto-rotate-btn');
    
    if (app) {
        app.autoRotate = !app.autoRotate;
        
        if (app.autoRotate) {
            btn.textContent = 'ON';
            btn.classList.add('active');
        } else {
            btn.textContent = 'OFF';
            btn.classList.remove('active');
        }
    }
}

function updateLighting(value) {
    const app = window.arApp;
    if (app) {
        app.lightingIntensity = parseFloat(value);
        
        // Update desktop lights
        if (app.desktopLights) {
            app.desktopLights.forEach(lightData => {
                lightData.light.intensity = lightData.baseIntensity * app.lightingIntensity;
            });
        }
        
        // Update mobile lights
        if (app.mobileLights) {
            app.mobileLights.forEach(lightData => {
                lightData.light.intensity = lightData.baseIntensity * app.lightingIntensity;
            });
        }
    }
}

function toggleSidebar() {
    const app = window.arApp;
    if (app) {
        app.toggleSidebar();
    }
}

function loadSelectedModel(modelId) {
    const app = window.arApp;
    if (app) {
        app.loadSelectedModel(modelId);
    }
}



// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arApp = new ARModelViewer();
});
