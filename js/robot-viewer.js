/**
 * CU Robotics - 3D Robot Viewer
 * Interactive Three.js viewer for robot models
 * Protected against casual downloading
 */

function isMobileDevice() {
  return window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

class RobotViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn('Robot viewer container not found');
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.model = null;
    this.mixer = null;
    this.clock = new THREE.Clock();
    this.autoRotate = true;
    this.isLoading = false;
    this._modelCache = new Map();

    // CU Gold color for lighting
    this.goldColor = 0xCFB87C;
    this.goldColorLight = 0xE8D9A9;

    this.init();
    this.initProtection();
  }

  // Protection against casual model downloading
  initProtection() {
    const container = this.container;

    // Disable right-click context menu on viewer
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Block drag events
    container.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable selection
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';

    // Block common keyboard shortcuts for dev tools
    document.addEventListener('keydown', (e) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (Save)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    });

    // Clear model data on page unload
    window.addEventListener('beforeunload', () => {
      this.dispose();
      this._modelCache.clear();
    });

    // Detect dev tools opening (basic detection)
    let devToolsOpen = false;
    const threshold = 160;
    const checkDevTools = () => {
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          console.clear();
          console.log('%c⚠️ CU Robotics', 'font-size: 24px; font-weight: bold; color: #CFB87C;');
          console.log('%cThis content is protected. Unauthorized copying is prohibited.', 'font-size: 14px; color: #fff;');
        }
      } else {
        devToolsOpen = false;
      }
    };
    setInterval(checkDevTools, 1000);
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createControls();
    this.addEventListeners();
    this.animate();

    // Try to load the active robot model
    this.loadActiveRobot();
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = null;
  }

  createCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(-4, 2.5, 4);
    this.camera.lookAt(0, 0, 0);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    const maxPixelRatio = isMobileDevice() ? 1 : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(maxPixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.setClearColor(0x000000, 0);

    // Find or create canvas container
    const canvasContainer = this.container.querySelector('.viewer-canvas') || this.container;
    canvasContainer.appendChild(this.renderer.domElement);
  }

  createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Main gold-tinted key light
    const keyLight = new THREE.DirectionalLight(this.goldColor, 1);
    keyLight.position.set(5, 5, 5);
    this.scene.add(keyLight);

    // Fill light (white)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-3, 3, -3);
    this.scene.add(fillLight);

    // Rim light (gold accent)
    const rimLight = new THREE.DirectionalLight(this.goldColorLight, 0.8);
    rimLight.position.set(0, 5, -5);
    this.scene.add(rimLight);

    // Bottom fill for dramatic effect
    const bottomLight = new THREE.DirectionalLight(0x444444, 0.3);
    bottomLight.position.set(0, -3, 0);
    this.scene.add(bottomLight);

  }

  createControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  async loadActiveRobot() {
    try {
      const data = await window.CURobotics.fetchJSON('data/robots.json');
      const activeRobot = data.robots.find(r => r.status === 'active');

      if (activeRobot && activeRobot.model3d) {
        this.loadModel(activeRobot.model3d, activeRobot.name);
      } else {
        this.showPlaceholder();
      }
    } catch (error) {
      console.warn('Could not load robots data:', error);
      this.showPlaceholder();
    }
  }

  async loadModel(modelPath, modelName = 'Robot') {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading(modelName);

    // Remove existing model
    if (this.model) {
      this.scene.remove(this.model);
      this.model = null;
    }

    const loader = new THREE.GLTFLoader();

    // Add Draco decoder support if available
    if (THREE.DRACOLoader) {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      loader.setDRACOLoader(dracoLoader);
    }

    // Obfuscated loading: fetch as blob, create object URL
    // This makes it harder to find the original file path in network requests
    let blobUrl;
    try {
      const response = await fetch(modelPath, {
        credentials: 'same-origin',
        cache: 'no-store'
      });
      if (!response.ok) {
        throw new Error(`Failed to load ${modelPath}: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();
      blobUrl = URL.createObjectURL(blob);
      this._modelCache.set(modelName, blobUrl);
    } catch (e) {
      // Fallback to direct loading if blob fails
      blobUrl = modelPath;
    }

    loader.load(
      blobUrl,
      (gltf) => {
        this.model = gltf.scene;

        // First rotate model to lay flat (correct orientation from CAD export)
        this.model.rotation.x = -Math.PI / 2;

        // Update matrix so bounding box calculation is correct after rotation
        this.model.updateMatrixWorld(true);

        // Now calculate bounds after rotation
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 4.6 / maxDim;

        this.model.scale.setScalar(scale);

        // Recalculate center after scaling
        this.model.updateMatrixWorld(true);
        const boxScaled = new THREE.Box3().setFromObject(this.model);
        const centerScaled = boxScaled.getCenter(new THREE.Vector3());

        // Center the model so it floats in the scene.
        this.model.position.x = -centerScaled.x;
        this.model.position.z = -centerScaled.z;
        this.model.position.y = -centerScaled.y;

        this.model.traverse((child) => {
          if (child.isMesh) {
            // Enhance metallic materials slightly
            if (child.material) {
              child.material.envMapIntensity = 0.5;
            }
          }
        });

        // Handle animations if present
        if (gltf.animations && gltf.animations.length) {
          this.mixer = new THREE.AnimationMixer(this.model);
          const action = this.mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        this.scene.add(this.model);
        this.hideLoading();
        this.isLoading = false;

        // Revoke blob URL after loading to prevent easy access
        if (blobUrl && blobUrl.startsWith('blob:')) {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }

      },
      (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        this.updateLoadingProgress(percent);
      },
      (error) => {
        console.error('Error loading model:', error);
        this.showPlaceholder();
        this.isLoading = false;
      }
    );
  }

  showLoading(modelName) {
    const loadingEl = this.container.querySelector('.viewer-loading');
    if (loadingEl) {
      loadingEl.classList.remove('hidden');
      const textEl = loadingEl.querySelector('.loading-text');
      if (textEl) {
        textEl.textContent = `Loading ${modelName}...`;
      }
    }

    const placeholderEl = this.container.querySelector('.viewer-placeholder');
    if (placeholderEl) {
      placeholderEl.classList.add('hidden');
    }
  }

  updateLoadingProgress(percent) {
    const textEl = this.container.querySelector('.loading-text');
    if (textEl) {
      textEl.textContent = `Loading... ${percent}%`;
    }
  }

  hideLoading() {
    const loadingEl = this.container.querySelector('.viewer-loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
  }

  showPlaceholder() {
    const loadingEl = this.container.querySelector('.viewer-loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }

    const placeholderEl = this.container.querySelector('.viewer-placeholder');
    if (placeholderEl) {
      placeholderEl.classList.remove('hidden');
    }

    // Create a simple placeholder cube with gold wireframe
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: this.goldColor, opacity: 0.5, transparent: true });
    const wireframe = new THREE.LineSegments(edges, material);
    wireframe.position.y = 0.5;
    this.model = wireframe;
    this.scene.add(wireframe);
  }

  addEventListeners() {
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());

    // Pause auto-rotate during user interaction, resume after
    this.controls.addEventListener('start', () => {
      this._wasAutoRotating = this.controls.autoRotate;
      this.controls.autoRotate = false;
    });

    this.controls.addEventListener('end', () => {
      if (this._wasAutoRotating && this.autoRotate) {
        setTimeout(() => {
          this.controls.autoRotate = true;
        }, 3000); // Resume after 3 seconds of inactivity
      }
    });
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // Update animations
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Update controls
    this.controls.update();

    // Render
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    // Clean up Three.js resources
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.model) {
      this.scene.remove(this.model);
    }
    window.removeEventListener('resize', this.onWindowResize);
  }
}

// Initialize viewer when DOM is ready with lazy loading
document.addEventListener('DOMContentLoaded', () => {
  const viewerContainer = document.getElementById('robot-viewer');
  if (!viewerContainer) return;

  function initViewer() {
    if (typeof THREE !== 'undefined') {
      window.robotViewer = new RobotViewer('robot-viewer');
    }
  }

  if ('IntersectionObserver' in window) {
    const viewerObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initViewer();
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px', threshold: 0 });

    viewerObserver.observe(viewerContainer);
  } else {
    initViewer();
  }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RobotViewer;
}
