(() => {
  const container = document.getElementById('hero-shader');
  if (!container || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

        float angle = -0.68;
        mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec2 ribbonPoint = rotation * point;

        float breath = 0.92 + 0.08 * sin(uTime * 0.55);
        float bend = 0.035 * sin(ribbonPoint.y * 4.5 + uTime * 0.22)
          + 0.012 * sin(ribbonPoint.y * 11.0 - uTime * 0.16);
        float spacing = 0.39;
        float ribbonDistance = abs(mod(ribbonPoint.x + bend + spacing * 0.5, spacing) - spacing * 0.5);
        float taper = smoothstep(-0.9, -0.15, ribbonPoint.y)
          * (1.0 - smoothstep(0.48, 1.05, ribbonPoint.y));
        float width = (0.036 + 0.018 * taper)
          + 0.004 * sin(ribbonPoint.y * 3.0 + uTime * 0.4);

        float ribbon = 1.0 - smoothstep(width - 0.01, width + 0.026, ribbonDistance);
        float core = 1.0 - smoothstep(0.0, width, ribbonDistance);
        float edge = exp(-pow((ribbonDistance - width * 0.72) / 0.012, 2.0));
        float glow = exp(-ribbonDistance * 13.0) * 0.16;

        float along = 0.58 + 0.42 * sin(ribbonPoint.y * 2.1 - 0.7);
        float centerFade = 1.0 - smoothstep(0.42, 1.0, length(point * vec2(0.72, 1.0)));
        float horizontalFade = smoothstep(1.12, 0.48, abs(point.x));
        float visibility = centerFade * horizontalFade * (0.18 + 0.82 * taper);

        vec3 background = vec3(0.082);
        vec3 deepGold = vec3(0.12, 0.075, 0.018);
        vec3 gold = vec3(0.812, 0.722, 0.486);
        vec3 paleGold = vec3(1.0, 0.88, 0.57);

        vec3 ribbonColor = mix(deepGold, gold, 0.34 + 0.4 * along);
        ribbonColor = mix(ribbonColor, paleGold, edge * 0.16);

        vec3 color = background;
        color += deepGold * glow * visibility * breath;
        color = mix(color, ribbonColor * breath * 0.76, ribbon * visibility);
        color += paleGold * core * 0.035 * visibility;

        float grainFrame = floor(uTime * 6.0);
        float grain = noise(gl_FragCoord.xy + vec2(grainFrame, -grainFrame * 1.7)) - 0.5;
        color += grain * (0.012 + ribbon * 0.06) * visibility;

        float vignette = 1.0 - smoothstep(0.32, 0.86, length(point));
        color = mix(background, color, 0.32 + 0.68 * vignette);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height, false);
    uniforms.uResolution.value.set(
      width * renderer.getPixelRatio(),
      height * renderer.getPixelRatio()
    );
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animationFrame;

  function render(time = 0) {
    uniforms.uTime.value = reducedMotion ? 0 : time / 1000;
    renderer.render(scene, camera);
    if (!reducedMotion && !document.hidden) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(animationFrame);
    if (!document.hidden) render(performance.now());
  });

  new ResizeObserver(resize).observe(container);
  resize();
  render();
})();
