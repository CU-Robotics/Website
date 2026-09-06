/**
 * CU Robotics - 3D Robot Viewer
 * Interactive Three.js viewer for robot models
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
    this.initViewerInteractions();
  }

  // Keep browser interaction handling scoped to the viewer itself.
  initViewerInteractions() {
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
    // Low, off-axis key shapes the chassis; filtered shadows retain depth.
    const keyLight = new THREE.DirectionalLight(0xfff3e3, 0.3);
    keyLight.position.set(-40, 30, 35);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.radius = 6;
    keyLight.shadow.bias = -0.0002;
    keyLight.shadow.normalBias = 0.015;

    // Restrained fill opens dark surfaces without equalizing both sides.
    const fillLight = new THREE.DirectionalLight(0xe4ebf5, 0.06);
    fillLight.position.set(30, 10, -20);
    this.scene.add(keyLight, keyLight.target, fillLight);
  }

  createControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    // Zoom is off so the wheel always scrolls the page instead of being
    // swallowed by the viewer; the model is framed at a fixed size instead.
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 2;
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  async loadActiveRobot() {
    try {
      const data = await window.CURobotics.fetchJSON('data/robots.json?v=20260905-1');
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
      this.frameModel();
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
    this.frameModel();
  }

  // Pulls the camera to the one distance that fills the viewer with the model.
  // The model is bounded as a cylinder around the auto-rotate axis, so the fit
  // holds at every angle of the spin and the size never changes on its own.
  frameModel() {
    if (!this.model) return;

    // Measured once per model; resize only needs to redo the arithmetic.
    this.silhouette = this.silhouette || this.measureSilhouette();

    // The camera looks down at the robot, so a flat trig fit is off by the tilt.
    // Start from a distance the model certainly fits inside and pull in until
    // its silhouette just touches the edges. Four passes settle it.
    const vFov = this.camera.fov * Math.PI / 180;
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    let distance = this.silhouetteRadius / Math.sin(vFov / 2);

    // Aiming at the model's centre leaves it low in the frame, because the
    // camera looks down at it. Each pass re-aims at the middle of what is
    // actually on screen and then pulls in to the new fit.
    this.controls.target.set(0, 0, 0);

    for (let pass = 0; pass < 6; pass++) {
      this.camera.position.copy(this.controls.target).addScaledVector(direction, distance);
      this.camera.updateMatrixWorld(true);

      let top = -Infinity;
      let bottom = Infinity;
      let side = 0;

      this.silhouette.forEach((point) => {
        const projected = point.clone().project(this.camera);
        top = Math.max(top, projected.y);
        bottom = Math.min(bottom, projected.y);
        side = Math.max(side, Math.abs(projected.x));
      });

      const visibleHeight = 2 * distance * Math.tan(vFov / 2);
      this.controls.target.y += ((top + bottom) / 2) * (visibleHeight / 2);
      distance *= Math.max((top - bottom) / 2, side) * 1.06;
    }

    this.camera.position.copy(this.controls.target).addScaledVector(direction, distance);
    this.controls.update();
  }

  // The shape the robot sweeps out as it spins, measured off the vertices: the
  // widest radius in each horizontal slice, turned back into rings. A single
  // cylinder would take the base's width at the turret's height and frame the
  // robot far smaller than it needs to be.
  measureSilhouette() {
    this.model.updateMatrixWorld(true);

    const SLICES = 24;
    const box = new THREE.Box3().setFromObject(this.model);
    const bottom = box.min.y;
    const sliceHeight = (box.max.y - bottom) / SLICES;
    const radii = new Array(SLICES).fill(0);
    const vertex = new THREE.Vector3();

    this.model.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;
      const positions = child.geometry.attributes.position;
      if (!positions) return;

      for (let i = 0; i < positions.count; i++) {
        vertex.fromBufferAttribute(positions, i).applyMatrix4(child.matrixWorld);
        const slice = Math.min(SLICES - 1, Math.floor((vertex.y - bottom) / sliceHeight));
        radii[slice] = Math.max(radii[slice], Math.hypot(vertex.x, vertex.z));
      }
    });

    const points = [];
    this.silhouetteRadius = 0;

    radii.forEach((radius, slice) => {
      if (radius === 0) return;
      const yLow = bottom + slice * sliceHeight;
      const yHigh = yLow + sliceHeight;

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, yLow, z), new THREE.Vector3(x, yHigh, z));
      }

      this.silhouetteRadius = Math.max(
        this.silhouetteRadius,
        Math.hypot(radius, yLow),
        Math.hypot(radius, yHigh)
      );
    });

    return points;
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
    this.silhouette = null;
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
