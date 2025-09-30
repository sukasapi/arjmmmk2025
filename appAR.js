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
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeThreeJS();
        this.updateTime();
        this.updateUI();
        this.loadModelGallery();
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
        const mobileCanvas = document.getElementById('ar-canvas');
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
        this.scene.add(directionalLight);
        
        // Secondary directional light from opposite side
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight2.position.set(-5, 5, -5);
        this.scene.add(directionalLight2);
        
        // Point light for additional illumination
        const pointLight = new THREE.PointLight(0xffffff, 1.2);
        pointLight.position.set(0, 5, 0);
        pointLight.distance = 20;
        this.scene.add(pointLight);
        
        // Hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x362d1d, 0.6);
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
    }

    // Load mobile model from Assets folder
    loadMobileModel(modelFile = 'aztec.glb') {
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


// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.arApp = new ARModelViewer();
});
