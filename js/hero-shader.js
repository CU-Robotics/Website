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
    uGlowX: { value: 0.5 },
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
      uniform float uGlowX;
      uniform vec2 uResolution;

      float hash(vec2 point) {
        return fract(sin(dot(point, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float valueNoise(vec2 point) {
        vec2 cell = floor(point);
        vec2 f = fract(point);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
          mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      float fbm(vec2 point) {
        float sum = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          sum += amplitude * valueNoise(point);
          point = point * 2.03 + vec2(1.7, 9.2);
          amplitude *= 0.5;
        }
        return sum;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        vec2 point = uv - vec2(uGlowX, 0.5);
        point.x *= uResolution.x / uResolution.y;

        float depth = 1.0 - uv.y;

        // Currents of light drift down through the spotlight like haze in a beam.
        vec2 flow = vec2(point.x * 2.2, uv.y * 1.6 + uTime * 0.22);
        float warp = fbm(flow + vec2(0.0, uTime * 0.05));
        float currents = fbm(flow * 1.4 + vec2(warp * 1.6, -uTime * 0.12));

        float breath = 0.78 + 0.26 * sin(uTime * 0.9) + 0.08 * sin(uTime * 2.3);
        float drift = 0.06 * sin(depth * 3.5 + uTime * 0.5) + (warp - 0.5) * 0.12 * depth;
        float auraX = point.x + drift;
        float spread = 0.14 + depth * 0.78;
        float horizontalGlow = exp(-pow(auraX / spread, 2.0));
        float verticalGlow = exp(-depth * 1.85);
        float aura = horizontalGlow * verticalGlow * (0.55 + currents * 0.9);
        float halo = exp(-length(vec2(auraX * 0.85, depth * 0.55)) * 2.9);
        float core = exp(-abs(auraX) * 4.2) * exp(-depth * 2.4);
        float wisps = smoothstep(0.52, 0.8, currents) * horizontalGlow * exp(-depth * 1.1);

        vec3 background = vec3(0.0);
        vec3 deepGold = vec3(0.12, 0.075, 0.018);
        vec3 gold = vec3(0.812, 0.722, 0.486);
        vec3 auraColor = mix(deepGold, gold, 0.38 + core * 0.42 + wisps * 0.3);

        vec3 color = background;
        float intensity = clamp((aura * 0.46 + halo * 0.14 + wisps * 0.22) * breath, 0.0, 0.66);
        color = mix(color, auraColor, intensity);

        // The grain re-rolls 24 times a second, like film, regardless of frame rate.
        float grainFrame = floor(uTime * 24.0);
        float grain = hash(gl_FragCoord.xy + vec2(grainFrame * 17.0, grainFrame * 31.0)) - 0.5;
        color += grain * (0.012 + intensity * 0.09);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;
    const bounds = container.getBoundingClientRect();
    const robotBounds = document.getElementById('robot-viewer')?.getBoundingClientRect();
    uniforms.uGlowX.value = robotBounds && robotBounds.width > 0
      ? (robotBounds.left + robotBounds.width / 2 - bounds.left) / width
      : 0.5;
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(
      width * renderer.getPixelRatio(),
      height * renderer.getPixelRatio()
    );
    if (reducedMotion && !document.hidden && isInViewport) render();
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let renderTimer;
  let isInViewport = true;

  function render() {
    cancelAnimationFrame(renderTimer);
    if (document.hidden || !isInViewport) return;
    uniforms.uTime.value = reducedMotion ? 0 : performance.now() / 1000;
    renderer.render(scene, camera);
    if (!reducedMotion) {
      renderTimer = requestAnimationFrame(render);
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
