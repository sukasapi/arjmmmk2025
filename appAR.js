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
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeThreeJS();
        this.updateTime();
        this.updateUI();
        this.loadModelGallery();
        this.simulateTrackerDetection();
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
        
        // Load model if tracker is detected
        if (this.trackerDetected) {
            // Show volume modal before loading model
            this.showVolumeModal(() => {
                this.loadMobileModel(model.file, model.audio);
            });
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
    
    // Simulate AR tracker detection
    simulateTrackerDetection() {
        // Simulate tracker detection after 3 seconds
        setTimeout(() => {
            this.trackerDetected = true;
            this.updateTrackerStatus('Tracker detected!', '✅');
            
            // Show volume modal before loading model
            this.showVolumeModal(() => {
                // Load default model if one is selected
                if (this.selectedModel) {
                    this.loadMobileModel(this.selectedModel.file, this.selectedModel.audio);
                } else {
                    // Load default model
                    this.loadMobileModel('aztec.glb', 'aztec.mp3');
                }
            });
        }, 3000);
    }
    
    // Update tracker status
    updateTrackerStatus(text, icon) {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (statusText) statusText.textContent = text;
        if (statusIndicator) statusIndicator.textContent = icon;
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
            
            // Hide volume modal after model is loaded
            this.hideVolumeModal();
            
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
            
            // Show AR mode overlay
            this.showARMode();
            
            console.log('AR mode activated');
            
        } catch (error) {
            console.error('Failed to enter AR mode:', error);
            this.showNotification('Gagal masuk mode AR: ' + error.message);
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
        
        // Render mobile scene
        if (this.renderer && this.scene && this.camera) {
            // Rotate model in mobile mode
            if (this.model && this.currentStep === 2 && !this.isARMode) {
                this.model.rotation.y += 0.005;
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
        
        this.currentAudio.play().then(() => {
            this.isAudioPlaying = true;
            const modelName = this.availableModels.find(m => m.file === this.currentAudio?.src.split('/').pop()?.replace('.mp3', '.glb'))?.name;
            console.log('Mobile audio playing:', modelName);
        }).catch(error => {
            console.error('Error playing mobile audio:', error);
            // Audio might not play due to browser autoplay policy
            if (error.name === 'NotAllowedError') {
                console.log('Mobile audio autoplay blocked by browser policy');
            }
        });
    }
    
    stopMobileAudio() {
        if (!this.currentAudio) return;
        
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.isAudioPlaying = false;
    }

    // Volume modal methods
    showVolumeModal(callback) {
        const modal = document.getElementById('volume-modal');
        if (!modal) return;
        
        // Store callback for when modal is closed
        this.volumeModalCallback = callback;
        
        // Show modal
        modal.classList.add('show');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    closeVolumeModal() {
        const modal = document.getElementById('volume-modal');
        const loading = document.getElementById('volume-modal-loading');
        const btn = modal.querySelector('.volume-modal-btn');
        const message = modal.querySelector('.volume-modal-message');
        
        if (!modal) return;
        
        // Show loading state
        if (loading) {
            loading.style.display = 'block';
        }
        if (btn) {
            btn.style.display = 'none';
        }
        if (message) {
            message.textContent = 'Model sedang dimuat, harap tunggu...';
        }
        
        // Execute callback if exists
        if (this.volumeModalCallback) {
            this.volumeModalCallback();
            this.volumeModalCallback = null;
        }
    }
    
    // Hide volume modal after model is loaded
    hideVolumeModal() {
        const modal = document.getElementById('volume-modal');
        if (!modal) return;
        
        // Hide modal
        modal.classList.remove('show');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Reset modal state
        const loading = document.getElementById('volume-modal-loading');
        const btn = modal.querySelector('.volume-modal-btn');
        const message = modal.querySelector('.volume-modal-message');
        
        if (loading) {
            loading.style.display = 'none';
        }
        if (btn) {
            btn.style.display = 'block';
        }
        if (message) {
            message.textContent = 'Pastikan volume device Anda sudah dihidupkan untuk mendengarkan penjelasan audio yang tersedia untuk setiap model 3D.';
        }
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
        // Show volume modal before starting capture
        app.showVolumeModal(() => {
            app.showLoading(true, 'mobile');
            app.showNotification('Starting object capture...');
            
            // Load default model and simulate capture process
            app.loadMobileModel();
            
            setTimeout(() => {
                app.showLoading(false, 'mobile');
                app.nextStep();
            }, 2000);
        });
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

function closeVolumeModal() {
    const app = window.arApp;
    if (app) {
        app.closeVolumeModal();
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arApp = new ARModelViewer();
});
