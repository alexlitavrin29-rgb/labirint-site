document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');
if (!document.body.classList.contains('legacy-page')) document.body.classList.add('theme-void');
const mobileLight = window.matchMedia('(max-width: 860px)').matches;

if (location.protocol === 'file:') {
  const consciousnessViewer = document.querySelector('[data-consciousness-3d]');
  consciousnessViewer?.classList.add('is-error');
}

const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

const toast = document.querySelector('.toast');
document.querySelectorAll('[data-demo-form]').forEach(form => {
  form.addEventListener('submit', event => {
    event.preventDefault();
    toast.textContent = form.dataset.message || 'Готово. Это демонстрация пользовательского сценария.';
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 4200);
  });
});

document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const category = button.dataset.filter;
    document.querySelectorAll('.library-card').forEach(card => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
  });
});

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

if (!mobileLight && !document.body.classList.contains('legacy-page')) {
  const ambientCanvas = document.createElement('canvas');
  ambientCanvas.className = 'ambient-triangles';
  ambientCanvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(ambientCanvas);

  const context = ambientCanvas.getContext('2d');
  const palette = ['#8052ff', '#ffb829', '#15846e', '#b85cff', '#4ba7d8', '#ffffff'];
  const pointer = { x: -1000, y: -1000, active: false };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let width = 0;
  let height = 0;
  let triangles = [];
  let frame = 0;
  let ambientFrame;
  let lastFrameTime = 0;
  let accumulatedTime = 0;
  let pointerDirty = false;
  const frameInterval = 1000 / 24;

  const makeTriangle = index => {
    let x = Math.random() * width;
    if (x > width * .24 && x < width * .76 && Math.random() < .72) x = Math.random() < .5 ? Math.random() * width * .22 : width * (.78 + Math.random() * .22);
    const y = Math.random() * height;
    return {
      x,
      y,
      homeX: x,
      homeY: y,
      size: 1.2 + Math.random() * (index % 13 === 0 ? 8 : 3.8),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - .5) * .006,
      phase: Math.random() * Math.PI * 2,
      color: palette[index % palette.length],
      alpha: .1 + Math.random() * .36,
    };
  };

  const resizeAmbient = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth <= 860 ? 1 : 1.25);
    width = window.innerWidth;
    height = window.innerHeight;
    ambientCanvas.width = Math.round(width * ratio);
    ambientCanvas.height = Math.round(height * ratio);
    ambientCanvas.style.width = `${width}px`;
    ambientCanvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 600 ? 42 : 96;
    triangles = Array.from({ length: count }, (_, index) => makeTriangle(index));
  };

  const drawAmbient = timestamp => {
    ambientFrame = undefined;
    if (!reduceMotion) {
      accumulatedTime += lastFrameTime ? Math.min(timestamp - lastFrameTime, 100) : frameInterval;
      lastFrameTime = timestamp;
      if (!pointerDirty && accumulatedTime < frameInterval) {
        ambientFrame = requestAnimationFrame(drawAmbient);
        return;
      }
    }
    const pointerTriggered = pointerDirty;
    const delta = reduceMotion ? 0 : accumulatedTime;
    const step = reduceMotion ? 0 : delta / (1000 / 30);
    accumulatedTime = pointerTriggered ? 0 : accumulatedTime % frameInterval;
    pointerDirty = false;
    context.clearRect(0, 0, width, height);
    frame += step * 2;
    triangles.forEach((triangle, index) => {
      const driftX = Math.sin(frame * .006 + triangle.phase) * 5;
      const driftY = Math.cos(frame * .004 + triangle.phase) * 6;
      const targetX = triangle.homeX + driftX;
      const targetY = (triangle.homeY + driftY + window.scrollY * (.006 + index % 3 * .003)) % (height + 30) - 15;
      const easing = 1 - Math.pow(.975, step);
      triangle.x += (targetX - triangle.x) * easing;
      triangle.y += (targetY - triangle.y) * easing;
      if (pointer.active) {
        const dx = triangle.x - pointer.x;
        const dy = triangle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 125 && distance > 0) {
          const force = (1 - distance / 125) * 8;
          triangle.x += dx / distance * force * step;
          triangle.y += dy / distance * force * step;
        }
      }
      triangle.rotation += triangle.rotationSpeed * step;
      context.beginPath();
      for (let point = 0; point < 3; point += 1) {
        const angle = triangle.rotation - Math.PI / 2 + point * Math.PI * 2 / 3;
        const x = triangle.x + Math.cos(angle) * triangle.size;
        const y = triangle.y + Math.sin(angle) * triangle.size;
        if (point === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.closePath();
      context.globalAlpha = triangle.alpha;
      context.strokeStyle = triangle.color;
      context.lineWidth = index % 13 === 0 ? 1.1 : .75;
      context.stroke();
    });
    context.globalAlpha = 1;
    if (!reduceMotion && !document.hidden) ambientFrame = requestAnimationFrame(drawAmbient);
  };

  const startAmbient = () => {
    if (reduceMotion || document.hidden || ambientFrame !== undefined) return;
    lastFrameTime = 0;
    accumulatedTime = 0;
    ambientFrame = requestAnimationFrame(drawAmbient);
  };

  const stopAmbient = () => {
    if (ambientFrame === undefined) return;
    cancelAnimationFrame(ambientFrame);
    ambientFrame = undefined;
  };

  window.addEventListener('pointermove', event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    pointerDirty = true;
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => {
    pointer.active = false;
    pointerDirty = true;
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAmbient();
    else startAmbient();
  });
  window.addEventListener('resize', resizeAmbient);
  resizeAmbient();
  if (reduceMotion) drawAmbient(0);
  else startAmbient();
}

const constellationCanvas = document.querySelector('[data-legacy-constellation]');

if (constellationCanvas) {
  const context = constellationCanvas.getContext('2d');
  const heroSection = constellationCanvas.closest('.hero--constellation');
  const heroSticky = heroSection?.querySelector('.hero-sticky');
  const heroCopy = heroSection?.querySelector('.hero-copy');
  const heroTrust = heroSection?.querySelector('.trust-strip');
  const heroScrollCue = heroSection?.querySelector('.hero-scroll-cue');
  const constellationLabel = heroSection?.querySelector('.constellation-label');
  const sceneFragments = heroSection?.querySelector('[data-scene-copy="fragments"]');
  const sceneSystem = heroSection?.querySelector('[data-scene-copy="system"]');
  const constellation = constellationCanvas.closest('.constellation');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colors = ['#8052ff', '#8052ff', '#8052ff', '#ffb829', '#15846e', '#b85cff', '#4ba7d8', '#ffffff'];
  const pointer = { x: -10000, y: -10000, active: false };
  let particles = [];
  let ambient = [];
  let foreground = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let animationFrame;
  let visible = true;
  let scrollProgress = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const smoothstep = (start, end, value) => {
    const amount = clamp((value - start) / (end - start));
    return amount * amount * (3 - 2 * amount);
  };

  const inBrainShape = (x, y) => {
    const leftLobe = ((x + .31) / .67) ** 2 + (y / .78) ** 2 < 1;
    const rightLobe = ((x - .31) / .67) ** 2 + (y / .78) ** 2 < 1;
    const lowerTaper = y < .58 + .18 * Math.cos(x * 4.2);
    const upperCleft = y > -.3 || Math.abs(x) > .055 + Math.max(0, -.3 - y) * .22;
    const leftGroove = x < -.1 && x > -.78 && Math.abs(y - (-.22 + Math.sin((x + .76) * 7) * .1)) < .022;
    const rightGroove = x > .1 && x < .78 && Math.abs(y - (.03 + Math.sin((x - .05) * 7) * .11)) < .022;
    const lowerGroove = Math.abs(x) > .18 && Math.abs(y - (.31 + Math.cos(x * 6) * .07)) < .018;
    return (leftLobe || rightLobe) && lowerTaper && upperCleft && !leftGroove && !rightGroove && !lowerGroove;
  };

  const createBrainTarget = () => {
    let x;
    let y;
    do {
      x = Math.random() * 2 - 1;
      y = Math.random() * 1.7 - .85;
    } while (!inBrainShape(x, y));

    const scale = Math.min(width, height) * .4;
    return {
      x: width * .5 + x * scale,
      y: height * .49 + y * scale,
    };
  };

  const createBulbTarget = () => {
    let x;
    let y;
    let inside;
    do {
      x = Math.random() * 1.5 - .75;
      y = Math.random() * 1.7 - .82;
      const dome = x * x + ((y + .2) / .92) ** 2 < .58 && y < .3;
      const shoulder = Math.abs(x) < .5 - Math.max(0, y - .05) * .7 && y >= -.1 && y < .48;
      const neck = Math.abs(x) < .24 && y >= .38 && y < .68;
      const base = Math.abs(x) < .3 && y >= .62 && y < .78;
      inside = dome || shoulder || neck || base;
    } while (!inside);
    const scale = Math.min(width, height) * .42;
    const rotation = -.26;
    const rotatedX = x * Math.cos(rotation) - y * Math.sin(rotation);
    const rotatedY = x * Math.sin(rotation) + y * Math.cos(rotation);
    return { x: width * .5 + rotatedX * scale, y: height * .5 + rotatedY * scale };
  };

  const makeParticle = (index, total) => {
    const brain = createBrainTarget();
    const bulb = createBulbTarget();
    let fieldX = width * (.04 + Math.random() * .92);
    let fieldY = height * (.05 + Math.random() * .9);
    const centerDistance = Math.hypot((fieldX - width * .5) / width, (fieldY - height * .5) / height);
    if (centerDistance < .13) fieldY += (fieldY < height * .5 ? -1 : 1) * height * .16;
    const spiralAngle = index / total * Math.PI * 15 + Math.random() * .9;
    const spiralRadius = Math.min(width, height) * (.035 + Math.sqrt(index / total) * .47);
    const spiralDepth = .4 + Math.random() * .75;
    const angle = Math.random() * Math.PI * 2;
    const launchRadius = Math.max(width, height) * (.48 + Math.random() * .35);
    return {
      x: width * .5 + Math.cos(angle) * launchRadius,
      y: height * .5 + Math.sin(angle) * launchRadius,
      brainX: brain.x,
      brainY: brain.y,
      fieldX,
      fieldY,
      vortexX: width * .5 + Math.cos(spiralAngle) * spiralRadius * spiralDepth,
      vortexY: height * .5 + Math.sin(spiralAngle) * spiralRadius * .48 + (index / total - .5) * height * .16,
      bulbX: bulb.x,
      bulbY: bulb.y,
      size: .65 + Math.random() * 2.25,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - .5) * .008,
      drift: 1.2 + Math.random() * 4.5,
      phase: Math.random() * Math.PI * 2,
      alpha: .2 + Math.random() * .72,
      color: colors[(index + Math.floor(Math.random() * colors.length)) % colors.length],
      delay: (index / total) * 46,
      scatterX: (Math.random() - .5) * 130,
      scatterY: (Math.random() - .5) * 130,
      filled: Math.random() < .52,
      depth: .55 + Math.random() * .9,
    };
  };

  const resizeConstellation = () => {
    const rect = constellationCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    constellationCanvas.width = Math.round(width * pixelRatio);
    constellationCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = width < 500 ? 520 : 1280;
    particles = Array.from({ length: count }, (_, index) => makeParticle(index, count));
    ambient = Array.from({ length: width < 500 ? 32 : 68 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: .7 + Math.random() * 1.8,
      rotation: Math.random() * Math.PI * 2,
      speed: .04 + Math.random() * .12,
      alpha: .08 + Math.random() * .2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    foreground = Array.from({ length: width < 500 ? 7 : 16 }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 7 + Math.random() * 14,
      rotation: Math.random() * Math.PI * 2,
      speed: .08 + Math.random() * .18,
      driftX: (index % 2 ? -1 : 1) * (24 + Math.random() * 90),
      driftY: (Math.random() - .5) * 80,
      alpha: .12 + Math.random() * .34,
      color: colors[(index * 3) % colors.length],
    }));
    frame = reduceMotion ? 260 : 0;
  };

  const drawTriangle = (x, y, size, rotation, color, alpha, filled = false, lineWidth = .75) => {
    context.beginPath();
    for (let point = 0; point < 3; point += 1) {
      const angle = rotation - Math.PI / 2 + point * Math.PI * 2 / 3;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      if (point === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.globalAlpha = alpha;
    if (filled) {
      context.fillStyle = color;
      context.fill();
    } else {
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.stroke();
    }
  };

  const mix = (from, to, amount) => from + (to - from) * amount;

  const getMorphTarget = particle => {
    const toField = smoothstep(.1, .3, scrollProgress);
    const toVortex = smoothstep(.3, .48, scrollProgress);
    const toBulb = smoothstep(.48, .68, scrollProgress);
    const toBrain = smoothstep(.68, .88, scrollProgress);
    let x = mix(particle.brainX, particle.fieldX, toField);
    let y = mix(particle.brainY, particle.fieldY, toField);
    x = mix(x, particle.vortexX, toVortex);
    y = mix(y, particle.vortexY, toVortex);
    x = mix(x, particle.bulbX, toBulb);
    y = mix(y, particle.bulbY, toBulb);
    x = mix(x, particle.brainX, toBrain);
    y = mix(y, particle.brainY, toBrain);
    return { x, y };
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);
    frame += 1;

    ambient.forEach(particle => {
      particle.y -= particle.speed;
      particle.x += Math.sin(frame * .004 + particle.rotation) * .05;
      if (particle.y < -8) particle.y = height + 8;
      drawTriangle(particle.x, particle.y, particle.size, particle.rotation, particle.color, particle.alpha);
    });

    particles.forEach((particle, index) => {
      const localFrame = Math.max(0, frame - particle.delay);
      const arrival = reduceMotion ? 1 : 1 - Math.exp(-localFrame * .025);
      const breathe = Math.sin(frame * .012 + particle.phase) * particle.drift;
      const target = getMorphTarget(particle);
      const targetX = target.x + breathe;
      const targetY = target.y + Math.cos(frame * .01 + particle.phase) * particle.drift * .72;
      particle.x += (targetX - particle.x) * Math.max(.012, arrival * .055);
      particle.y += (targetY - particle.y) * Math.max(.012, arrival * .055);

      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 11500 && distanceSquared > 1) {
          const force = (1 - distanceSquared / 11500) * 3.4;
          const distance = Math.sqrt(distanceSquared);
          particle.x += dx / distance * force;
          particle.y += dy / distance * force;
        }
      }

      particle.rotation += particle.rotationSpeed;
      const shimmer = .72 + Math.sin(frame * .025 + index * .17) * .28;
      const dissolve = smoothstep(.9, 1, scrollProgress);
      const drawX = particle.x + particle.scatterX * dissolve;
      const drawY = particle.y + particle.scatterY * dissolve;
      const depthPulse = .72 + particle.depth * .28;
      drawTriangle(drawX, drawY, particle.size * depthPulse, particle.rotation, particle.color, particle.alpha * shimmer * Math.min(1, arrival * 1.8) * (1 - dissolve), particle.filled);
    });

    foreground.forEach((particle, index) => {
      particle.rotation += particle.speed * .008;
      const travel = scrollProgress + frame * .00008 * (index % 2 ? 1 : -1);
      const x = particle.x + particle.driftX * travel + Math.sin(frame * .006 + index) * 9;
      const y = particle.y + particle.driftY * travel + Math.cos(frame * .004 + index) * 7;
      drawTriangle(x, y, particle.size, particle.rotation, particle.color, particle.alpha * (1 - smoothstep(.92, 1, scrollProgress)), false, 1.4);
    });

    context.globalAlpha = 1;
    if (!reduceMotion && visible) animationFrame = requestAnimationFrame(draw);
  };

  constellationCanvas.addEventListener('pointermove', event => {
    const rect = constellationCanvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
  });
  constellationCanvas.addEventListener('pointerleave', () => { pointer.active = false; });

  const updateScrollScene = () => {
    if (!heroSection || !constellation) return;
    const rect = heroSection.getBoundingClientRect();
    const scrollRange = Math.max(1, heroSection.offsetHeight - window.innerHeight);
    scrollProgress = clamp(-rect.top / scrollRange);
    const growth = smoothstep(.04, .88, scrollProgress);
    const dissolve = smoothstep(.9, 1, scrollProgress);
    const mobile = window.innerWidth <= 860;
    const scale = 1 + growth * (mobile ? 1.65 : 2.15);
    const shift = mobile ? 0 : -window.innerWidth * .15 * growth;
    const copyFade = 1 - smoothstep(.03, .2, scrollProgress);
    const trustFade = 1 - smoothstep(.01, .14, scrollProgress);

    constellation.style.setProperty('--brain-scale', scale.toFixed(3));
    constellation.style.setProperty('--brain-shift', `${shift.toFixed(1)}px`);
    constellation.style.setProperty('--brain-opacity', (1 - dissolve).toFixed(3));
    constellation.style.setProperty('--brain-blur', '0px');
    if (heroCopy) {
      heroCopy.style.opacity = copyFade.toFixed(3);
      heroCopy.style.transform = `translateY(${(-58 * smoothstep(.05, .46, scrollProgress)).toFixed(1)}px)`;
    }
    if (heroTrust) heroTrust.style.opacity = trustFade.toFixed(3);
    if (heroScrollCue) heroScrollCue.style.opacity = (1 - smoothstep(0, .12, scrollProgress)).toFixed(3);
    if (constellationLabel) constellationLabel.style.opacity = copyFade.toFixed(3);
    if (sceneFragments) sceneFragments.style.opacity = (smoothstep(.14, .24, scrollProgress) * (1 - smoothstep(.38, .48, scrollProgress))).toFixed(3);
    if (sceneSystem) sceneSystem.style.opacity = (smoothstep(.5, .6, scrollProgress) * (1 - smoothstep(.74, .84, scrollProgress))).toFixed(3);
    if (heroSticky) heroSticky.style.setProperty('--scene-glow', (growth * (1 - dissolve)).toFixed(3));
  };

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollScene();
      scrollTicking = false;
    });
  }, { passive: true });

  const visibilityObserver = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? true;
    if (visible && !reduceMotion && !animationFrame) draw();
    if (!visible && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }
  });

  visibilityObserver.observe(constellationCanvas);
  resizeConstellation();
  updateScrollScene();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeConstellation();
      updateScrollScene();
      if (reduceMotion) draw();
    }, 180);
  });
}

const transitionSymbols = [...document.querySelectorAll('.symbol-transition')];

if (transitionSymbols.length && !mobileLight) {
  const palette = ['#8052ff', '#8052ff', '#ffb829', '#15846e', '#b85cff', '#ffffff'];
  const clamp = value => Math.min(1, Math.max(0, value));
  const ease = value => {
    const amount = clamp(value);
    return amount * amount * (3 - 2 * amount);
  };

  const samplePolyline = (points, count) => {
    const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
    const total = lengths.reduce((sum, length) => sum + length, 0);
    return Array.from({ length: count }, (_, index) => {
      let distance = index / Math.max(1, count - 1) * total;
      let segment = 0;
      while (segment < lengths.length - 1 && distance > lengths[segment]) {
        distance -= lengths[segment];
        segment += 1;
      }
      const amount = lengths[segment] ? distance / lengths[segment] : 0;
      return [
        points[segment][0] + (points[segment + 1][0] - points[segment][0]) * amount,
        points[segment][1] + (points[segment + 1][1] - points[segment][1]) * amount,
      ];
    });
  };

  const getSymbolPoints = (symbol, count) => {
    if (symbol === 'pulse') {
      return samplePolyline([[.12,.52],[.34,.52],[.41,.33],[.48,.72],[.56,.23],[.63,.52],[.88,.52]], count);
    }
    if (symbol === 'book') {
      const half = Math.floor(count / 2);
      const left = samplePolyline([[.18,.3],[.32,.25],[.49,.36],[.49,.73],[.33,.62],[.18,.66],[.18,.3]], half);
      const right = samplePolyline([[.82,.3],[.68,.25],[.51,.36],[.51,.73],[.67,.62],[.82,.66],[.82,.3]], count - half);
      return [...left, ...right];
    }

    const arcCount = Math.floor(count * .78);
    const arc = Array.from({ length: arcCount }, (_, index) => {
      const angle = -Math.PI * .96 + index / Math.max(1, arcCount - 1) * Math.PI * 1.42;
      return [.5 + Math.cos(angle) * .19, .34 + Math.sin(angle) * .22];
    });
    const tail = samplePolyline([[.66,.38],[.61,.49],[.51,.55],[.5,.69]], count - arcCount - 8);
    const dot = Array.from({ length: 8 }, (_, index) => {
      const angle = index / 8 * Math.PI * 2;
      return [.5 + Math.cos(angle) * .018, .79 + Math.sin(angle) * .026];
    });
    return [...arc, ...tail, ...dot];
  };

  const states = transitionSymbols.map((element, symbolIndex) => {
    const canvas = element.querySelector('canvas');
    const context = canvas.getContext('2d');
    const state = { element, canvas, context, particles: [], width: 0, height: 0, active: false };

    state.resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      state.width = rect.width;
      state.height = rect.height;
      canvas.width = Math.round(rect.width * ratio);
      canvas.height = Math.round(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = rect.width < 600 ? 58 : 104;
      const targets = getSymbolPoints(element.dataset.symbol, count);
      state.particles = targets.map((target, index) => ({
        targetX: target[0] * rect.width,
        targetY: target[1] * rect.height,
        scatterX: (Math.random() * .9 + .05) * rect.width,
        scatterY: (Math.random() * .9 + .05) * rect.height,
        size: .9 + Math.random() * 1.7,
        rotation: Math.random() * Math.PI * 2,
        color: palette[(index + symbolIndex) % palette.length],
        alpha: .28 + Math.random() * .6,
      }));
    };

    state.draw = () => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - window.innerHeight / 2);
      const assembly = ease(1 - distance / (window.innerHeight * .72));
      context.clearRect(0, 0, state.width, state.height);
      state.particles.forEach((particle, index) => {
        const x = particle.scatterX + (particle.targetX - particle.scatterX) * assembly;
        const y = particle.scatterY + (particle.targetY - particle.scatterY) * assembly;
        const angle = particle.rotation + window.scrollY * .0015 + index * .01;
        context.beginPath();
        for (let point = 0; point < 3; point += 1) {
          const corner = angle - Math.PI / 2 + point * Math.PI * 2 / 3;
          const px = x + Math.cos(corner) * particle.size;
          const py = y + Math.sin(corner) * particle.size;
          if (point === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        }
        context.closePath();
        context.globalAlpha = particle.alpha * (.12 + assembly * .88);
        context.strokeStyle = particle.color;
        context.lineWidth = .8;
        context.stroke();
      });
      context.globalAlpha = 1;
    };

    state.resize();
    return state;
  });

  let symbolTicking = false;
  const drawSymbols = () => {
    states.forEach(state => { if (state.active) state.draw(); });
    symbolTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (symbolTicking || !states.some(state => state.active)) return;
    symbolTicking = true;
    requestAnimationFrame(drawSymbols);
  }, { passive: true });
  window.addEventListener('resize', () => {
    states.forEach(state => state.resize());
    drawSymbols();
  });
  const symbolObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const state = states.find(item => item.element === entry.target);
      if (!state) return;
      state.active = entry.isIntersecting;
      if (state.active) state.draw();
    });
  }, { rootMargin: '200px 0px' });
  states.forEach(state => symbolObserver.observe(state.element));
}

const portraitImages = mobileLight ? [] : document.querySelectorAll('.theme-void .profile-hero > img, .theme-void .teacher-feature > img');

portraitImages.forEach((image, portraitIndex) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'portrait-field';
  image.before(wrapper);
  wrapper.appendChild(image);
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  wrapper.appendChild(canvas);
  const context = canvas.getContext('2d');
  const palette = ['#8052ff', '#8052ff', '#ffb829', '#15846e'];
  const particles = Array.from({ length: 42 }, (_, index) => ({
    angle: index / 42 * Math.PI * 2 + Math.random() * .06,
    radius: .43 + Math.random() * .09,
    size: .8 + Math.random() * 1.5,
    speed: .00018 + Math.random() * .00022,
    color: palette[(index + portraitIndex) % palette.length],
    alpha: .2 + Math.random() * .48,
  }));
  let width;
  let height;
  let visible = true;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const draw = time => {
    context.clearRect(0, 0, width, height);
    particles.forEach(particle => {
      const angle = particle.angle + time * particle.speed;
      const x = width / 2 + Math.cos(angle) * width * particle.radius;
      const y = height / 2 + Math.sin(angle) * height * particle.radius;
      context.beginPath();
      for (let point = 0; point < 3; point += 1) {
        const corner = angle + point * Math.PI * 2 / 3;
        const px = x + Math.cos(corner) * particle.size;
        const py = y + Math.sin(corner) * particle.size;
        if (point === 0) context.moveTo(px, py);
        else context.lineTo(px, py);
      }
      context.closePath();
      context.globalAlpha = particle.alpha;
      context.strokeStyle = particle.color;
      context.lineWidth = .8;
      context.stroke();
    });
    context.globalAlpha = 1;
    if (visible) requestAnimationFrame(draw);
  };

  const portraitObserver = new IntersectionObserver(entries => {
    const wasVisible = visible;
    visible = entries[0]?.isIntersecting ?? true;
    if (visible && !wasVisible) requestAnimationFrame(draw);
  });
  portraitObserver.observe(wrapper);
  resize();
  requestAnimationFrame(draw);
  window.addEventListener('resize', resize);
});
