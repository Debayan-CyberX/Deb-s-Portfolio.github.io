/* Original ema-inspired project rack. Uses the Three.js already loaded by the sanctuary. */
(async function () {
  'use strict';
  const root = document.getElementById('projectRack');
  if (!root || !window.THREE) return;
  const T = window.THREE;
  const stage = document.getElementById('rackStage');
  const experience = root.querySelector('.rack-experience');
  const panels = [...root.querySelectorAll('.project-card')];
  const tabs = [...root.querySelectorAll('[data-rack-index]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const count = panels.length;
  const resources = new Set();
  let renderer, observer, resizeObserver, paletteObserver;
  let active = 0, position = 0, target = 0, width = 1, height = 1;
  let visible = false, paused = false, frameId = 0, lastTime = 0, elapsed = 0;
  let drag = null, ready = false, disposed = false;
  const keep = resource => { resources.add(resource); return resource; };
  const wrap = value => ((value + count / 2) % count + count) % count - count / 2;
  const normalize = index => (index % count + count) % count;
  const models = [], hitTargets = [];
  const colors = { ink: '#dfe7e0', red: '#e0231c', gold: '#c9a24a' };
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(34, 1, .1, 60);
  const raycaster = new T.Raycaster();
  const pointer = new T.Vector2();

  function useSRGB(texture) {
    if (T.SRGBColorSpace) texture.colorSpace = T.SRGBColorSpace;
    else texture.encoding = T.sRGBEncoding;
  }

  function seedRandom(seed) {
    return () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  }

  function timberCanvas(seed, board = true) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 768;
    const ctx = canvas.getContext('2d');
    const random = seedRandom(seed);
    const gradient = ctx.createLinearGradient(0, 0, 768, 768);
    gradient.addColorStop(0, board ? '#59412c' : '#281f18');
    gradient.addColorStop(.45, board ? '#35271d' : '#3b2b20');
    gradient.addColorStop(1, board ? '#624730' : '#241c16');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 768, 768);
    // Fine, irregular fibres carry through the bevelled wooden face.
    for (let i = 0; i < 1300; i++) {
      const y = random() * 768, bend = random() * 16 - 8;
      ctx.strokeStyle = random() > .52 ? `rgba(190,145,95,${.035 + random() * .10})` : `rgba(8,6,4,${.04 + random() * .18})`;
      ctx.lineWidth = .3 + random() * 1.4;
      ctx.beginPath(); ctx.moveTo(-20, y);
      ctx.bezierCurveTo(180, y + bend, 420, y - bend, 790, y + bend * .5); ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const x = random() * 768, y = random() * 768;
      ctx.strokeStyle = 'rgba(17,10,5,.15)'; ctx.lineWidth = 1;
      for (let k = 1; k < 8; k++) {
        ctx.beginPath(); ctx.ellipse(x, y, 20 + k * 7, 1 + k * 2, .03, 0, Math.PI * 2); ctx.stroke();
      }
    }
    return canvas;
  }

  async function plaqueTexture(panel, index) {
    const canvas = timberCanvas(84 + index * 137);
    const ctx = canvas.getContext('2d');
    // The frame follows the plaque's clipped shoulders and is printed into the wood.
    ctx.strokeStyle = 'rgba(218,181,114,.48)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(45, 705); ctx.lineTo(723, 705); ctx.lineTo(723, 207);
    ctx.lineTo(564, 48); ctx.lineTo(204, 48); ctx.lineTo(45, 207); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = '#c6a168'; ctx.font = '400 17px Onest, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText('0' + (index + 1) + ' / 06', 89, 218);
    ctx.textAlign = 'right'; ctx.font = '400 29px NotoJP, sans-serif';
    ctx.fillText(panel.querySelector('.project-seal').textContent, 676, 218);
    const svg = panel.querySelector('.project-emblem').cloneNode(true);
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '220'); svg.setAttribute('height', '220');
    svg.setAttribute('stroke', '#d5b77c'); svg.removeAttribute('class');
    const image = new Image();
    await new Promise(resolve => {
      image.onload = () => { ctx.globalAlpha = .9; ctx.drawImage(image, 274, 262, 220, 220); ctx.globalAlpha = 1; resolve(); };
      image.onerror = resolve;
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    });
    ctx.textAlign = 'center'; ctx.fillStyle = '#e5d2ae'; ctx.font = '500 47px Onest, sans-serif';
    const name = panel.querySelector('h3').textContent;
    if (ctx.measureText(name).width > 580) {
      const words = name.split(' '); const last = words.pop();
      ctx.fillText(words.join(' '), 384, 566); ctx.fillText(last, 384, 624);
    } else { ctx.fillText(name, 384, 592); }
    ctx.strokeStyle = 'rgba(218,181,114,.35)'; ctx.beginPath(); ctx.moveTo(294, 650); ctx.lineTo(474, 650); ctx.stroke();
    const texture = keep(new T.CanvasTexture(canvas));
    useSRGB(texture);
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    return texture;
  }

  function cylinderBetween(start, end, radius, material) {
    const a = new T.Vector3(...start), b = new T.Vector3(...end);
    const mesh = new T.Mesh(keep(new T.CylinderGeometry(radius, radius, a.distanceTo(b), 9)), material);
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
    return mesh;
  }

  function arcPoint(offset) {
    const angle = offset * .345;
    return { x: Math.sin(angle) * 7.2, z: -(1 - Math.cos(angle)) * 7.2, angle };
  }

  function buildBeam() {
    const texture = keep(new T.CanvasTexture(timberCanvas(214, false)));
    useSRGB(texture);
    const wood = keep(new T.MeshStandardMaterial({ map: texture, color: 0xb9a08b, roughness: .9 }));
    const iron = keep(new T.MeshStandardMaterial({ color: 0x171d1b, metalness: .65, roughness: .7 }));
    const brass = keep(new T.MeshStandardMaterial({ color: 0xa88b53, metalness: .68, roughness: .48 }));
    const points = [];
    for (let i = -16; i <= 16; i++) { const a = arcPoint(i / 4); points.push(new T.Vector3(a.x, 1.6, a.z)); }
    const beam = new T.Mesh(keep(new T.TubeGeometry(new T.CatmullRomCurve3(points), 50, .115, 8, false)), wood);
    scene.add(beam);
    [-1, 1].forEach(sign => {
      const p = arcPoint(sign * 3.7);
      scene.add(cylinderBetween([p.x, -1.5, p.z], [p.x, 1.68, p.z], .095, wood));
      const foot = new T.Mesh(keep(new T.BoxGeometry(.65, .18, .65)), iron);
      foot.position.set(p.x, -1.57, p.z); scene.add(foot);
      const cap = new T.Mesh(keep(new T.SphereGeometry(.145, 12, 8)), brass);
      cap.position.set(p.x, 1.6, p.z); scene.add(cap);
      scene.add(cylinderBetween([p.x - sign * .58, 1.58, p.z + .35], [p.x, .8, p.z], .035, wood));
    });
    // A restrained warm seam makes the dark beam readable against the night.
    const line = new T.Line(keep(new T.BufferGeometry().setFromPoints(points.map(p => p.clone().add(new T.Vector3(0, .06, .09))))), keep(new T.LineBasicMaterial({ color: 0x9b784c, transparent: true, opacity: .35 })));
    scene.add(line);
    return brass;
  }

  async function buildPlaques(brass) {
    const shape = new T.Shape();
    shape.moveTo(-1.04, -.87); shape.lineTo(1.04, -.87); shape.lineTo(1.04, .38);
    shape.lineTo(.57, .91); shape.lineTo(-.57, .91); shape.lineTo(-1.04, .38); shape.closePath();
    [-.5, .5].forEach(x => { const hole = new T.Path(); hole.absarc(x, .62, .045, 0, Math.PI * 2, true); shape.holes.push(hole); });
    const geometry = keep(new T.ExtrudeGeometry(shape, { depth: .11, bevelEnabled: true, bevelThickness: .025, bevelSize: .025, bevelSegments: 2, steps: 1, curveSegments: 10 }));
    const uv = geometry.attributes.uv, vertices = geometry.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (vertices.getX(i) + 1.08) / 2.16, (vertices.getY(i) + .92) / 1.88);
    const edge = keep(new T.MeshStandardMaterial({ color: 0x342319, roughness: .86 }));
    const cord = keep(new T.MeshStandardMaterial({ color: 0xa92820, roughness: .88 }));
    const textures = await Promise.all(panels.map(plaqueTexture));
    panels.forEach((panel, index) => {
      const pivot = new T.Group(), board = new T.Group();
      const face = keep(new T.MeshStandardMaterial({ map: textures[index], roughness: .91, metalness: .035, color: 0xffffff }));
      const mesh = new T.Mesh(geometry, [face, edge]);
      mesh.userData.projectIndex = index;
      board.add(mesh); board.position.y = -1.44;
      [-.5, .5].forEach(x => {
        const eyelet = new T.Mesh(keep(new T.TorusGeometry(.06, .012, 6, 16)), brass);
        eyelet.position.set(x, .62, .144); board.add(eyelet);
        const curve = new T.CatmullRomCurve3([new T.Vector3(0, .02, .03), new T.Vector3(x * .36, -.23, .06), new T.Vector3(x, -.82, .16)]);
        const rope = new T.Mesh(keep(new T.TubeGeometry(curve, 16, .016, 6, false)), cord); pivot.add(rope);
      });
      const ring = new T.Mesh(keep(new T.TorusGeometry(.13, .018, 7, 18)), cord);
      ring.rotation.y = Math.PI / 2; ring.position.y = .015; pivot.add(ring);
      const knot = new T.Mesh(keep(new T.SphereGeometry(.04, 9, 6)), cord);
      knot.position.set(0, -.12, .04); pivot.add(knot);
      pivot.add(board); scene.add(pivot);
      models.push({ pivot, board, face, phase: index * 1.71 }); hitTargets.push(mesh);
    });
  }

  function updateModels(time) {
    models.forEach((model, index) => {
      const offset = wrap(index - position), point = arcPoint(offset);
      const emphasis = Math.exp(-offset * offset * 2.4);
      model.pivot.position.set(point.x, 1.52, point.z);
      model.pivot.rotation.y = -point.angle * .7;
      model.pivot.rotation.z = motion.matches ? 0 : Math.sin(time * .65 + model.phase) * .008 * (1 - emphasis * .5);
      model.board.rotation.x = -.07 * emphasis;
      model.board.scale.setScalar(1 + emphasis * .045);
      model.board.position.y = -1.44 + emphasis * .04;
      model.face.emissive.set(colors.gold);
      model.face.emissiveIntensity = emphasis * .045;
    });
  }

  function resize() {
    if (disposed || !ready) return;
    width = stage.clientWidth; height = stage.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.fov = width < 600 ? 34 : 32;
    camera.position.set(0, .75, width < 600 ? 6.0 : 9.3);
    camera.lookAt(0, .05, -.45); camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, width < 600 ? 1.3 : 1.5));
    renderer.setSize(width, height, false);
    wake();
  }

  function canRender() { return ready && visible && !document.hidden && !paused && !disposed; }
  function wake() { if (canRender() && !frameId) frameId = requestAnimationFrame(frame); }
  function frame(now) {
    frameId = 0;
    if (!canRender()) { lastTime = 0; return; }
    if (lastTime && now - lastTime < 31 && !motion.matches) { wake(); return; }
    const dt = Math.min((now - (lastTime || now - 16)) / 1000, .06);
    lastTime = now; elapsed += dt;
    position = motion.matches ? target : position + (target - position) * (1 - Math.exp(-dt * 9));
    if (Math.abs(target - position) < .0002) position = target;
    updateModels(elapsed); renderer.render(scene, camera);
    if (!motion.matches || Math.abs(target - position) > .0002) wake();
  }

  function select(index, options = {}) {
    const next = normalize(index);
    target += wrap(next - normalize(Math.round(target)));
    // Exact half-turns use a consistent direction in the six-item collection.
    if (motion.matches) position = target;
    active = next;
    panels.forEach((panel, i) => {
      panel.hidden = i !== active;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[i].id);
      panel.setAttribute('tabindex', '0');
      panel.classList.toggle('rack-enter', i === active && !motion.matches);
    });
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active)); tab.tabIndex = i === active ? 0 : -1;
    });
    document.getElementById('rackCounter').textContent = '0' + (active + 1) + ' / 06';
    if (options.announce !== false) document.getElementById('rackAnnouncement').textContent = panels[active].querySelector('h3').textContent + ', project ' + (active + 1) + ' of ' + count;
    if (options.focus) tabs[active].focus({ preventScroll: true });
    root.dataset.selectedProject = panels[active].id;
    // Refresh sanctuary camera anchors when the chosen summary changes height.
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    wake();
  }

  function hitAt(event) {
    const rect = stage.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(hitTargets)[0]?.object.userData.projectIndex;
  }

  function connectInteraction() {
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        let index;
        if (event.key === 'ArrowRight') index = active + 1;
        if (event.key === 'ArrowLeft') index = active - 1;
        if (event.key === 'Home') index = 0;
        if (event.key === 'End') index = count - 1;
        if (index !== undefined) { event.preventDefault(); select(index, { focus: true }); }
      });
    });
    root.querySelector('.rack-previous').addEventListener('click', () => select(active - 1));
    root.querySelector('.rack-next').addEventListener('click', () => select(active + 1));
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: position, moved: false, axis: null };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.axis && Math.hypot(dx, dy) > 7) drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.axis !== 'x') return;
      drag.moved = true; stage.classList.add('is-dragging');
      target = drag.start - dx / (width < 600 ? 150 : 230);
      wake();
    });
    function endDrag(event, canceled) {
      if (!drag || event.pointerId !== drag.id) return;
      const current = drag; drag = null; stage.classList.remove('is-dragging');
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (current.moved) { const next = Math.round(target); target = next; select(normalize(next)); }
      else if (!canceled && current.axis !== 'y') { const index = hitAt(event); if (index !== undefined) select(index); }
      else { target = Math.round(target); wake(); }
    }
    canvas.addEventListener('pointerup', event => endDrag(event, false));
    canvas.addEventListener('pointercancel', event => endDrag(event, true));
    canvas.addEventListener('lostpointercapture', event => { if (drag?.id === event.pointerId) endDrag(event, true); });
    document.addEventListener('click', event => {
      const anchor = event.target.closest('a[href^="#project-"]');
      if (!anchor || !ready) return;
      const index = panels.findIndex(panel => '#' + panel.id === anchor.getAttribute('href'));
      if (index < 0) return;
      event.preventDefault(); event.stopImmediatePropagation();
      select(index); history.replaceState(null, '', '#' + panels[index].id);
      window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 105, behavior: motion.matches ? 'auto' : 'smooth' });
    }, true);
    window.addEventListener('hashchange', selectFromHash);
    document.addEventListener('visibilitychange', () => { lastTime = 0; wake(); });
    motion.addEventListener('change', () => { position = target; wake(); });
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage);
    observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (!visible && frameId) { cancelAnimationFrame(frameId); frameId = 0; lastTime = 0; }
      wake();
    }, { rootMargin: '100px' }); observer.observe(stage);
    paletteObserver = new MutationObserver(() => {
      const style = getComputedStyle(document.documentElement);
      colors.gold = style.getPropertyValue('--gold').trim() || '#c9a24a';
      paused = document.body.classList.contains('modal-open');
      if (paused && frameId) { cancelAnimationFrame(frameId); frameId = 0; }
      wake();
    });
    paletteObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    paletteObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  }

  function selectFromHash() {
    if (!ready) return;
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index >= 0) {
      select(index, { announce: false });
      requestAnimationFrame(() => window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - 105, behavior: 'auto' }));
    }
  }

  function restoreStaticCollection() {
    ready = false;
    if (frameId) cancelAnimationFrame(frameId); frameId = 0;
    root.classList.remove('rack-ready'); experience.hidden = true;
    panels.forEach(panel => {
      panel.hidden = false; panel.removeAttribute('role'); panel.removeAttribute('aria-labelledby'); panel.removeAttribute('tabindex');
    });
    renderer?.domElement.remove();
    observer?.disconnect(); resizeObserver?.disconnect(); paletteObserver?.disconnect();
    resources.forEach(resource => resource.dispose?.()); renderer?.dispose();
    disposed = true; window.dispatchEvent(new Event('resize'));
  }

  try {
    // Resolve local fonts before lettering the wood; no external texture or model downloads.
    await document.fonts.ready;
    renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setClearColor(0x000000, 0);
    if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
    else renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    stage.appendChild(renderer.domElement);
    scene.add(new T.HemisphereLight(0xdce5da, 0x312117, .65));
    const moon = new T.DirectionalLight(0xe4eee7, 1.25); moon.position.set(-3, 6, 8); scene.add(moon);
    const lantern = new T.PointLight(0xe8a066, 3.2, 16); lantern.position.set(3, 1, 4); scene.add(lantern);
    const rim = new T.DirectionalLight(0x8d9f9a, .6); rim.position.set(2, 4, -3); scene.add(rim);
    await buildPlaques(buildBeam());
    root.classList.add('rack-ready'); experience.hidden = false; ready = true;
    connectInteraction(); selectFromHash(); select(active, { announce: false }); resize();
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); restoreStaticCollection(); }, { once: true });
    window.addEventListener('pagehide', () => { if (frameId) { cancelAnimationFrame(frameId); frameId = 0; } });
    window.addEventListener('pageshow', wake);
  } catch (error) {
    restoreStaticCollection();
    console.info('The project collection is available in its static layout.');
  }
})();
