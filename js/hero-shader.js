(() => {
  const container = document.getElementById('hero-shader');
  if (!container || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  // Soft smoke needs far fewer pixels than the foreground model.
  renderer.setPixelRatio(0.5);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const uniforms = {
    uTime: { value: 0 },
    uSpotlight: { value: new THREE.Vector2(0.72, 0) },
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
      uniform vec2 uSpotlight;
      uniform vec2 uResolution;

      float hash(vec2 point) {
        return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 point) {
        vec2 cell = floor(point);
        vec2 local = fract(point);
        vec2 blend = local * local * (3.0 - 2.0 * local);
        return mix(
          mix(hash(cell), hash(cell + vec2(1.0, 0.0)), blend.x),
          mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), blend.x),
          blend.y
        );
      }

      float fbm(vec2 point) {
        float value = 0.0;
        float weight = 0.5;
        mat2 rotation = mat2(0.8, -0.6, 0.6, 0.8);
        for (int octave = 0; octave < 5; octave++) {
          value += weight * noise(point);
          point = rotation * point * 2.03 + vec2(17.1, 9.2);
          weight *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        float depth = 1.0 - uv.y;
        float x = (uv.x - 0.5) * uResolution.x / uResolution.y;

        // Drift downward from the top, preserving the soft smoke texture.
        vec2 flow = vec2(x * 3.0,
          depth * 2.8 - uTime * 0.085);
        vec2 curl = vec2(
          fbm(flow + vec2(0.0, 4.7)),
          fbm(flow + vec2(8.3, 1.2))
        );
        float billows = fbm(flow + 2.8 * (curl - 0.5));
        float wisps = fbm(flow * 1.8 + 3.0 * (curl - 0.5) + vec2(5.1));
        float density = smoothstep(0.27, 0.76, billows * 0.75 + wisps * 0.25);

        // A broad source at the top thins out toward the bottom.
        float center = x + (curl.x - 0.5) * (0.35 + depth * 0.7);
        float spread = 0.48 + depth * 0.62;
        float plume = exp(-pow(center / spread, 2.0));
        float fade = 1.0 - smoothstep(0.1, 1.0, depth);
        float opacity = density * plume * fade * 0.58;
        vec3 color = mix(vec3(0.082), vec3(0.55, 0.489, 0.329), opacity);
        // A feathered overhead cone catches the smoke behind the robot.
        float drop = 1.0 - uv.y;
        float beamX = (uv.x - uSpotlight.x) * uResolution.x / uResolution.y;
        float beamWidth = 0.055 + drop * 0.38;
        float beam = exp(-pow(beamX / beamWidth, 2.0) * 1.5);
        float beamFade = exp(-drop * 0.85) * (1.0 - smoothstep(0.7, 1.0, drop));
        float scattering = 0.25 + density * 0.65;
        color += vec3(0.9, 0.94, 1.0) * beam * beamFade * scattering * uSpotlight.y;
        color += (hash(gl_FragCoord.xy) - 0.5) * 0.006;
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width <= 0 || height <= 0) return;
    const viewer = document.getElementById('robot-viewer');
    const bounds = container.getBoundingClientRect();
    const robotBounds = viewer?.getBoundingClientRect();
    const visible = robotBounds && robotBounds.width > 0 && robotBounds.height > 0;
    uniforms.uSpotlight.value.set(
      visible ? (robotBounds.left + robotBounds.width / 2 - bounds.left) / width : 0.5,
      visible ? 1 : 0
    );
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
