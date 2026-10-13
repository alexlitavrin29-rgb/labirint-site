import * as THREE from 'three';
import { GLTFLoader } from './vendor/three/GLTFLoader.js';

const viewer = document.querySelector('[data-consciousness-3d]');

if (viewer) {
  const intro = viewer.closest('.brain-intro');
  const stage = intro.querySelector('.brain-intro__stage');
  const glow = intro.querySelector('.brain-intro__glow');
  const copy = intro.querySelector('.brain-intro__copy');
  const copyParts = [...copy.querySelectorAll('[data-copy-part]')];
  const scrollCue = intro.querySelector('.brain-intro__scroll');
  const progressBar = intro.querySelector('.brain-intro__progress span');
  const canvas = viewer.querySelector('canvas');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (start, end, value) => {
    const amount = clamp((value - start) / Math.max(.0001, end - start));
    return amount * amount * (3 - 2 * amount);
  };

  let renderer;
  let consciousness;
  let targetProgress = 0;
  let currentProgress = 0;
  let sceneVisible = true;
  let stageShouldRender = true;
  let scrollTicking = false;
  let rafId;
  let lastFrameTime;
  let elapsedTime = 0;
  const shaderMaterials = [];
  const getPixelRatio = () => Math.min(window.devicePixelRatio || 1, window.innerWidth <= 860 ? 1 : 1.25);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-2.4, 2.4, 2.4, -2.4, .1, 30);
  camera.position.set(0, .05, 7);
  camera.lookAt(0, 0, 0);

  const vertexShader = `
    uniform float uTime;
    uniform float uDissolve;
    uniform float uPointSize;
    varying vec3 vColor;
    varying float vAlpha;

    float hash(vec3 value) {
      return fract(sin(dot(value, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    }

    void main() {
      float seed = hash(position);
      vec3 direction = normalize(position + vec3(seed - .5, hash(position.yzx) - .5, hash(position.zxy) - .5));
      float distance = pow(uDissolve, 1.55) * (2.0 + seed * 4.4);
      vec3 displaced = position + direction * distance;
      displaced += direction * sin(uTime * .32 + seed * 18.0) * .045 * (1.0 - uDissolve);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      gl_PointSize = uPointSize * mix(.9, .45, uDissolve) * (0.78 + seed * .65);
      float copper = smoothstep(.69, .92, seed + position.x * .012);
      vColor = mix(vec3(.07, .28, .92), vec3(.98, .36, .12), copper);
      vAlpha = mix(.72, .08, uDissolve) * (.58 + seed * .42);
    }
  `;

  const pointFragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      vec2 point = gl_PointCoord - .5;
      float alpha = smoothstep(.5, .08, length(point)) * vAlpha;
      if (alpha < .02) discard;
      gl_FragColor = vec4(vColor, alpha);
    }
  `;

  const lineFragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      gl_FragColor = vec4(vColor, vAlpha * .22);
    }
  `;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(getPixelRatio());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } catch (error) {
    showFallback();
  }

  if (renderer) {
    new GLTFLoader().load(
      './assets/models/consciousness.glb',
      gltf => {
        consciousness = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(consciousness);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        consciousness.position.sub(center);
        consciousness.scale.setScalar(3.7 / Math.max(size.x, size.y, size.z));
        consciousness.rotation.set(.24, -.5, .08);

        consciousness.traverse(child => {
          if (!child.isPoints && !child.isLine) return;
          const count = child.geometry.attributes.position?.count || 0;
          const mobileLimit = child.isPoints ? 58_000 : 30_000;
          if (window.innerWidth < 600) child.geometry.setDrawRange(0, Math.min(count, mobileLimit));

          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTime: { value: 0 },
              uDissolve: { value: 0 },
              uPointSize: { value: getPixelRatio() * (child.isPoints ? 1.45 : 1) },
            },
            vertexShader,
            fragmentShader: child.isPoints ? pointFragmentShader : lineFragmentShader,
            transparent: true,
            depthWrite: false,
            depthTest: false,
            blending: child.isPoints ? THREE.AdditiveBlending : THREE.NormalBlending,
          });
          child.material.dispose();
          child.material = material;
          shaderMaterials.push(material);
        });

        scene.add(consciousness);
        viewer.classList.add('is-ready');
        renderFrame();
        updateLoopState();
      },
      undefined,
      error => {
        console.error('Не удалось загрузить модель сознания:', error);
        showFallback();
      }
    );

    const resize = () => {
      const { width, height } = viewer.getBoundingClientRect();
      if (!width || !height) return;
      const pixelRatio = getPixelRatio();
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      shaderMaterials.forEach(material => {
        material.uniforms.uPointSize.value = pixelRatio * (material.fragmentShader === pointFragmentShader ? 1.45 : 1);
      });
      const aspect = width / height;
      const view = window.innerWidth < 600 ? 4.7 : 4.15;
      camera.left = -view * aspect / 2;
      camera.right = view * aspect / 2;
      camera.top = view / 2;
      camera.bottom = -view / 2;
      camera.updateProjectionMatrix();
    };

    const updateIntro = () => {
      const rect = intro.getBoundingClientRect();
      const range = Math.max(1, intro.offsetHeight - window.innerHeight);
      const progress = clamp(-rect.top / range);
      const motionProgress = smoothstep(.025, .64, progress);
      const dissolve = smoothstep(.50, .72, progress);
      const copyReveal = [
        smoothstep(.22, .38, progress),
        smoothstep(.32, .48, progress),
        smoothstep(.42, .58, progress),
        smoothstep(.50, .66, progress),
      ];

      targetProgress = motionProgress;
      const stageOpacity = 1 - smoothstep(.52, .74, progress);
      stageShouldRender = stageOpacity > .015;
      stage.style.opacity = String(stageOpacity);
      stage.style.transform = `translate(-50%, -50%) scale(${(1 + smoothstep(.08, .55, progress) * .14 - dissolve * .18).toFixed(3)})`;
      shaderMaterials.forEach(material => { material.uniforms.uDissolve.value = dissolve; });
      copyParts.forEach((part, index) => {
        const reveal = copyReveal[index] ?? copyReveal.at(-1);
        part.style.opacity = String(reveal);
        part.style.transform = `translate3d(0, ${((1 - reveal) * 42).toFixed(1)}px, 0)`;
      });
      copy.classList.toggle('is-readable', copyReveal[2] > .65);
      scrollCue.style.opacity = String(1 - smoothstep(.03, .14, progress));
      progressBar.style.transform = `scaleY(${progress.toFixed(3)})`;
      const glowStrength = (1 - dissolve) * (.4 + Math.sin(motionProgress * Math.PI) * .45);
      glow.style.opacity = glowStrength.toFixed(3);
      glow.style.transform = `scale(${(1 + motionProgress * .06).toFixed(3)})`;
      updateLoopState();
    };

    const renderFrame = () => {
      currentProgress += (targetProgress - currentProgress) * (reduceMotion ? 1 : .065);
      if (consciousness) {
        const idleRotation = reduceMotion ? 0 : elapsedTime * .1;
        consciousness.rotation.x = .24 + Math.sin(currentProgress * Math.PI) * .32;
        consciousness.rotation.y = -.5 + currentProgress * Math.PI * 2.15 + idleRotation;
        consciousness.rotation.z = .08 - currentProgress * .18;
      }
      shaderMaterials.forEach(material => { material.uniforms.uTime.value = elapsedTime; });
      renderer.render(scene, camera);
    };

    const canAnimate = () => !reduceMotion && sceneVisible && stageShouldRender && !document.hidden;

    const animate = timestamp => {
      rafId = undefined;
      if (!canAnimate()) return;
      if (lastFrameTime !== undefined) elapsedTime += Math.min(timestamp - lastFrameTime, 100) / 1000;
      lastFrameTime = timestamp;
      renderFrame();
      rafId = requestAnimationFrame(animate);
    };

    const stopLoop = () => {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      rafId = undefined;
      lastFrameTime = undefined;
    };

    function updateLoopState() {
      if (!canAnimate()) {
        stopLoop();
        return;
      }
      if (rafId === undefined) rafId = requestAnimationFrame(animate);
    }

    new ResizeObserver(resize).observe(viewer);
    new IntersectionObserver(entries => {
      sceneVisible = entries[0]?.isIntersecting ?? true;
      updateLoopState();
    }, { rootMargin: '120px' }).observe(viewer);
    document.addEventListener('visibilitychange', updateLoopState);
    window.addEventListener('scroll', () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(() => {
        updateIntro();
        scrollTicking = false;
      });
    }, { passive: true });
    window.addEventListener('resize', updateIntro);
    resize();
    updateIntro();
    if (reduceMotion) renderFrame();
    else updateLoopState();
  }

  function showFallback() {
    intro.classList.add('is-fallback');
    viewer.classList.add('is-error');
    copyParts.forEach(part => {
      part.style.opacity = '1';
      part.style.transform = 'none';
    });
    copy.classList.add('is-readable');
    stage.style.opacity = '.22';
    stageShouldRender = false;
    if (rafId !== undefined) cancelAnimationFrame(rafId);
    rafId = undefined;
  }
}
