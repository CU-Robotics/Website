(() => {
  const container = document.getElementById('hero-shader');
  if (!container || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  // One sample per CSS pixel keeps the grain fine without Retina oversampling.
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;

      uniform float uTime;
      uniform vec2 uResolution;

      float noise(vec2 point) {
        return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 point = uv - 0.5;
        point.x *= uResolution.x / uResolution.y;

        float breath = 0.88 + 0.14 * sin(uTime * 0.55);
        float depth = 1.0 - uv.y;
        float drift = 0.025 * sin(depth * 4.0 + uTime * 0.14);
        float auraX = point.x + drift;
        float spread = 0.14 + depth * 0.78;
        float horizontalGlow = exp(-pow(auraX / spread, 2.0));
        float verticalGlow = exp(-depth * 1.85);
        float aura = horizontalGlow * verticalGlow;
        float halo = exp(-length(vec2(auraX * 0.85, depth * 0.55)) * 2.9);
        float core = exp(-abs(auraX) * 4.2) * exp(-depth * 2.4);

        vec3 background = vec3(0.082);
        vec3 deepGold = vec3(0.12, 0.075, 0.018);
        vec3 gold = vec3(0.812, 0.722, 0.486);
        vec3 auraColor = mix(deepGold, gold, 0.38 + core * 0.42);

        vec3 color = background;
        float intensity = clamp((aura * 0.46 + halo * 0.14) * breath, 0.0, 0.58);
        color = mix(color, auraColor, intensity);

        float grain = noise(gl_FragCoord.xy) - 0.5;
        color += grain * (0.008 + intensity * 0.08);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(
      width * renderer.getPixelRatio(),
      height * renderer.getPixelRatio()
    );
    if (reducedMotion && !document.hidden && isInViewport) render();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frameInterval = 1000 / 24;
  let renderTimer;
  let isInViewport = true;

  function render() {
    clearTimeout(renderTimer);
    if (document.hidden || !isInViewport) return;
    uniforms.uTime.value = reducedMotion ? 0 : performance.now() / 1000;
    renderer.render(scene, camera);
    if (!reducedMotion) {
      renderTimer = setTimeout(render, frameInterval);
    }
  }

  document.addEventListener('visibilitychange', render);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      isInViewport = entry.isIntersecting;
      render();
    }).observe(container);
  }

  new ResizeObserver(resize).observe(container);
  window.addEventListener('resize', resize);
  resize();
  render();
})();
