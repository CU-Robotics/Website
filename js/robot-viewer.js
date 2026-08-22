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
    this.autoRotate = true;
    this.isLoading = false;
    this.isInViewport = true;
    this.isRendering = false;
    this.animationFrame = null;
    this.lastFrameTime = 0;
    this.frameInterval = 1000 / 30;
    this.modelAbortController = null;

    this.animate = this.animate.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

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
    });
  }

  init() {
    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createControls();
    this.addEventListeners();
    this.startRendering();

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
    const maxPixelRatio = isMobileDevice() ? 1 : Math.min(window.devicePixelRatio, 1.25);
    this.renderer.setPixelRatio(maxPixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.setClearColor(0x000000, 0);

    // Find or create canvas container
    const canvasContainer = this.container.querySelector('.viewer-canvas') || this.container;
    canvasContainer.appendChild(this.renderer.domElement);
  }

  createLights() {
    const spotlight = new THREE.SpotLight(this.goldColorLight, 2.2, 20, Math.PI / 5, 0.15, 1.5);
    spotlight.position.set(0, 7, -4);
    spotlight.target.position.set(0, 0.5, 0);
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.setScalar(isMobileDevice() ? 1024 : 2048);
    spotlight.shadow.bias = -0.0005;
    spotlight.shadow.normalBias = 0.02;
    this.scene.add(spotlight, spotlight.target);

    const fillLight = new THREE.DirectionalLight(0xdde5f2, 0.9);
    fillLight.position.set(3, 4, 5);
    this.scene.add(fillLight);
  }

  createControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 10;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 2;
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
    this.disposeModel();

    try {
      let gltf;
      let lastError;

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          gltf = await this.loadModelAttempt(modelPath, attempt);
          break;
        } catch (error) {
          lastError = error;
          if (attempt === 0) {
            console.warn('Model load failed; retrying once:', error);
          }
        }
      }

      if (!gltf) throw lastError;

      this.model = gltf.scene;
      this.model.rotation.x = -Math.PI / 2;
      this.model.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(this.model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      this.model.scale.setScalar(4.6 / maxDim);

      this.model.updateMatrixWorld(true);
      const boxScaled = new THREE.Box3().setFromObject(this.model);
      const centerScaled = boxScaled.getCenter(new THREE.Vector3());
      this.model.position.set(-centerScaled.x, -centerScaled.y, -centerScaled.z);

      this.model.traverse((child) => {
        if (!child.isMesh) return;
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (material) material.envMapIntensity = 0.5;
        });
      });

      this.scene.add(this.model);
      this.renderer.shadowMap.needsUpdate = true;
      this.hideLoading();
    } catch (error) {
      console.error('Error loading model:', error);
      this.showPlaceholder();
    } finally {
      this.modelAbortController = null;
      this.isLoading = false;
    }
  }

  async loadModelAttempt(modelPath, attempt) {
    const loader = new THREE.GLTFLoader();
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    const separator = modelPath.includes('?') ? '&' : '?';
    const requestPath = attempt === 0 ? modelPath : `${modelPath}${separator}retry=${Date.now()}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    this.modelAbortController = controller;

    try {
      const response = await fetch(requestPath, {
        credentials: 'same-origin',
        cache: attempt === 0 ? 'default' : 'reload',
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${modelPath}: ${response.status} ${response.statusText}`);
      }

      const modelData = await response.arrayBuffer();
      const pathEnd = modelPath.lastIndexOf('/') + 1;
      const resourcePath = pathEnd > 0 ? modelPath.slice(0, pathEnd) : '';

      return await new Promise((resolve, reject) => {
        loader.parse(modelData, resourcePath, resolve, reject);
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Timed out loading ${modelPath}`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      dracoLoader.dispose();
    }
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
    window.addEventListener('resize', this.onWindowResize);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onVisibilityChange() {
    if (document.hidden) {
      this.stopRendering();
    } else {
      this.startRendering();
    }
  }

  setViewportVisibility(isVisible) {
    this.isInViewport = isVisible;
    if (isVisible) {
      this.startRendering();
    } else {
      this.stopRendering();
    }
  }

  startRendering() {
    if (this.isRendering || !this.isInViewport || document.hidden) return;

    this.isRendering = true;
    this.lastFrameTime = 0;
    this.animationFrame = requestAnimationFrame(this.animate);
  }

  stopRendering() {
    this.isRendering = false;
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  disposeModel() {
    if (!this.model) return;

    const materials = new Set();
    const textures = new Set();
    this.model.traverse((child) => {
      child.geometry?.dispose();
      const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
      childMaterials.forEach((material) => {
        if (!material) return;
        materials.add(material);
        Object.values(material).forEach((value) => {
          if (value?.isTexture) textures.add(value);
        });
      });
    });

    textures.forEach((texture) => texture.dispose());
    materials.forEach((material) => material.dispose());
    this.scene?.remove(this.model);
    this.model = null;
  }

  animate(timestamp) {
    if (!this.isRendering) return;

    this.animationFrame = requestAnimationFrame(this.animate);
    const elapsed = timestamp - this.lastFrameTime;
    if (elapsed < this.frameInterval) return;
    this.lastFrameTime = timestamp - (elapsed % this.frameInterval);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stopRendering();
    this.modelAbortController?.abort();
    this.disposeModel();
    this.controls?.dispose();
    if (this.renderer) {
      this.renderer.renderLists?.dispose();
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.renderer.domElement.remove();
      this.renderer = null;
    }
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }
}

// Initialize viewer when DOM is ready with lazy loading
document.addEventListener('DOMContentLoaded', () => {
  const viewerContainer = document.getElementById('robot-viewer');
  if (!viewerContainer) return;

  function initViewer() {
    if (!window.robotViewer && typeof THREE !== 'undefined') {
      window.robotViewer = new RobotViewer('robot-viewer');
    }
    return window.robotViewer;
  }

  if ('IntersectionObserver' in window) {
    const viewerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          initViewer();
        }
        window.robotViewer?.setViewportVisibility(entry.isIntersecting);
      });
    }, { threshold: 0 });

    viewerObserver.observe(viewerContainer);
  } else {
    initViewer();
  }
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RobotViewer;
}
