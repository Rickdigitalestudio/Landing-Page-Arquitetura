/* ============================================================
   RESIDENCIAL TRADIÇÃO — site interativo 3D
   Dock flutuante · cena de fundo · maquetes dos projetos
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Carrossel de depoimentos (com autoplay) ---------- */
  (function () {
    var quotes = [
      { text: 'A Tradição transformou nosso sonho em realidade. Acabamento impecável e entrega no prazo. Morar aqui superou tudo.', name: 'Marina S.', role: 'Moradora · Bloco A' },
      { text: 'Do atendimento à entrega das chaves, tudo transparente. O apartamento é ainda melhor que o decorado.', name: 'Carlos H.', role: 'Morador · Bloco B' }
    ];
    var i = 0;
    var tText = document.getElementById('tText');
    var tName = document.getElementById('tName');
    var tRole = document.getElementById('tRole');
    var card = document.querySelector('.t-card');
    if (!tText || !tName || !tRole) return;

    function show(n) {
      i = (n + quotes.length) % quotes.length;
      if (!reduceMotion) {
        tText.style.transition = 'opacity .25s ease';
        tText.style.opacity = '0';
        setTimeout(function () {
          tText.textContent = quotes[i].text;
          tName.textContent = quotes[i].name;
          tRole.textContent = quotes[i].role;
          tText.style.opacity = '1';
        }, 250);
      } else {
        tText.textContent = quotes[i].text;
        tName.textContent = quotes[i].name;
        tRole.textContent = quotes[i].role;
      }
    }
    document.getElementById('tPrev').addEventListener('click', function () { show(i - 1); });
    document.getElementById('tNext').addEventListener('click', function () { show(i + 1); });

    var timer = setInterval(function () { show(i + 1); }, 6500);
    if (card) {
      card.addEventListener('mouseenter', function () { clearInterval(timer); });
      card.addEventListener('mouseleave', function () { timer = setInterval(function () { show(i + 1); }, 6500); });
    }
  })();

  /* ---------- Menu flutuante: dropdown mobile ---------- */
  var navEl = document.querySelector('.nav');
  var linksEl = document.querySelector('.nav .links');
  var toggleBtn = document.querySelector('.menu-toggle');

  function setMenu(open) {
    if (!linksEl || !toggleBtn) return;
    linksEl.classList.toggle('active', open);
    toggleBtn.classList.toggle('active', open);
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggleBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (open && navEl) navEl.classList.remove('nav-hidden');
  }
  if (toggleBtn && linksEl) {
    toggleBtn.addEventListener('click', function () {
      setMenu(!linksEl.classList.contains('active'));
    });
    document.addEventListener('click', function (e) {
      if (linksEl.classList.contains('active') && navEl && !navEl.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    linksEl.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* ---------- Dock: encolhe/esconde + link ativo (scrollspy) ---------- */
  if (navEl) {
    var lastY = window.scrollY;
    var headerState = function () {
      var y = window.scrollY;
      navEl.classList.toggle('scrolled', y > 30);
      var menuOpen = linksEl && linksEl.classList.contains('active');
      if (!menuOpen) {
        if (y > lastY + 6 && y > 320) navEl.classList.add('nav-hidden');
        else if (y < lastY - 6 || y < 160) navEl.classList.remove('nav-hidden');
      }
      lastY = y;
    };
    window.addEventListener('scroll', headerState, { passive: true });
    navEl.addEventListener('mouseenter', function () { navEl.classList.remove('nav-hidden'); });
    headerState();

    var navLinks = Array.prototype.slice.call(linksEl ? linksEl.querySelectorAll('a[href^="#"]') : []);
    if (navLinks.length) {
      var spy = function () {
        var cur = null;
        navLinks.forEach(function (a) {
          var sec = document.querySelector(a.getAttribute('href'));
          if (sec && sec.getBoundingClientRect().top <= window.innerHeight * 0.38) cur = a;
        });
        navLinks.forEach(function (a) { a.classList.toggle('active', a === cur); });
      };
      window.addEventListener('scroll', spy, { passive: true });
      spy();
    }
  }

  /* ---------- Barra de progresso de leitura ---------- */
  (function () {
    var progress = document.getElementById('progress');
    if (!progress) return;
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- Reveal on scroll ---------- */
  (function () {
    var targets = document.querySelectorAll(
      '.about-text, .about-photo, .services .eyebrow, .services h2, .service-card, ' +
      '.section-head, .proj-card, .featured-text, .featured-photo, .t-left, .t-card, ' +
      '.cta-text, .cta-photo'
    );
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var groups = {};
    targets.forEach(function (el) {
      el.classList.add('reveal');
      var key = el.className.split(' ')[0];
      groups[key] = (groups[key] || 0);
      el.style.setProperty('--rd', (groups[key] * 90) + 'ms');
      groups[key]++;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- Tilt 3D nos cards de serviço ---------- */
  (function () {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.service-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY(' + (px * 9) + 'deg) rotateX(' + (-py * 9) + 'deg) translateY(-6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  })();

  /* ============================================================
     CENA 3D DE FUNDO — cidade wireframe interativa
     Parallax de mouse · repulsão com mola · pulso no clique ·
     câmera e névoa reagem ao scroll
     ============================================================ */
  (function () {
    if (!window.THREE || reduceMotion) return;
    var host = document.getElementById('bg3d');
    if (!host) return;
    var isMobile = window.innerWidth < 760;

    var renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    host.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.021);

    var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 140);
    camera.position.set(0, 4.6, 28);

    scene.add(new THREE.AmbientLight(0x505048, 1.3));
    var key = new THREE.DirectionalLight(0xd8c3a5, 1.1);
    key.position.set(-12, 22, 10);
    scene.add(key);
    var rim = new THREE.PointLight(0xfff2df, 16, 70);
    rim.position.set(12, 14, 16);
    scene.add(rim);

    // grade do chão (desliza com o scroll)
    var grid = new THREE.GridHelper(200, 100, 0xd8c3a5, 0x3a3229);
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    scene.add(grid);

    // prédios wireframe
    var count = isMobile ? 12 : 26;
    var buildings = [];
    var edgeMat = new THREE.LineBasicMaterial({ color: 0xd8c3a5, transparent: true, opacity: 0.8 });
    for (var i = 0; i < count; i++) {
      var w = 0.9 + Math.random() * 2.2;
      var h = 1.6 + Math.random() * 7.5;
      var d = 0.9 + Math.random() * 2.2;
      var geo = new THREE.BoxGeometry(w, h, d);
      var solid = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0x171612, metalness: 0.9, roughness: 0.4,
        emissive: 0xd8c3a5, emissiveIntensity: 0.05
      }));
      var edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      var b = new THREE.Group();
      b.add(solid);
      b.add(edges);
      var x = (Math.random() * 2 - 1) * 26;
      if (Math.abs(x) < 3.2) x += (x < 0 ? -3.2 : 3.2); // corredor central livre
      var z = -40 + Math.random() * 46;
      b.position.set(x, h / 2, z);
      b.userData = { base: b.position.clone(), ph: Math.random() * Math.PI * 2, offX: 0, offZ: 0, velX: 0, velZ: 0, solid: solid };
      scene.add(b);
      buildings.push(b);
    }

    // poeira dourada
    var pCount = isMobile ? 60 : 200;
    var pGeo = new THREE.BufferGeometry();
    var pPos = new Float32Array(pCount * 3);
    for (var p = 0; p < pCount; p++) {
      pPos[p * 3] = (Math.random() * 2 - 1) * 34;
      pPos[p * 3 + 1] = Math.random() * 16;
      pPos[p * 3 + 2] = -38 + Math.random() * 50;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    var particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xd8c3a5, size: 0.07, transparent: true, opacity: 0.55, sizeAttenuation: true
    }));
    scene.add(particles);

    // ---- interações ----
    var mouse = { x: 0, y: 0 };            // -1..1
    var mouseWorld = new THREE.Vector3();  // no plano y=0
    var pulse = 0;                          // 0..1 decai
    var raycaster = new THREE.Raycaster();
    var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    var ndc = new THREE.Vector2();

    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      ndc.set(mouse.x, -mouse.y);
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(groundPlane, mouseWorld);
    }, { passive: true });

    window.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('a, button, input, .nav, .proj-card')) return;
      pulse = 1;
      buildings.forEach(function (b) {
        var dx = b.userData.base.x - mouseWorld.x;
        var dz = b.userData.base.z - mouseWorld.z;
        var dist = Math.sqrt(dx * dx + dz * dz) || 1;
        var f = Math.max(0, 1 - dist / 34) * 0.55;
        b.userData.velX += (dx / dist) * f;
        b.userData.velZ += (dz / dist) * f;
        b.userData.solid.material.emissiveIntensity = Math.max(b.userData.solid.material.emissiveIntensity, f * 1.6);
      });
    });

    var scrollP = 0;
    var lastScroll = window.scrollY;
    var gridOffset = 0;
    window.addEventListener('scroll', function () {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollP = Math.min(1, window.scrollY / max);
      gridOffset += (window.scrollY - lastScroll) * 0.02;
      lastScroll = window.scrollY;
    }, { passive: true });

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    var camX = 0;
    var t0 = performance.now();
    (function animate(now) {
      requestAnimationFrame(animate);
      if (document.hidden) return;
      var t = (now - t0) * 0.001;

      // parallax de câmera + voo com scroll
      camX += (mouse.x * 2.6 - camX) * 0.04;
      camera.position.x = camX;
      camera.position.y = 4.6 + scrollP * 2.6 - mouse.y * 0.8;
      camera.position.z = 28 - scrollP * 9;
      camera.lookAt(0, 1.6 - scrollP * 1.2, -12);

      // pulso do clique (FOV kick)
      if (pulse > 0.001) {
        camera.fov = 55 + pulse * 7;
        pulse *= 0.94;
      } else if (camera.fov !== 55) {
        camera.fov += (55 - camera.fov) * 0.1;
      }
      camera.updateProjectionMatrix();

      // grade desliza
      grid.position.z = (gridOffset % 2);

      // prédios: respiração + repulsão com mola + retorno
      for (var i = 0; i < buildings.length; i++) {
        var b = buildings[i];
        var u = b.userData;
        u.velX += -u.offX * 0.06; u.velZ += -u.offZ * 0.06;   // mola
        u.velX *= 0.88; u.velZ *= 0.88;                        // amortecimento
        u.offX += u.velX; u.offZ += u.velZ;
        b.position.x = u.base.x + u.offX;
        b.position.z = u.base.z + u.offZ;
        b.position.y = u.base.y + Math.sin(t * 0.6 + u.ph) * 0.06;
        b.rotation.y = u.offX * 0.06;
        if (u.solid.material.emissiveIntensity > 0.001) {
          u.solid.material.emissiveIntensity *= 0.95;
        }
      }

      // partículas respiram
      particles.rotation.y = t * 0.01;
      particles.material.opacity = 0.4 + Math.sin(t * 0.5) * 0.15;

      renderer.render(scene, camera);
    })(t0);
  })();

  /* ============================================================
     MAQUETES 3D DOS PROJETOS — versão ultra-realista
     PBR · env map · sombras reais · texturas procedurais ·
     vidro/água físicos · sprites de brilho · arraste para girar
     ============================================================ */
  (function () {
    if (!window.THREE) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.proj-card'));
    if (!cards.length) return;

    if (reduceMotion) {
      cards.forEach(function (c) { c.classList.add('show-photo'); });
      document.querySelectorAll('.maq-toggle').forEach(function (b) { b.style.display = 'none'; });
      return;
    }

    var LOW = window.innerWidth < 760; // mobile: sem sombras/transmissão, DPR menor

    /* ============================================================
       TEXTURAS PROCEDURAIS (canvas) — compartilhadas entre cenas
       ============================================================ */
    function canvasTex(size, draw, rep) {
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      draw(c.getContext('2d'), size);
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.colorSpace = THREE.SRGBColorSpace;
      if (rep) t.repeat.set(rep[0], rep[1]);
      t.anisotropy = 4;
      return t;
    }
    var TEX = {};
    function tx(name, maker) { if (!TEX[name]) TEX[name] = maker(); return TEX[name]; }
    function repT(t, rx, ry) {
      var c = t.clone();
      c.needsUpdate = true;
      c.wrapS = c.wrapT = THREE.RepeatWrapping;
      c.repeat.set(rx, ry);
      return c;
    }

    function texWood() {
      return canvasTex(256, function (x, s) {
        x.fillStyle = '#9b7b57'; x.fillRect(0, 0, s, s);
        var plank = s / 4;
        for (var i = 0; i < 4; i++) {
          x.fillStyle = i % 2 ? '#93734f' : '#a1815c';
          x.fillRect(0, i * plank + 1, s, plank - 2);
          x.strokeStyle = 'rgba(58,42,26,.6)'; x.lineWidth = 2;
          x.beginPath(); x.moveTo(0, i * plank); x.lineTo(s, i * plank); x.stroke();
          for (var gI = 0; gI < 24; gI++) {
            x.strokeStyle = 'rgba(' + (74 + Math.random() * 26 | 0) + ',52,30,' + (0.05 + Math.random() * 0.12) + ')';
            x.lineWidth = 0.6 + Math.random();
            var gy = i * plank + Math.random() * plank;
            x.beginPath(); x.moveTo(0, gy);
            x.bezierCurveTo(s * 0.3, gy + (Math.random() * 6 - 3), s * 0.6, gy + (Math.random() * 6 - 3), s, gy + (Math.random() * 8 - 4));
            x.stroke();
          }
          var sx = (i % 2) * plank * 1.5;
          for (var v = sx; v < s; v += plank * 2) {
            x.strokeStyle = 'rgba(50,36,22,.55)'; x.lineWidth = 2;
            x.beginPath(); x.moveTo(v, i * plank + 1); x.lineTo(v, (i + 1) * plank - 1); x.stroke();
          }
        }
      });
    }

    function texPlaster() {
      return canvasTex(256, function (x, s) {
        x.fillStyle = '#eae5db'; x.fillRect(0, 0, s, s);
        for (var i = 0; i < 2600; i++) {
          x.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '162,156,146' : '255,255,255') + ',' + (Math.random() * 0.06) + ')';
          x.fillRect(Math.random() * s, Math.random() * s, 2, 2);
        }
        for (var b = 0; b < 12; b++) {
          var gx = Math.random() * s, gy = Math.random() * s, r = 22 + Math.random() * 54;
          var gr = x.createRadialGradient(gx, gy, 0, gx, gy, r);
          gr.addColorStop(0, 'rgba(190,184,172,.09)'); gr.addColorStop(1, 'rgba(190,184,172,0)');
          x.fillStyle = gr; x.beginPath(); x.arc(gx, gy, r, 0, 7); x.fill();
        }
      });
    }

    function texConcrete(dark) {
      return canvasTex(256, function (x, s) {
        x.fillStyle = dark ? '#2b2a27' : '#d6d1c8'; x.fillRect(0, 0, s, s);
        for (var i = 0; i < 5200; i++) {
          var a = Math.random() * 0.09;
          x.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,' + a + ')' : 'rgba(255,255,255,' + a + ')';
          x.fillRect(Math.random() * s, Math.random() * s, 1.6, 1.6);
        }
      });
    }

    function texFabric(hex) {
      return canvasTex(128, function (x, s) {
        x.fillStyle = hex; x.fillRect(0, 0, s, s);
        for (var i = 0; i < 3400; i++) {
          x.fillStyle = 'rgba(0,0,0,' + (Math.random() * 0.1) + ')';
          x.fillRect(Math.random() * s, Math.random() * s, 1.3, 1.3);
        }
        x.strokeStyle = 'rgba(255,255,255,.055)';
        for (var r = 0; r < s; r += 3) { x.beginPath(); x.moveTo(0, r + 0.5); x.lineTo(s, r + 0.5); x.stroke(); }
      });
    }

    function texMarble() {
      return canvasTex(256, function (x, s) {
        x.fillStyle = '#f4f1ea'; x.fillRect(0, 0, s, s);
        try { x.filter = 'blur(1.4px)'; } catch (e) {}
        for (var v = 0; v < 9; v++) {
          x.strokeStyle = 'rgba(' + (110 + v * 5) + ',' + (106 + v * 4) + ',' + (100 + v * 4) + ',' + (0.22 + Math.random() * 0.3) + ')';
          x.lineWidth = 0.8 + Math.random() * 2.4;
          x.beginPath();
          var y0 = Math.random() * s;
          x.moveTo(-10, y0);
          x.bezierCurveTo(s * 0.3, y0 + (Math.random() * 120 - 60), s * 0.6, Math.random() * s, s + 10, Math.random() * s);
          x.stroke();
        }
        try { x.filter = 'none'; } catch (e2) {}
      });
    }

    function texPavement() {
      return canvasTex(256, function (x, s) {
        x.fillStyle = '#7d786e'; x.fillRect(0, 0, s, s);
        var t = 64;
        for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) {
          x.fillStyle = (i % 2) === (j % 2) ? '#a6a094' : '#989286';
          x.fillRect(i * t + 3, j * t + 3, t - 6, t - 6);
          for (var k = 0; k < 200; k++) {
            x.fillStyle = 'rgba(0,0,0,' + Math.random() * 0.07 + ')';
            x.fillRect(i * t + 3 + Math.random() * (t - 6), j * t + 3 + Math.random() * (t - 6), 1.4, 1.4);
          }
        }
      });
    }

    function texNoise() { // grayscale p/ bump
      var c = document.createElement('canvas'); c.width = c.height = 128;
      var x = c.getContext('2d');
      var img = x.createImageData(128, 128);
      for (var i = 0; i < img.data.length; i += 4) {
        var v = 92 + Math.random() * 74;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }

    function texWaterNormal() {
      var s = 128;
      var c = document.createElement('canvas'); c.width = c.height = s;
      var ctx = c.getContext('2d');
      var img = ctx.createImageData(s, s);
      var TAU = Math.PI * 2;
      function h(px, py) {
        var x = (((px % s) + s) % s) / s, y = (((py % s) + s) % s) / s;
        return Math.sin(TAU * 3 * x + Math.sin(TAU * 2 * y) * 0.9) * 0.55
             + Math.sin(TAU * (2 * y + 3 * x) + 1.1) * 0.3
             + Math.sin(TAU * (5 * x - 4 * y)) * 0.15;
      }
      for (var py = 0; py < s; py++) for (var px = 0; px < s; px++) {
        var dx = h(px + 1, py) - h(px - 1, py);
        var dy = h(px, py + 1) - h(px, py - 1);
        var nx = -dx * 1.1, ny = -dy * 1.1, nz = 1;
        var L = Math.sqrt(nx * nx + ny * ny + 1);
        var i = (py * s + px) * 4;
        img.data[i] = (nx / L * 0.5 + 0.5) * 255;
        img.data[i + 1] = (ny / L * 0.5 + 0.5) * 255;
        img.data[i + 2] = (nz / L * 0.5 + 0.5) * 255;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(2, 2);
      return t;
    }

    function texScreen() { // TV ligada
      return canvasTex(128, function (x, s) {
        var g = x.createLinearGradient(0, 0, 0, s);
        g.addColorStop(0, '#0d3a5c'); g.addColorStop(0.6, '#2a7ea6'); g.addColorStop(1, '#0a2438');
        x.fillStyle = g; x.fillRect(0, 0, s, s);
        x.fillStyle = 'rgba(255,214,150,.95)';
        x.beginPath(); x.arc(s * 0.68, s * 0.36, 12, 0, 7); x.fill();
        x.fillStyle = '#0a2b38';
        x.beginPath();
        x.moveTo(0, s * 0.8); x.lineTo(s * 0.3, s * 0.56); x.lineTo(s * 0.55, s * 0.76);
        x.lineTo(s * 0.8, s * 0.62); x.lineTo(s, s * 0.74); x.lineTo(s, s); x.lineTo(0, s);
        x.fill();
      });
    }

    function texView() { // vista da janela (dia)
      return canvasTex(128, function (x, s) {
        var g = x.createLinearGradient(0, 0, 0, s);
        g.addColorStop(0, '#7fb6e4'); g.addColorStop(0.5, '#dfeaf2'); g.addColorStop(0.66, '#cbc5b7'); g.addColorStop(1, '#7d766a');
        x.fillStyle = g; x.fillRect(0, 0, s, s);
        x.fillStyle = 'rgba(255,255,255,.55)';
        for (var i = 0; i < 3; i++) {
          x.beginPath(); x.ellipse(16 + Math.random() * 96, 14 + Math.random() * 26, 17, 7, 0, 0, 7); x.fill();
        }
        x.fillStyle = 'rgba(96,102,110,.9)';
        var bx = 0;
        while (bx < s) {
          var bw = 10 + Math.random() * 18, bh = 12 + Math.random() * 30;
          x.fillRect(bx, s * 0.72 - bh, bw, bh);
          bx += bw + 4;
        }
        x.fillStyle = 'rgba(150,146,136,.6)'; x.fillRect(0, s * 0.72, s, s * 0.28);
      });
    }

    function texClad() { // ripado vertical — madeira escura
      return canvasTex(512, function (x, s) {
        x.fillStyle = '#3a2f26'; x.fillRect(0, 0, s, s);
        var pw = 16;
        for (var i = 0; i < s / pw; i++) {
          var v = Math.random();
          x.fillStyle = 'rgb(' + (52 + v * 16 | 0) + ',' + (42 + v * 13 | 0) + ',' + (32 + v * 11 | 0) + ')';
          x.fillRect(i * pw + 1, 0, pw - 2, s);
          x.fillStyle = 'rgba(20,14,10,.85)';
          x.fillRect(i * pw, 0, 1.4, s);
          for (var gr = 0; gr < 4; gr++) {
            var gx = i * pw + 3 + Math.random() * (pw - 6);
            x.strokeStyle = 'rgba(' + (30 + Math.random() * 26 | 0) + ',' + (22 + Math.random() * 20 | 0) + ',' + (15 + Math.random() * 15 | 0) + ',.5)';
            x.lineWidth = 0.8;
            x.beginPath(); x.moveTo(gx, 0);
            x.bezierCurveTo(gx + (Math.random() * 4 - 2), s * 0.33, gx + (Math.random() * 4 - 2), s * 0.66, gx + (Math.random() * 4 - 2), s);
            x.stroke();
          }
        }
      });
    }

    function texBrick() { // tijolo branco (núcleo da entrada)
      return canvasTex(256, function (x, s) {
        x.fillStyle = '#d6d1c5'; x.fillRect(0, 0, s, s);
        var bw = 84, bh = 28;
        for (var r = 0; r * bh < s; r++) {
          var off = (r % 2) * (bw / 2);
          for (var cI = -1; cI * bw + off < s; cI++) {
            var bx = cI * bw + off + 3, by = r * bh + 3;
            var v = Math.random();
            x.fillStyle = 'rgb(' + (232 + v * 18 | 0) + ',' + (228 + v * 17 | 0) + ',' + (218 + v * 16 | 0) + ')';
            x.fillRect(bx, by, bw - 6, bh - 6);
            for (var k = 0; k < 26; k++) {
              x.fillStyle = 'rgba(180,174,162,' + (Math.random() * 0.16) + ')';
              x.fillRect(bx + Math.random() * (bw - 6), by + Math.random() * (bh - 6), 2, 2);
            }
          }
        }
      });
    }

    function texGrass() { // gramado
      return canvasTex(256, function (x, s) {
        x.fillStyle = '#4a6440'; x.fillRect(0, 0, s, s);
        var tones = ['rgba(88,116,66,', 'rgba(64,88,52,', 'rgba(104,128,74,', 'rgba(52,74,44,'];
        for (var i = 0; i < 8500; i++) {
          x.fillStyle = tones[i % 4] + (0.25 + Math.random() * 0.5) + ')';
          x.fillRect(Math.random() * s, Math.random() * s, 1.6, 3);
        }
        for (var b = 0; b < 6; b++) {
          x.fillStyle = 'rgba(255,255,255,.03)';
          x.fillRect(0, b * (s / 6), s, s / 12);
        }
      });
    }

    function texDuskSky() { // céu de entardecer (fundo do giro 360°)
      var c = document.createElement('canvas'); c.width = 512; c.height = 256;
      var x = c.getContext('2d');
      var g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#0c1322'); g.addColorStop(0.3, '#1c2946');
      g.addColorStop(0.44, '#465878'); g.addColorStop(0.5, '#8a8fa4');
      g.addColorStop(0.53, '#6a6b78'); g.addColorStop(0.62, '#2a2c34'); g.addColorStop(1, '#14151a');
      x.fillStyle = g; x.fillRect(0, 0, 512, 256);
      var rg = x.createRadialGradient(370, 122, 4, 370, 122, 175);
      rg.addColorStop(0, 'rgba(244,186,128,.95)');
      rg.addColorStop(0.4, 'rgba(214,146,96,.45)');
      rg.addColorStop(1, 'rgba(214,146,96,0)');
      x.fillStyle = rg; x.fillRect(200, 20, 340, 220);
      for (var i = 0; i < 90; i++) {
        x.fillStyle = 'rgba(255,255,255,' + (0.15 + Math.random() * 0.5) + ')';
        x.fillRect(Math.random() * 512, Math.random() * 90, 1.2, 1.2);
      }
      var t = new THREE.CanvasTexture(c);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function texEquirect() { // ambiente para reflexos (PBR)
      var c = document.createElement('canvas'); c.width = 512; c.height = 256;
      var x = c.getContext('2d');
      var g = x.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#fdf7ec'); g.addColorStop(0.42, '#b6c4d4');
      g.addColorStop(0.52, '#57514a'); g.addColorStop(1, '#1d1a17');
      x.fillStyle = g; x.fillRect(0, 0, 512, 256);
      try { x.filter = 'blur(10px)'; } catch (e) {}
      x.fillStyle = 'rgba(255,255,255,.95)'; x.fillRect(48, 34, 96, 60);
      x.fillStyle = 'rgba(255,238,206,.9)'; x.fillRect(300, 46, 120, 52);
      x.fillStyle = 'rgba(206,224,255,.7)'; x.fillRect(196, 74, 64, 34);
      try { x.filter = 'none'; } catch (e2) {}
      x.fillStyle = 'rgba(216,195,165,.4)'; x.fillRect(0, 168, 512, 26);
      var t = new THREE.CanvasTexture(c);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function texGlow() {
      var c = document.createElement('canvas'); c.width = c.height = 64;
      var x = c.getContext('2d');
      var g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.35, 'rgba(255,255,255,.4)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 64, 64);
      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    /* ============================================================
       HELPERS DE GEOMETRIA / MATERIAIS
       ============================================================ */
    function std(o) { return new THREE.MeshStandardMaterial(o); }
    function phy(o) { return new THREE.MeshPhysicalMaterial(o); }
    function box(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); }
    function cyl(rt, rb, h, m, seg) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), m); }
    function sph(r, m) { return new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), m); }
    function cone(r, h, m, seg) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 18), m); }

    function glow(color, scale, op) {
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tx('glow', texGlow), color: color, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false,
        opacity: op == null ? 0.7 : op
      }));
      sp.scale.setScalar(scale);
      return sp;
    }

    function glassMat() {
      if (LOW) return phy({ color: 0xcfe2ea, transparent: true, opacity: 0.38, roughness: 0.06, metalness: 0, envMapIntensity: 1.2 });
      return phy({ color: 0xeaf5f9, transmission: 0.9, thickness: 0.05, roughness: 0.05, metalness: 0, ior: 1.45, envMapIntensity: 1.3, transparent: true });
    }

    function shadowAll(root) {
      root.traverse(function (o) {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
      });
      // vidros/objetos transparentes não devem projetar sombra escura
      root.traverse(function (o) {
        if (o.isMesh && o.material && (o.material.transmission > 0 || (o.material.transparent && o.material.opacity < 0.9))) {
          o.castShadow = false;
        }
      });
    }

    function lightRig(scene, mode, span) {
      var key, fill, back;
      var sp = span || 4.6;
      if (mode === 'night') {
        scene.add(new THREE.HemisphereLight(0x93abcf, 0x241f1a, 0.32));
        scene.add(new THREE.AmbientLight(0xffffff, 0.08));
        key = new THREE.DirectionalLight(0xa9c4ea, 1.35);
        fill = new THREE.DirectionalLight(0x7289ab, 0.55);
        back = new THREE.DirectionalLight(0xffcf96, 0.5);
        back.position.set(-2, 2.5, -5);
      } else if (mode === 'dusk') {
        scene.add(new THREE.HemisphereLight(0xf3d3ae, 0x35302a, 0.45));
        scene.add(new THREE.AmbientLight(0xffffff, 0.12));
        key = new THREE.DirectionalLight(0xffc186, 2.2);
        fill = new THREE.DirectionalLight(0x93b4dc, 0.85);
        back = new THREE.DirectionalLight(0xff8f4d, 0.65);
        back.position.set(-3, 2, -5);
      } else {
        scene.add(new THREE.HemisphereLight(0xeaf2fb, 0x4a423a, 0.6));
        scene.add(new THREE.AmbientLight(0xffffff, 0.16));
        key = new THREE.DirectionalLight(0xfff2e0, 2.7);
        fill = new THREE.DirectionalLight(0xbcd2ea, 1.0);
        back = new THREE.DirectionalLight(0xffffff, 0.45);
        back.position.set(0, 3, -6);
      }
      key.position.set(4.5, 7, 5);
      if (!LOW) {
        key.castShadow = true;
        key.shadow.mapSize.set(1024, 1024);
        key.shadow.camera.left = -sp; key.shadow.camera.right = sp;
        key.shadow.camera.top = sp; key.shadow.camera.bottom = sp;
        key.shadow.camera.near = 1; key.shadow.camera.far = span ? 36 : 22;
        key.shadow.bias = -0.0006;
        key.shadow.normalBias = 0.025;
      }
      fill.position.set(-5, 3.5, -2);
      scene.add(key); scene.add(fill); scene.add(back);
    }

    function basePlate() {
      var g = new THREE.Group();
      var noise = repT(tx('noise', texNoise), 4, 4);
      var top = cyl(2.6, 2.62, 0.12, std({
        map: repT(tx('concD', function () { return texConcrete(true); }), 3, 3),
        roughness: 0.58, metalness: 0.25, bumpMap: noise, bumpScale: 0.008
      }), 48);
      top.position.y = 0.02;
      g.add(top);
      var gold = std({ color: 0xd8c3a5, metalness: 1, roughness: 0.24, envMapIntensity: 1.2 });
      var rim = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.02, 10, 72), gold);
      rim.rotation.x = Math.PI / 2; rim.position.y = 0.08; g.add(rim);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.007, 8, 72), gold);
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.081; g.add(ring);
      return g;
    }

    /* ============================================================
       MODELOS — CASA TRADIÇÃO (fiel à foto: 2 pavimentos, ripado
       escuro, caixa branca, vidro amplo, tijolo branco e o
       eucalipto icônica) — usada na maquete do projeto 1 e no
       giro 360° do hero
       ============================================================ */
    function buildCasa() {
      var g = new THREE.Group();
      var noise = repT(tx('noise', texNoise), 3, 3);
      var cladM = std({ map: repT(tx('clad', texClad), 2, 1.5), roughness: 0.78, metalness: 0, bumpMap: noise, bumpScale: 0.007 });
      var renderM = std({ map: tx('plaster', texPlaster), roughness: 0.86, metalness: 0, bumpMap: noise, bumpScale: 0.004 });
      var charM = std({ color: 0x23221e, roughness: 0.48, metalness: 0.5 });
      var deckM = std({ map: repT(tx('wood', texWood), 3, 1), roughness: 0.72, metalness: 0 });
      var brickM = std({ map: repT(tx('brick', texBrick), 1.4, 2.2), roughness: 0.92, metalness: 0, bumpMap: noise, bumpScale: 0.01 });
      var slabM = std({ map: repT(tx('concL', function () { return texConcrete(false); }), 2, 2), roughness: 0.74, metalness: 0.03 });
      var whiteM = std({ color: 0xf0ece3, roughness: 0.8 });
      var fenceM = std({ color: 0x2a2823, roughness: 0.75 });
      var leafM = std({ color: 0x3f5740, roughness: 0.9, bumpMap: noise, bumpScale: 0.012 });
      var glass = glassMat();
      var glows = [], blobs = [];

      function lit(i, hex) {
        return std({ color: 0x1b1410, emissive: hex || 0xffc077, emissiveIntensity: i, roughness: 0.95 });
      }
      function glowMat(i, hex) {
        var m = lit(i, hex);
        glows.push({ mat: m, base: i, ph: Math.random() * 6.28 });
        return m;
      }
      // janela: marco atrás + brilho + vidro (face z; dz = +1 frontal, -1 traseira)
      function win(w, h, x, y, zFace, i, dz) {
        var fr = box(w + 0.14, h + 0.14, 0.06, charM);
        fr.position.set(x, y, zFace); g.add(fr);
        var gw = box(w, h, 0.05, glowMat(i));
        gw.position.set(x, y, zFace + dz * 0.055); g.add(gw);
        var gl = box(w + 0.06, h + 0.06, 0.03, glass);
        gl.position.set(x, y, zFace + dz * 0.095); g.add(gl);
      }
      // janela em face lateral (eixo x)
      function winX(w, h, xFace, y, z, i, dz) {
        var fr = box(0.06, h + 0.14, w + 0.14, charM);
        fr.position.set(xFace, y, z); g.add(fr);
        var gw = box(0.05, h, w, glowMat(i));
        gw.position.set(xFace + dz * 0.055, y, z); g.add(gw);
        var gl = box(0.03, h + 0.06, w + 0.06, glass);
        gl.position.set(xFace + dz * 0.095, y, z); g.add(gl);
      }
      function point(hex, inten, dist, x, y, z) {
        var pl = new THREE.PointLight(hex, inten, dist, 2);
        pl.position.set(x, y, z); g.add(pl);
      }

      /* ---------- plinto + volumes ---------- */
      var plinth = box(6.5, 0.2, 3.7, std({ color: 0x1d1b18, roughness: 0.85 }));
      plinth.position.y = 0.1; g.add(plinth);

      // ALA ESQUERDA — ripado escuro (garagem + home office)
      var lw = box(2.3, 1.4, 3.4, cladM); lw.position.set(-2.05, 0.9, 0); g.add(lw);
      var lwCap = box(2.38, 0.1, 3.48, charM); lwCap.position.set(-2.05, 1.65, 0); g.add(lwCap);
      var gar = box(1.2, 1.0, 0.07, std({ color: 0x35332d, roughness: 0.6, metalness: 0.35 }));
      gar.position.set(-2.6, 0.72, 1.72); g.add(gar);
      win(0.9, 0.4, -1.45, 1.15, 1.7, 1.15, 1);              // faixa do home office
      var wl = sph(0.045, glowMat(2.2, 0xffd9a0));
      wl.position.set(-1.0, 1.5, 1.76); g.add(wl);
      var wls = glow(0xffd9a0, 0.3, 0.7); wls.position.set(-1.0, 1.5, 1.79); g.add(wls);
      winX(0.9, 0.6, -3.2, 1.1, -0.5, 1.0, -1);              // lateral oeste
      win(1.0, 0.6, -2.0, 1.15, -1.7, 0.9, -1);              // traseira

      // CAIXA BRANCA SUPERIOR ESQ (dormitório)
      var wl2 = box(1.95, 1.2, 2.7, renderM); wl2.position.set(-2.12, 2.2, -0.15); g.add(wl2);
      var wlCap = box(2.02, 0.08, 2.78, charM); wlCap.position.set(-2.12, 2.84, -0.15); g.add(wlCap);
      win(0.42, 0.9, -1.55, 2.2, 1.2, 1.0, 1);               // janela alta
      win(0.3, 0.3, -2.62, 2.42, 1.2, 0.8, 1);               // janela quadrada
      win(0.7, 0.5, -2.3, 2.2, -1.5, 0.8, -1);               // traseira

      // NÚCLEO DE TIJOLO (entrada)
      var br = box(1.2, 2.6, 1.7, brickM); br.position.set(-0.3, 1.5, -0.85); g.add(br);
      win(1.0, 1.32, -0.3, 0.9, 0.0, 1.35, 1);               // porta + sidelights
      var porch = box(1.5, 0.1, 1.35, slabM); porch.position.set(-0.3, 0.25, 0.66); g.add(porch);
      var st1 = box(1.3, 0.09, 0.3, slabM); st1.position.set(-0.3, 0.145, 1.42); g.add(st1);
      var st2 = box(1.1, 0.09, 0.3, slabM); st2.position.set(-0.3, 0.055, 1.74); g.add(st2);

      // VOLUME SUPERIOR ESCURO (dormitórios com brises verticais)
      var up = box(3.1, 1.2, 2.6, cladM); up.position.set(0.4, 2.26, -0.2); g.add(up);
      var upCap = box(3.18, 0.08, 2.68, charM); upCap.position.set(0.4, 2.9, -0.2); g.add(upCap);
      var soffP = box(1.5, 0.05, 1.14, whiteM); soffP.position.set(-0.3, 1.635, 0.52); g.add(soffP);
      [-0.85, -0.43, -0.01, 0.41, 0.83, 1.25, 1.67].forEach(function (sx, i) {
        win(0.2, 0.88, sx, 2.26, 1.1, 0.9 + (i % 3) * 0.25, 1);
        var fin = box(0.07, 1.06, 0.16, charM);
        fin.position.set(sx + 0.21, 2.26, 1.17); g.add(fin);
      });
      var band = box(2.95, 0.98, 0.03, glass); band.position.set(0.4, 2.26, 1.27); g.add(band);
      [-0.4, 0.4, 1.2].forEach(function (sx) { win(0.2, 0.8, sx, 2.26, -1.5, 0.8, -1); });
      winX(0.5, 0.7, -1.15, 2.26, 0.2, 0.85, -1);
      [-0.7, 0.4, 1.5].forEach(function (dx) {
        var sp = glow(0xffd9a0, 0.26, 0.4); sp.position.set(dx, 1.62, 1.14); g.add(sp);
      });

      // VOLUME VITRADO — estar/jantar (térreo direito)
      var slab = box(3.0, 0.2, 3.5, slabM); slab.position.set(1.7, 0.3, -0.05); g.add(slab);
      var roofR = box(3.35, 0.24, 3.9, cladM); roofR.position.set(1.75, 1.54, 0.02); g.add(roofR);
      var sofR = box(3.3, 0.05, 3.85, whiteM); sofR.position.set(1.75, 1.4, 0.02); g.add(sofR);
      var rW = box(3.0, 1.22, 0.16, cladM); rW.position.set(1.7, 0.81, -1.74); g.add(rW);
      var ret = box(0.16, 1.22, 3.5, cladM); ret.position.set(3.27, 0.81, -0.05); g.add(ret);
      var gv = box(2.95, 0.99, 0.05, glass); gv.position.set(1.7, 0.905, 1.68); g.add(gv);
      var gv2 = box(0.05, 0.99, 3.3, glass); gv2.position.set(3.18, 0.905, -0.05); g.add(gv2);
      [0.3, 0.95, 1.7, 2.45, 3.12].forEach(function (mx) {
        var mull = box(0.055, 1.01, 0.08, charM); mull.position.set(mx, 0.905, 1.69); g.add(mull);
      });
      var pipe = cyl(0.035, 0.035, 1.5, charM, 8); pipe.position.set(3.4, 0.75, 1.9); g.add(pipe);
      win(1.1, 0.5, 1.7, 0.95, -1.82, 0.85, -1);             // traseira

      // interno (visível pelo vidro)
      var backW = box(2.9, 0.98, 0.06, whiteM); backW.position.set(1.7, 0.89, -1.66); g.add(backW);
      var cabU = box(1.2, 0.38, 0.14, whiteM); cabU.position.set(2.45, 1.18, -1.55); g.add(cabU);
      var cabB = box(1.2, 0.5, 0.4, std({ color: 0xe6e1d6, roughness: 0.6 })); cabB.position.set(2.45, 0.66, -1.45); g.add(cabB);
      var splash = box(1.15, 0.12, 0.03, glowMat(0.8)); splash.position.set(2.45, 0.95, -1.6); g.add(splash);
      [2.1, 2.45, 2.8].forEach(function (px) {
        var cord = cyl(0.005, 0.005, 0.3, charM, 6); cord.position.set(px, 1.225, -1.2); g.add(cord);
        var bulb = sph(0.05, glowMat(2.4, 0xffd9a0));
        bulb.position.set(px, 1.07, -1.2); g.add(bulb);
        var sp = glow(0xffd9a0, 0.22, 0.5); sp.position.set(px, 1.07, -1.2); g.add(sp);
      });
      var table = box(1.05, 0.05, 0.62, deckM); table.position.set(1.35, 1.06, 0.1); g.add(table);
      [[-0.45, -0.24], [0.45, -0.24], [-0.45, 0.24], [0.45, 0.24]].forEach(function (o) {
        var leg = cyl(0.02, 0.02, 0.6, charM, 8); leg.position.set(1.35 + o[0], 0.74, 0.1 + o[1]); g.add(leg);
      });
      var chairM = std({ color: 0x3a352d, roughness: 0.7 });
      [[0.95, 0.62, 0], [1.75, 0.62, 0], [0.95, -0.42, 1], [1.75, -0.42, 1]].forEach(function (c) {
        var seat = box(0.34, 0.05, 0.34, chairM); seat.position.set(c[0], 0.8, c[1]); g.add(seat);
        var bk = box(0.34, 0.34, 0.05, chairM);
        bk.position.set(c[0], 0.98, c[1] + (c[2] ? -0.15 : 0.15)); g.add(bk);
      });
      var rug = box(1.5, 0.02, 1.1, std({ color: 0xd8cfbd, roughness: 0.95 })); rug.position.set(2.3, 0.41, 0.6); g.add(rug);
      var sofaM = std({ map: tx('fabSofa', function () { return texFabric('#aeb9a6'); }), roughness: 0.9 });
      var sofa = box(1.15, 0.32, 0.5, sofaM); sofa.position.set(2.5, 0.58, 0.75); g.add(sofa);
      var sofB = box(1.15, 0.3, 0.14, sofaM); sofB.position.set(2.5, 0.85, 0.96); g.add(sofB);
      var art = box(0.55, 0.42, 0.03, std({ color: 0xc9704a, emissive: 0x552012, emissiveIntensity: 0.35, roughness: 0.8 }));
      art.position.set(1.1, 1.12, -1.6); g.add(art);

      // luzes quentes (interiores, arandelas e luminárias)
      point(0xffca8a, 2.6, 5, 1.7, 1.2, 0.2);
      point(0xffc98a, 1.5, 3, -0.3, 1.3, 0.5);
      point(0xffbe78, 0.9, 2.4, -1.95, 1.2, 1.3);
      point(0xffc077, 1.1, 3, 0.4, 2.2, 1.6);
      [0.9, 2.5].forEach(function (dx) { point(0xffd9a0, 1.0, 2.6, dx, 1.3, 1.35); });
      [0.7, 1.5, 2.3, 3.0].forEach(function (dx) {
        var dl = cyl(0.05, 0.05, 0.02, glowMat(2.6, 0xffe0b0), 10);
        dl.position.set(dx, 1.36, 1.45); g.add(dl);
        var sp = glow(0xffdfae, 0.34, 0.55); sp.position.set(dx, 1.33, 1.45); g.add(sp);
      });
      [-0.65, 0.05].forEach(function (dx) {
        var dl = cyl(0.045, 0.045, 0.02, glowMat(2.4, 0xffe0b0), 10);
        dl.position.set(dx, 1.6, 0.55); g.add(dl);
        var sp = glow(0xffdfae, 0.3, 0.5); sp.position.set(dx, 1.55, 0.55); g.add(sp);
      });

      /* ---------- jardim ---------- */
      var deck = box(3.3, 0.3, 0.9, deckM); deck.position.set(1.75, 0.15, 2.15); g.add(deck);
      var dStep = box(1.3, 0.14, 0.3, deckM); dStep.position.set(1.4, 0.07, 2.72); g.add(dStep);
      [[3.7, 1.55], [3.8, 0.8], [3.75, 0.05], [3.65, -0.7]].forEach(function (p) {
        var s1 = box(0.55, 0.05, 0.4, std({ color: 0xb9b3a6, roughness: 0.85 }));
        s1.position.set(p[0], 0.025, p[1]); s1.rotation.y = p[1] * 0.2; g.add(s1);
      });
      [[3.7, 1.9], [3.7, 1.35]].forEach(function (p) {
        var pl = box(0.7, 0.32, 0.36, deckM); pl.position.set(p[0], 0.16, p[1]); g.add(pl);
        var b1 = sph(0.16, leafM); b1.scale.set(1.2, 0.7, 1); b1.position.set(p[0], 0.4, p[1]); g.add(b1);
      });
      var fence = box(0.08, 1.25, 4.0, fenceM); fence.position.set(-3.7, 0.625, -0.6); g.add(fence);
      var fence2 = box(3.4, 1.25, 0.08, fenceM); fence2.position.set(-1.4, 0.625, -2.6); g.add(fence2);
      [[-3.3, 1.9, 0.3], [-2.7, 2.35, 0.24], [3.3, 2.5, 0.26], [-1.7, 2.7, 0.22], [0.5, 2.9, 0.2]].forEach(function (b) {
        var sh = sph(b[2], leafM); sh.scale.set(1.2, 0.7, 1); sh.position.set(b[0], b[2] * 0.55, b[1]); g.add(sh);
      });

      // EUCALIPTO (árvore icônica da foto)
      var tree = new THREE.Group();
      var barkM = std({ color: 0xb0a794, roughness: 0.85, bumpMap: noise, bumpScale: 0.01 });
      var trunk = cyl(0.07, 0.19, 4.4, barkM, 12);
      trunk.position.set(0.18, 2.15, 0); trunk.rotation.z = -0.07; tree.add(trunk);
      [[1.5, 1.25, 0.35, 4.15, 0.12], [1.45, -1.2, 0.3, 4.2, -0.08],
       [1.2, 0.7, 0.4, 4.3, 0.5], [1.15, -0.65, 0.35, 4.35, -0.45],
       [1.4, 1.5, 0.3, 4.0, 0.28], [1.35, -1.45, 0.3, 4.05, -0.25],
       [1.0, 0.15, 0.4, 4.4, 0.05]].forEach(function (b) {
        var L = b[0], a = b[1];
        var br2 = cyl(0.02, 0.05, L, barkM, 8);
        br2.position.set(b[2] + Math.sin(a) * L / 2, b[3] + Math.cos(a) * L / 2, b[4]);
        br2.rotation.z = -a; br2.rotation.x = b[4] * 0.4;
        tree.add(br2);
      });
      var folM1 = std({ color: 0x3d4f3b, roughness: 0.95, bumpMap: noise, bumpScale: 0.02 });
      var folM2 = std({ color: 0x47603f, roughness: 0.95, bumpMap: noise, bumpScale: 0.02 });
      var canopy = [
        [0.1, 4.55, 0.1, 1.0], [0.8, 4.3, 0.3, 0.8], [-0.65, 4.35, -0.2, 0.85],
        [1.35, 4.15, -0.1, 0.7], [-1.3, 4.2, 0.3, 0.72], [0.4, 5.05, -0.35, 0.75],
        [-0.35, 4.95, 0.5, 0.68], [1.75, 4.3, 0.4, 0.55], [-1.7, 4.35, -0.35, 0.56],
        [1.0, 4.8, 0.55, 0.6], [-0.9, 4.75, -0.55, 0.58]
      ];
      canopy.forEach(function (cf, i) {
        var b = sph(cf[3], i % 2 ? folM1 : folM2);
        b.scale.set(1.25, 0.62, 1.1);
        b.position.set(cf[0], cf[1], cf[2]);
        tree.add(b);
        blobs.push({ m: b, ph: i * 0.9, y: cf[1] });
      });
      tree.position.set(-0.6, 0, 2.9);
      g.add(tree);

      return {
        group: g,
        tick: function (t) {
          glows.forEach(function (gl) {
            gl.mat.emissiveIntensity = gl.base * (0.86 + Math.sin(t * 0.6 + gl.ph) * 0.1);
          });
          blobs.forEach(function (b) {
            b.m.rotation.z = Math.sin(t * 0.5 + b.ph) * 0.05;
            b.m.position.y = b.y + Math.sin(t * 0.7 + b.ph * 1.3) * 0.03;
          });
        }
      };
    }

    function buildCasaMaquette() {
      var wrap = new THREE.Group();
      var lawn = new THREE.Mesh(new THREE.CircleGeometry(2.5, 48), std({
        map: repT(tx('grass', texGrass), 5, 5), roughness: 0.95, metalness: 0,
        bumpMap: repT(tx('noise', texNoise), 6, 6), bumpScale: 0.006
      }));
      lawn.rotation.x = -Math.PI / 2; lawn.position.y = 0.083; wrap.add(lawn);
      var casa = buildCasa();
      casa.group.scale.setScalar(0.53);
      casa.group.position.y = 0.084;
      wrap.add(casa.group);
      return { group: wrap, tick: casa.tick };
    }

    /* ============================================================
       MODELOS — LIVING INTEGRADO (dia)
       ============================================================ */
    function buildLiving() {
      var g = new THREE.Group();
      var noise = repT(tx('noise', texNoise), 3, 3);
      var wood = tx('wood', texWood);
      var plaster = tx('plaster', texPlaster);
      var marble = tx('marble', texMarble);
      var fabChampT = tx('fabChamp', function () { return texFabric('#c9b491'); });
      var fabWhiteT = tx('fabWhite', function () { return texFabric('#e9e2d2'); });

      var darkWoodM = std({ map: repT(wood, 2, 1), color: 0x6b5138, roughness: 0.5, metalness: 0.1 });
      var goldM = std({ color: 0xd8c3a5, metalness: 1, roughness: 0.26, envMapIntensity: 1.2 });

      // piso de madeira
      var floorM = std({
        map: repT(wood, 4, 3), roughness: 0.55, metalness: 0.04,
        bumpMap: repT(wood, 4, 3), bumpScale: 0.012, envMapIntensity: 0.5
      });
      var floor = box(2.9, 0.07, 2.1, floorM);
      floor.position.y = 0.115; g.add(floor);

      // paredes
      var wallM = std({ map: repT(plaster, 3, 1.4), roughness: 0.86, bumpMap: noise, bumpScale: 0.004 });
      var backW = box(2.9, 1.25, 0.06, wallM); backW.position.set(0, 0.775, -1.02); g.add(backW);
      var leftW = box(0.06, 1.25, 2.1, wallM); leftW.position.set(-1.42, 0.775, 0); g.add(leftW);
      var base1 = box(2.9, 0.05, 0.02, std({ color: 0xf5f1e8, roughness: 0.6 }));
      base1.position.set(0, 0.14, -0.985); g.add(base1);

      // ripas de madeira na parede
      var slatM = std({ map: repT(wood, 1, 3), color: 0xb99a74, roughness: 0.5, metalness: 0.1 });
      for (var sIdx = 0; sIdx < 7; sIdx++) {
        var slat = box(0.07, 1.0, 0.03, slatM);
        slat.position.set(-1.2 + sIdx * 0.11, 0.72, -0.98);
        g.add(slat);
      }

      // painel de mármore + TV ligada
      var panel = box(1.35, 0.78, 0.05, std({ map: repT(marble, 1.6, 1), roughness: 0.3, metalness: 0.05, envMapIntensity: 0.8 }));
      panel.position.set(0.5, 0.66, -0.975); g.add(panel);
      var tvFrame = box(1.16, 0.66, 0.03, std({ color: 0x131313, roughness: 0.35, metalness: 0.7 }));
      tvFrame.position.set(0.5, 0.66, -0.935); g.add(tvFrame);
      var screenTex2 = tx('screen', texScreen);
      var screenM = std({
        map: screenTex2, emissive: 0xffffff, emissiveMap: screenTex2,
        emissiveIntensity: 0.75, roughness: 0.28, metalness: 0.1
      });
      var screen = box(1.1, 0.6, 0.01, screenM);
      screen.position.set(0.5, 0.66, -0.915); g.add(screen);

      // sofá (tecido champagne)
      var sofaM = std({
        map: repT(fabChampT, 2, 2), roughness: 0.95,
        bumpMap: repT(fabChampT, 3, 3), bumpScale: 0.01
      });
      [-0.62, 0.62].forEach(function (x) {
        [-0.2, 0.2].forEach(function (z2) {
          var leg = cyl(0.02, 0.016, 0.1, darkWoodM, 8);
          leg.position.set(x, 0.15, 0.55 + z2); g.add(leg);
        });
      });
      var sofaBase = box(1.5, 0.16, 0.62, sofaM);
      sofaBase.position.set(0, 0.24, 0.55); g.add(sofaBase);
      for (var c = 0; c < 3; c++) {
        var seat = box(0.46, 0.1, 0.54, sofaM);
        seat.position.set(-0.5 + c * 0.5, 0.37, 0.53); g.add(seat);
      }
      for (var b2 = 0; b2 < 3; b2++) {
        var backC = box(0.46, 0.36, 0.12, sofaM);
        backC.position.set(-0.5 + b2 * 0.5, 0.55, 0.79);
        backC.rotation.x = -0.1;
        g.add(backC);
      }
      var p1 = box(0.3, 0.26, 0.1, std({ color: 0x44604a, roughness: 0.9, bumpMap: repT(fabChampT, 4, 4), bumpScale: 0.01 }));
      p1.position.set(-0.35, 0.58, 0.72); p1.rotation.x = -0.15; p1.rotation.z = 0.1; g.add(p1);
      var p2 = box(0.3, 0.26, 0.1, std({ color: 0xe9e2d2, roughness: 0.95, bumpMap: repT(fabWhiteT, 4, 4), bumpScale: 0.01 }));
      p2.position.set(0.35, 0.58, 0.72); p2.rotation.x = -0.15; p2.rotation.z = -0.1; g.add(p2);

      // tapete
      var rug = cyl(0.8, 0.8, 0.014, std({
        map: repT(fabWhiteT, 3, 3), roughness: 1,
        bumpMap: repT(fabWhiteT, 4, 4), bumpScale: 0.015
      }), 40);
      rug.position.set(0, 0.157, 0.1); g.add(rug);

      // mesa de centro (vidro + madeira + estrutura dourada)
      var gTop = box(0.72, 0.02, 0.42, glassMat());
      gTop.position.set(0, 0.36, -0.05); g.add(gTop);
      var shelfT = box(0.6, 0.02, 0.34, darkWoodM);
      shelfT.position.set(0, 0.21, -0.05); g.add(shelfT);
      [-0.3, 0.3].forEach(function (x) {
        [-0.16, 0.16].forEach(function (z3) {
          var tl = cyl(0.012, 0.012, 0.21, goldM, 8);
          tl.position.set(x, 0.255, -0.05 + z3); g.add(tl);
        });
      });

      // estante com livros
      var shelfM = std({ color: 0x2b2823, roughness: 0.55, metalness: 0.2 });
      var backP = box(0.72, 0.88, 0.03, shelfM); backP.position.set(-0.95, 0.6, -0.97); g.add(backP);
      [-1.31, -0.59].forEach(function (x2) {
        var sp2 = box(0.03, 0.88, 0.2, shelfM); sp2.position.set(x2, 0.6, -0.88); g.add(sp2);
      });
      [0.32, 0.62, 0.92].forEach(function (y2) {
        var bd = box(0.72, 0.03, 0.2, shelfM); bd.position.set(-0.95, y2, -0.88); g.add(bd);
      });
      var bookCols = [0x8a5a3c, 0x44604a, 0xcbb694, 0x3b4a63, 0x9c8a6a, 0x6b4a4a, 0xd8c3a5];
      for (var bk = 0; bk < 7; bk++) {
        var book = box(0.055, 0.15 + (bk % 3) * 0.02, 0.13, std({ color: bookCols[bk], roughness: 0.8 }));
        book.position.set(-1.19 + bk * 0.075, 0.72, -0.87);
        book.rotation.z = bk === 5 ? -0.12 : 0;
        g.add(book);
      }
      var vase = cyl(0.05, 0.035, 0.16, std({ color: 0xd8c3a5, roughness: 0.3, metalness: 0.35 }), 14);
      vase.position.set(-0.75, 1.015, -0.88); g.add(vase);
      var book2 = box(0.2, 0.035, 0.14, std({ color: 0x3b4a63, roughness: 0.8 }));
      book2.position.set(-1.08, 0.955, -0.88); g.add(book2);

      // planta
      var potM = std({ color: 0x2e2c28, roughness: 0.4, metalness: 0.35 });
      var pot = cyl(0.11, 0.085, 0.16, potM, 16); pot.position.set(1.15, 0.23, 0.55); g.add(pot);
      var soil = cyl(0.1, 0.1, 0.02, std({ color: 0x241d16, roughness: 1 }), 16);
      soil.position.set(1.15, 0.31, 0.55); g.add(soil);
      var trunk = cyl(0.02, 0.03, 0.3, std({ color: 0x4a3b2c, roughness: 0.9 }), 8);
      trunk.position.set(1.15, 0.46, 0.55); g.add(trunk);
      var leafM2 = std({ color: 0x4a6b4c, roughness: 0.8 });
      var leafPos = [[0, 0.72, 0, 0.16], [0.12, 0.62, 0.05, 0.13], [-0.13, 0.64, -0.04, 0.12],
                     [0.05, 0.55, -0.12, 0.11], [-0.08, 0.56, 0.11, 0.11], [0, 0.84, 0.02, 0.1]];
      leafPos.forEach(function (L) {
        var lf = sph(L[3], leafM2);
        lf.position.set(1.15 + L[0], L[1], 0.55 + L[2]);
        lf.scale.y = 0.62;
        g.add(lf);
      });

      // bancada integrada + banquinhos
      var counter = box(0.5, 0.74, 1.1, std({ color: 0xf2eee6, roughness: 0.55, metalness: 0.05 }));
      counter.position.set(-1.15, 0.52, 0.3); g.add(counter);
      var cTop = box(0.54, 0.04, 1.14, std({ map: repT(marble, 1, 1.6), roughness: 0.3, metalness: 0.05, envMapIntensity: 0.8 }));
      cTop.position.set(-1.15, 0.91, 0.3); g.add(cTop);
      var bowl = sph(0.07, goldM);
      bowl.position.set(-1.15, 0.965, 0.6); bowl.scale.y = 0.55; g.add(bowl);
      [-0.05, 0.55].forEach(function (z4) {
        var seat = cyl(0.13, 0.13, 0.05, std({ map: repT(fabChampT, 2, 2), roughness: 0.9 }), 16);
        seat.position.set(-0.72, 0.625, z4); g.add(seat);
        var poleS = cyl(0.02, 0.02, 0.45, goldM, 8);
        poleS.position.set(-0.72, 0.375, z4); g.add(poleS);
        var bs = cyl(0.1, 0.1, 0.02, goldM, 14);
        bs.position.set(-0.72, 0.16, z4); g.add(bs);
      });

      // luminária de canto
      var flBase = cyl(0.1, 0.1, 0.02, darkWoodM, 16);
      flBase.position.set(1.05, 0.16, -0.35); g.add(flBase);
      var flPole = cyl(0.014, 0.014, 0.78, goldM, 8);
      flPole.position.set(1.05, 0.56, -0.35); g.add(flPole);
      var shade = cone(0.14, 0.18, std({
        color: 0xf4ead6, roughness: 0.9, emissive: 0xffe0b0,
        emissiveIntensity: 0.45, side: THREE.DoubleSide
      }), 20);
      shade.position.set(1.05, 1.0, -0.35); g.add(shade);
      var bulbM = std({ color: 0xfff6e6, emissive: 0xffd9a0, emissiveIntensity: 2.4 });
      var bulb = sph(0.045, bulbM);
      bulb.position.set(1.05, 0.97, -0.35); g.add(bulb);
      var flGlow = glow(0xffd9a0, 0.5, 0.7);
      flGlow.position.set(1.05, 0.98, -0.35); g.add(flGlow);
      var flLight = new THREE.PointLight(0xffd9a0, 1.6, 3, 2);
      flLight.position.set(1.05, 0.97, -0.35); g.add(flLight);

      return {
        group: g,
        tick: function (t) {
          screenM.emissiveIntensity = 0.72 + Math.sin(t * 9) * 0.04 + Math.sin(t * 3.3) * 0.05;
          bulbM.emissiveIntensity = 2.2 + Math.sin(t * 1.6) * 0.3;
          flGlow.material.opacity = 0.6 + Math.sin(t * 1.6) * 0.15;
        }
      };
    }

    /* ============================================================
       MODELOS — PISCINA & DECK (noite)
       ============================================================ */
    function buildPiscina() {
      var g = new THREE.Group();
      var noise = repT(tx('noise', texNoise), 3, 3);
      var wood = tx('wood', texWood);
      var fabWhiteT = tx('fabWhite', function () { return texFabric('#e9e2d2'); });
      var goldM = std({ color: 0xd8c3a5, metalness: 1, roughness: 0.26, envMapIntensity: 1.2 });
      var darkM = std({ color: 0x2a2825, roughness: 0.5, metalness: 0.5 });

      // água (física, normal animada)
      var waterN = tx('waterN', texWaterNormal);
      var waterM = phy({
        color: 0x1c6f80, roughness: 0.06, metalness: 0,
        transmission: LOW ? 0 : 0.7, thickness: 0.5, ior: 1.33,
        transparent: true, opacity: LOW ? 0.88 : 1,
        normalMap: waterN, normalScale: new THREE.Vector2(0.4, 0.4),
        clearcoat: 1, clearcoatRoughness: 0.08,
        envMapIntensity: 1.4, emissive: 0x0a3d4d, emissiveIntensity: 0.3
      });

      // deck de madeira
      var deckM = std({
        map: repT(wood, 5, 2), roughness: 0.6, metalness: 0.03,
        bumpMap: repT(wood, 5, 2), bumpScale: 0.012, color: 0xd9b98c
      });
      var dF = box(2.9, 0.12, 0.5, deckM); dF.position.set(0, 0.14, 0.75); g.add(dF);
      var dB = box(2.9, 0.12, 0.5, deckM); dB.position.set(0, 0.14, -0.75); g.add(dB);
      var dL = box(0.5, 0.12, 1.0, deckM); dL.position.set(-1.15, 0.14, 0); g.add(dL);
      var dR = box(0.5, 0.12, 1.0, deckM); dR.position.set(1.15, 0.14, 0); g.add(dR);

      // piscina: revestimento interno + piso + água
      var tileM = std({ color: 0xdff1f4, roughness: 0.25, metalness: 0.05, emissive: 0x9fd8e8, emissiveIntensity: 0.14 });
      var wF = box(1.8, 0.12, 0.04, tileM); wF.position.set(0, 0.14, 0.48); g.add(wF);
      var wB = box(1.8, 0.12, 0.04, tileM); wB.position.set(0, 0.14, -0.48); g.add(wB);
      var wL = box(0.04, 0.12, 0.92, tileM); wL.position.set(-0.88, 0.14, 0); g.add(wL);
      var wR2 = box(0.04, 0.12, 0.92, tileM); wR2.position.set(0.88, 0.14, 0); g.add(wR2);
      var pFloor = box(1.74, 0.02, 0.9, std({
        color: 0xbfe6ee, roughness: 0.3, metalness: 0.05,
        emissive: 0x6fc2d8, emissiveIntensity: 0.35
      }));
      pFloor.position.set(0, 0.088, 0); g.add(pFloor);
      var water = box(1.74, 0.02, 0.88, waterM);
      water.position.set(0, 0.165, 0); g.add(water);

      // luzes submersas
      [-0.4, 0.4].forEach(function (x) {
        var sub = box(0.16, 0.04, 0.012, std({ color: 0xd8f6ff, emissive: 0x7fd8ea, emissiveIntensity: 2.4 }));
        sub.position.set(x, 0.11, -0.455); g.add(sub);
      });
      var poolLight = new THREE.PointLight(0x6fd0e8, 1.8, 2.6, 2);
      poolLight.position.set(0, 0.2, 0); g.add(poolLight);

      // escada de inox
      [-0.62, -0.44].forEach(function (x) {
        var rail = cyl(0.014, 0.014, 0.22, std({ color: 0xd8dde0, roughness: 0.15, metalness: 1, envMapIntensity: 1.4 }), 8);
        rail.position.set(x, 0.24, 0.42); g.add(rail);
      });
      var rung = cyl(0.012, 0.012, 0.2, std({ color: 0xd8dde0, roughness: 0.15, metalness: 1 }), 8);
      rung.rotation.z = Math.PI / 2; rung.position.set(-0.53, 0.3, 0.42); g.add(rung);

      // espreguiçadeiras (comprimento no eixo x)
      [-0.6, 0.6].forEach(function (x0) {
        var frame = box(0.86, 0.04, 0.4, std({ color: 0xe8e4da, roughness: 0.4, metalness: 0.3 }));
        frame.position.set(x0, 0.22, 0.75); g.add(frame);
        var cushion = box(0.84, 0.07, 0.38, std({
          map: repT(fabWhiteT, 3, 2), roughness: 0.95,
          bumpMap: repT(fabWhiteT, 4, 3), bumpScale: 0.012
        }));
        cushion.position.set(x0, 0.275, 0.75); g.add(cushion);
        var backr = box(0.3, 0.06, 0.38, std({ map: repT(fabWhiteT, 2, 2), roughness: 0.95 }));
        backr.position.set(x0 - 0.3, 0.38, 0.75);
        backr.rotation.z = 0.55; g.add(backr);
      });
      var sTable = cyl(0.12, 0.1, 0.03, std({ color: 0xd8c3a5, metalness: 0.6, roughness: 0.3 }), 16);
      sTable.position.set(0, 0.3, 0.75); g.add(sTable);
      var sLeg = cyl(0.02, 0.03, 0.1, darkM, 8);
      sLeg.position.set(0, 0.25, 0.75); g.add(sLeg);

      // guarda-sol
      var uPole = cyl(0.025, 0.03, 1.05, std({ color: 0x8a8578, roughness: 0.4, metalness: 0.6 }), 10);
      uPole.position.set(-1.3, 0.66, 0.9); g.add(uPole);
      var uCanopy = cone(0.62, 0.26, std({
        color: 0xd8c3a5, roughness: 0.9,
        map: repT(tx('fabChamp', function () { return texFabric('#c9b491'); }), 4, 2),
        side: THREE.DoubleSide
      }), 20);
      uCanopy.position.set(-1.3, 1.28, 0.9); g.add(uCanopy);
      var uTip = sph(0.03, goldM); uTip.position.set(-1.3, 1.43, 0.9); g.add(uTip);

      // palmeiras
      var leafM = std({ color: 0x47664a, roughness: 0.8, side: THREE.DoubleSide });
      var trunkM = std({ color: 0x6b5138, roughness: 0.9 });
      [-1.4, 1.4].forEach(function (x, pi) {
        var trunkG = new THREE.Group();
        for (var seg = 0; seg < 4; seg++) {
          var ts = cyl(0.032 - seg * 0.004, 0.038 - seg * 0.004, 0.3, trunkM, 8);
          ts.position.y = 0.15 + seg * 0.28;
          ts.position.x = Math.sin(seg * 0.7 + pi) * 0.04;
          ts.rotation.z = Math.sin(seg * 0.9 + pi) * 0.07;
          trunkG.add(ts);
        }
        for (var lf = 0; lf < 6; lf++) {
          var lg = new THREE.BoxGeometry(0.5, 0.012, 0.09);
          lg.translate(0.25, 0, 0);
          var leaf = new THREE.Mesh(lg, leafM);
          var ang = (lf / 6) * Math.PI * 2 + pi;
          leaf.position.set(Math.sin(seg * 0) * 0, 1.2, 0); // topo do tronco
          leaf.rotation.y = ang;
          leaf.rotation.z = -0.5 - (lf % 2) * 0.2;
          leaf.position.x = Math.sin(3 * 0.7 + pi) * 0.04;
          trunkG.add(leaf);
        }
        trunkG.position.set(x, 0.082, -1.15);
        g.add(trunkG);
      });

      // luzes penduradas (guirlanda)
      var poleL = cyl(0.02, 0.026, 1.15, darkM, 8); poleL.position.set(-1.5, 0.66, -1.05); g.add(poleL);
      var poleR = cyl(0.02, 0.026, 1.15, darkM, 8); poleR.position.set(1.5, 0.66, -1.05); g.add(poleR);
      var wirePts = [];
      for (var wi = 0; wi <= 24; wi++) {
        var tt = wi / 24;
        wirePts.push(new THREE.Vector3(-1.5 + 3 * tt, 1.23 - 0.45 * (4 * tt * (1 - tt)), -1.05));
      }
      var wire = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(wirePts),
        new THREE.LineBasicMaterial({ color: 0x2a2620 })
      );
      g.add(wire);
      var bulbMats = [
        std({ color: 0xfff4de, emissive: 0xffd9a0, emissiveIntensity: 2.2, roughness: 0.5 }),
        std({ color: 0xfff4de, emissive: 0xffcf8a, emissiveIntensity: 2.0, roughness: 0.5 }),
        std({ color: 0xfff4de, emissive: 0xffe2b2, emissiveIntensity: 2.4, roughness: 0.5 })
      ];
      var bulbs = [];
      for (var bi = 0; bi < 9; bi++) {
        var tb = (bi + 0.5) / 9;
        var bm = bulbMats[bi % 3];
        var bulb = sph(0.035, bm);
        bulb.position.set(-1.5 + 3 * tb, 1.23 - 0.45 * (4 * tb * (1 - tb)), -1.05);
        g.add(bulb);
        bulbs.push(bulb);
        if (bi % 2 === 0) {
          var bs2 = glow(0xffd9a0, 0.3, 0.6);
          bs2.position.copy(bulb.position);
          g.add(bs2);
        }
      }
      var strLight = new THREE.PointLight(0xffcf9a, 2.4, 4.5, 2);
      strLight.position.set(0, 1.0, -1.0); g.add(strLight);

      // sebes
      [-0.7, 0.7].forEach(function (x) {
        var hedge = box(0.8, 0.26, 0.2, std({ color: 0x46604a, roughness: 0.9, bumpMap: noise, bumpScale: 0.014 }));
        hedge.position.set(x, 0.21, -1.55); g.add(hedge);
      });

      // boia + bola na água
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 10, 28),
        std({ color: 0xf2ede2, roughness: 0.5 }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(0.35, 0.185, 0.12); g.add(ring);
      var ball = sph(0.09, std({ color: 0xe8e2d4, roughness: 0.45 }));
      ball.position.set(-0.4, 0.19, -0.18); g.add(ball);

      return {
        group: g,
        tick: function (t) {
          waterN.offset.x = t * 0.03;
          waterN.offset.y = Math.sin(t * 0.5) * 0.04;
          waterM.emissiveIntensity = 0.26 + Math.sin(t * 1.5) * 0.08;
          for (var k = 0; k < bulbs.length; k++) {
            bulbs[k].material.emissiveIntensity = 1.9 + Math.sin(t * 1.4 + k * 1.3) * 0.55;
          }
        }
      };
    }

    /* ============================================================
       MODELOS — SUÍTE MASTER (dia)
       ============================================================ */
    function buildSuite() {
      var g = new THREE.Group();
      var noise = repT(tx('noise', texNoise), 3, 3);
      var wood = tx('wood', texWood);
      var plaster = tx('plaster', texPlaster);
      var fabChampT = tx('fabChamp', function () { return texFabric('#c9b491'); });
      var fabWhiteT = tx('fabWhite', function () { return texFabric('#e9e2d2'); });
      var goldM = std({ color: 0xd8c3a5, metalness: 1, roughness: 0.26, envMapIntensity: 1.2 });
      var darkWoodM = std({ map: repT(wood, 2, 1), color: 0x6b5138, roughness: 0.5, metalness: 0.1 });

      // piso + paredes
      var floorM = std({
        map: repT(wood, 4, 3), roughness: 0.5,
        bumpMap: repT(wood, 4, 3), bumpScale: 0.012, envMapIntensity: 0.5
      });
      var floor = box(2.7, 0.07, 2.0, floorM);
      floor.position.y = 0.115; g.add(floor);
      var wallM = std({ map: repT(plaster, 3, 1.4), roughness: 0.86, bumpMap: noise, bumpScale: 0.004 });
      var backW = box(2.7, 1.2, 0.06, wallM); backW.position.set(0, 0.74, -0.97); g.add(backW);
      var rightW = box(0.06, 1.2, 2.0, wallM); rightW.position.set(1.32, 0.74, 0); g.add(rightW);
      var baseboard = box(2.7, 0.05, 0.02, std({ color: 0xf6f2e9, roughness: 0.6 }));
      baseboard.position.set(0, 0.14, -0.935); g.add(baseboard);
      var frieze = box(2.7, 0.03, 0.02, std({ color: 0xf6f2e9, roughness: 0.6 }));
      frieze.position.set(0, 1.31, -0.935); g.add(frieze);

      // painel de ripas atrás da cama
      var slatM = std({ map: repT(wood, 1, 4), color: 0xb99a74, roughness: 0.5, metalness: 0.1 });
      for (var si = 0; si < 9; si++) {
        var slat = box(0.08, 1.05, 0.03, slatM);
        slat.position.set(-0.72 + si * 0.18, 0.7, -0.925);
        g.add(slat);
      }

      // cabeceira capitonê
      var fabCh = std({
        map: repT(fabChampT, 3, 3), roughness: 0.95,
        bumpMap: repT(fabChampT, 4, 4), bumpScale: 0.012
      });
      var headboard = box(1.5, 0.66, 0.09, fabCh);
      headboard.position.set(0, 0.62, -0.86); g.add(headboard);
      var btnM = std({ color: 0xa8906c, roughness: 0.7 });
      [-0.5, -0.17, 0.17, 0.5].forEach(function (x2) {
        [0.46, 0.72].forEach(function (y2) {
          var btn = sph(0.028, btnM);
          btn.position.set(x2, y2, -0.812); btn.scale.z = 0.5;
          g.add(btn);
        });
      });

      // cama
      var bedBase = box(1.1, 0.18, 1.4, darkWoodM);
      bedBase.position.set(0, 0.24, 0.1); g.add(bedBase);
      var mattress = box(1.05, 0.2, 1.35, std({
        map: repT(fabWhiteT, 3, 3), roughness: 0.9,
        bumpMap: repT(fabWhiteT, 4, 4), bumpScale: 0.01
      }));
      mattress.position.set(0, 0.43, 0.1); g.add(mattress);
      var duvet = box(1.08, 0.12, 0.82, std({
        map: repT(fabChampT, 3, 3), roughness: 0.95,
        bumpMap: repT(fabChampT, 4, 4), bumpScale: 0.012
      }));
      duvet.position.set(0, 0.57, 0.33); g.add(duvet);
      var fold = box(1.08, 0.05, 0.14, std({ color: 0xe8e0cf, roughness: 0.95 }));
      fold.position.set(0, 0.62, -0.06); g.add(fold);
      [-0.26, 0.26].forEach(function (x3) {
        var pil = box(0.42, 0.12, 0.24, std({
          map: repT(fabWhiteT, 2, 2), roughness: 0.92,
          bumpMap: repT(fabWhiteT, 3, 3), bumpScale: 0.01
        }));
        pil.position.set(x3, 0.57, -0.44); pil.rotation.x = -0.18; g.add(pil);
        var sham = box(0.3, 0.14, 0.08, fabCh);
        sham.position.set(x3, 0.61, -0.3); g.add(sham);
      });
      var lumbar = box(0.28, 0.11, 0.07, std({ color: 0x44604a, roughness: 0.9, bumpMap: noise, bumpScale: 0.01 }));
      lumbar.position.set(0, 0.61, -0.28); g.add(lumbar);

      // tapete + banqueta
      var rug = box(1.15, 0.016, 1.15, std({
        map: repT(fabWhiteT, 3, 3), roughness: 1,
        bumpMap: repT(fabWhiteT, 4, 4), bumpScale: 0.015
      }));
      rug.position.set(0, 0.158, 0.42); g.add(rug);
      var bench = box(0.7, 0.08, 0.2, fabCh);
      bench.position.set(0, 0.32, 0.88); g.add(bench);
      [-0.3, 0.3].forEach(function (x4) {
        [-0.07, 0.07].forEach(function (z2) {
          var bl = cyl(0.015, 0.013, 0.13, darkWoodM, 8);
          bl.position.set(x4, 0.215, 0.88 + z2); g.add(bl);
        });
      });

      // criados-mesa + luminárias
      var lampShadeM = std({
        color: 0xf4ead6, roughness: 0.9, emissive: 0xffe0b0,
        emissiveIntensity: 0.4, side: THREE.DoubleSide
      });
      var nightLamps = [];
      [-0.92, 0.92].forEach(function (x5) {
        var ns = box(0.3, 0.24, 0.26, darkWoodM);
        ns.position.set(x5, 0.27, -0.62); g.add(ns);
        var drawer = box(0.26, 0.06, 0.01, std({ color: 0x84674a, roughness: 0.5 }));
        drawer.position.set(x5, 0.3, -0.485); g.add(drawer);
        var knob = sph(0.018, goldM);
        knob.position.set(x5, 0.3, -0.475); g.add(knob);
        var lBase = cyl(0.06, 0.07, 0.03, goldM, 14);
        lBase.position.set(x5, 0.405, -0.62); g.add(lBase);
        var lStem = cyl(0.012, 0.012, 0.16, goldM, 8);
        lStem.position.set(x5, 0.5, -0.62); g.add(lStem);
        var shade2 = cone(0.09, 0.13, lampShadeM, 16);
        shade2.position.set(x5, 0.63, -0.62); g.add(shade2);
        var bulbM2 = std({ color: 0xfff6e6, emissive: 0xffd9a0, emissiveIntensity: 2 });
        var bulb = sph(0.035, bulbM2);
        bulb.position.set(x5, 0.6, -0.62); g.add(bulb);
        var gl = glow(0xffd9a0, 0.4, 0.7);
        gl.position.set(x5, 0.62, -0.62); g.add(gl);
        var pl = new THREE.PointLight(0xffcf9a, 1.1, 2.2, 2);
        pl.position.set(x5, 0.62, -0.6); g.add(pl);
        nightLamps.push({ bulb: bulb, glow: gl });
      });

      // guarda-roupa com porta-espelho
      var wCarc = box(0.36, 1.05, 0.8, std({ color: 0xf2eee6, roughness: 0.55, metalness: 0.05 }));
      wCarc.position.set(1.11, 0.675, 0.1); g.add(wCarc);
      var wDoor = box(0.02, 0.98, 0.74, phy({
        color: 0xffffff, metalness: 1, roughness: 0.04, envMapIntensity: 1.5
      }));
      wDoor.position.set(0.92, 0.67, 0.1); g.add(wDoor);

      // janela com vista + cortinas
      var viewTex2 = tx('view', texView);
      var viewM = std({
        map: viewTex2, emissive: 0xffffff, emissiveMap: viewTex2,
        emissiveIntensity: 0.55, roughness: 0.4
      });
      var view = box(0.015, 0.66, 0.94, viewM);
      view.position.set(1.285, 0.76, 0.55); g.add(view);
      var wGlass = box(0.012, 0.66, 0.94, glassMat());
      wGlass.position.set(1.27, 0.76, 0.55); g.add(wGlass);
      var frameM = std({ color: 0xf6f3ec, roughness: 0.5 });
      var fTop = box(0.04, 0.05, 1.02, frameM); fTop.position.set(1.275, 1.11, 0.55); g.add(fTop);
      var fBot = box(0.04, 0.05, 1.02, frameM); fBot.position.set(1.275, 0.41, 0.55); g.add(fBot);
      [-0.47, 0.47].forEach(function (dz) {
        var f = box(0.04, 0.75, 0.05, frameM);
        f.position.set(1.275, 0.76, 0.55 + dz); g.add(f);
      });
      var mullion = box(0.03, 0.7, 0.03, frameM);
      mullion.position.set(1.268, 0.76, 0.55); g.add(mullion);
      var sill = box(0.1, 0.03, 1.06, std({ color: 0xf6f3ec, roughness: 0.6 }));
      sill.position.set(1.235, 0.38, 0.55); g.add(sill);

      var rod = cyl(0.014, 0.014, 1.2, goldM, 8);
      rod.rotation.x = Math.PI / 2; rod.position.set(1.18, 1.18, 0.55); g.add(rod);
      function curtain(zc) {
        var geo = new THREE.PlaneGeometry(0.5, 1.0, 18, 1);
        var pos = geo.attributes.position;
        for (var i2 = 0; i2 < pos.count; i2++) {
          pos.setZ(i2, Math.sin((pos.getX(i2) / 0.5) * Math.PI * 4) * 0.035);
        }
        geo.computeVertexNormals();
        geo.rotateY(-Math.PI / 2);
        return new THREE.Mesh(geo, std({
          color: 0xf3ecdd, roughness: 0.95, side: THREE.DoubleSide,
          transparent: true, opacity: 0.96
        }));
      }
      var c1 = curtain(0.2); c1.position.set(1.16, 0.68, 0.2); g.add(c1);
      var c2 = curtain(0.9); c2.position.set(1.16, 0.68, 0.9); g.add(c2);

      // planta no canto
      var potM = std({ color: 0x2e2c28, roughness: 0.4, metalness: 0.35 });
      var pot = cyl(0.1, 0.08, 0.14, potM, 16); pot.position.set(-1.1, 0.22, 0.75); g.add(pot);
      var trunk = cyl(0.018, 0.026, 0.26, std({ color: 0x4a3b2c, roughness: 0.9 }), 8);
      trunk.position.set(-1.1, 0.42, 0.75); g.add(trunk);
      var leafM2 = std({ color: 0x4a6b4c, roughness: 0.8 });
      [[0, 0.66, 0, 0.14], [0.1, 0.58, 0.04, 0.11], [-0.11, 0.6, -0.03, 0.1], [0, 0.76, 0.02, 0.09]]
        .forEach(function (L) {
          var lf = sph(L[3], leafM2);
          lf.position.set(-1.1 + L[0], L[1], 0.75 + L[2]);
          lf.scale.y = 0.62;
          g.add(lf);
        });

      return {
        group: g,
        tick: function (t) {
          nightLamps.forEach(function (L, k) {
            L.bulb.material.emissiveIntensity = 1.8 + Math.sin(t * 1.3 + k * 2) * 0.35;
            L.glow.material.opacity = 0.55 + Math.sin(t * 1.3 + k * 2) * 0.18;
          });
        }
      };
    }

    /* ============================================================
       MONTAGEM DAS 4 CENAS + INTERAÇÃO + LOOP
       ============================================================ */
    var ENV = texEquirect();
    var builders = {
      fachada: { fn: buildCasaMaquette, mode: 'dusk', cam: { p: [0, 2.4, 9.5], l: [0, 1.05, 0] } },
      living: { fn: buildLiving, mode: 'day' },
      piscina: { fn: buildPiscina, mode: 'night' },
      suite: { fn: buildSuite, mode: 'day' }
    };
    var items = [];

    cards.forEach(function (card) {
      var canvas = card.querySelector('.proj-maq');
      var kind = card.getAttribute('data-maq');
      var conf = builders[kind];
      if (!canvas || !conf) return;

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      } catch (err) { card.classList.add('show-photo'); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1.5 : 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.02;
      renderer.shadowMap.enabled = !LOW;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      var scene = new THREE.Scene();
      scene.environment = ENV;

      var camP = conf.cam ? conf.cam.p : [0, 2.5, 5.6];
      var camL = conf.cam ? conf.cam.l : [0, 0.6, 0];
      var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(camP[0], camP[1], camP[2]);
      camera.lookAt(camL[0], camL[1], camL[2]);

      lightRig(scene, conf.mode);

      var model = conf.fn();
      model.group.add(basePlate());
      shadowAll(model.group);
      scene.add(model.group);

      var it = {
        card: card, canvas: canvas, renderer: renderer, scene: scene, camera: camera, model: model,
        rotY: -0.55, rotX: 0.06, velY: 0.003, drag: false, px: 0, py: 0, visible: false, moved: false
      };

      canvas.addEventListener('pointerdown', function (e) {
        it.drag = true; it.px = e.clientX; it.py = e.clientY; it.moved = false;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!it.drag) return;
        var dx = e.clientX - it.px, dy = e.clientY - it.py;
        it.px = e.clientX; it.py = e.clientY;
        it.rotY += dx * 0.009;
        it.rotX = Math.max(-0.32, Math.min(0.2, it.rotX + dy * 0.004));
        it.velY = dx * 0.0018;
        if (!it.moved && Math.abs(dx) + Math.abs(dy) > 4) {
          it.moved = true;
          card.classList.add('dragged');
        }
        e.preventDefault();
      });
      var endDrag = function () { it.drag = false; };
      canvas.addEventListener('pointerup', endDrag);
      canvas.addEventListener('pointercancel', endDrag);

      var toggle = card.querySelector('.maq-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          var photo = card.classList.toggle('show-photo');
          toggle.textContent = photo ? '3D' : 'foto';
          toggle.setAttribute('aria-label', photo ? 'Ver maquete 3D' : 'Ver foto do projeto');
        });
      }

      items.push(it);
    });

    /* ============================================================
       HERO — GIRO 360° DA CASA (cena própria + autorrotação)
       ============================================================ */
    (function hero360() {
      var sec = document.querySelector('.hero');
      var canvas = document.querySelector('.hero360');
      var chip = document.querySelector('.hero360-chip');
      if (!sec || !canvas) return;

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !LOW, alpha: true, powerPreference: 'high-performance' });
      } catch (err) { return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1.3 : 1.75));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.14;
      renderer.shadowMap.enabled = !LOW;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      var scene = new THREE.Scene();
      scene.environment = ENV;
      scene.background = tx('duskSky', texDuskSky);
      scene.fog = new THREE.Fog(0x626878, 20, 55);

      var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 140);

      lightRig(scene, 'dusk', 7);

      // gramado
      var lawn = new THREE.Mesh(new THREE.CircleGeometry(20, 64), std({
        map: repT(tx('grass', texGrass), 16, 16), roughness: 0.96, metalness: 0
      }));
      lawn.rotation.x = -Math.PI / 2; lawn.receiveShadow = true; scene.add(lawn);

      // árvores de fundo (silhuetas na neblina)
      var folH = std({ color: 0x2e3b2d, roughness: 0.96 });
      var barkH = std({ color: 0x4a4238, roughness: 0.9 });
      [[-8.5, -7.5, 0.85], [7.5, -9, 1.0], [-4.5, -12, 1.1], [10, -4.5, 0.75]].forEach(function (p) {
        var tg = new THREE.Group();
        var tr = cyl(0.12, 0.2, 2.6 * p[2], barkH, 8); tr.position.y = 1.3 * p[2]; tg.add(tr);
        [[0, 3.4, 1.5], [0.9, 3.0, 1.15], [-0.85, 3.1, 1.05]].forEach(function (c, ci) {
          var b = sph(c[2] * p[2], folH);
          b.scale.set(1.3, 0.7, 1.2);
          b.position.set(c[0] * p[2], c[1] * p[2], (ci - 1) * 0.6);
          tg.add(b);
        });
        tg.position.set(p[0], 0, p[1]);
        scene.add(tg);
      });

      var spin = new THREE.Group();
      var casa = buildCasa();
      spin.add(casa.group);
      shadowAll(spin);
      scene.add(spin);

      var rot = -0.5, vel = 0.0016, drag = false, px = 0, visible = false, hint = false;

      function fit() {
        var w = sec.clientWidth || window.innerWidth;
        var h = sec.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        var aspect = w / Math.max(h, 1);
        camera.aspect = aspect;
        if (aspect < 1) { camera.position.set(0, 3.3, 14.5); camera.lookAt(0, 2.5, 0); }
        else { camera.position.set(0, 3.1, 12.5); camera.lookAt(0, 2.4, 0); }
        camera.updateProjectionMatrix();
      }
      fit();
      window.addEventListener('resize', fit);

      canvas.addEventListener('pointerdown', function (e) {
        drag = true; px = e.clientX;
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        if (!hint && chip) { hint = true; chip.classList.add('hide'); }
      });
      canvas.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dx = e.clientX - px; px = e.clientX;
        rot += dx * 0.008;
        vel = dx * 0.0022;
        e.preventDefault();
      });
      var endDrag = function () { drag = false; };
      canvas.addEventListener('pointerup', endDrag);
      canvas.addEventListener('pointercancel', endDrag);

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '80px' }).observe(sec);
      } else { visible = true; }

      if (chip) setTimeout(function () { if (!hint) chip.classList.add('on'); }, 1500);

      (function hloop() {
        requestAnimationFrame(hloop);
        if (document.hidden || !visible) return;
        if (!drag) {
          rot += vel;
          vel += (0.0016 - vel) * 0.02;
        }
        spin.rotation.y = rot;
        casa.tick(performance.now() * 0.001);
        renderer.render(scene, camera);
      })();
    })();

    if (!items.length) return;

    function resize() {
      items.forEach(function (it) {
        var w = it.card.clientWidth || 280;
        var h = it.card.clientHeight || 300;
        it.renderer.setSize(w, h, false);
        it.camera.aspect = w / h;
        it.camera.updateProjectionMatrix();
      });
    }
    resize();
    window.addEventListener('resize', resize);

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var it = items.find(function (x) { return x.card === en.target; });
          if (it) it.visible = en.isIntersecting;
        });
      }, { rootMargin: '100px' });
      items.forEach(function (it) { io.observe(it.card); });
    } else {
      items.forEach(function (it) { it.visible = true; });
    }

    (function loop() {
      requestAnimationFrame(loop);
      if (document.hidden) return;
      var t = performance.now() * 0.001;
      items.forEach(function (it) {
        if (!it.visible || it.card.classList.contains('show-photo')) return;
        if (!it.drag) {
          it.rotY += it.velY;
          it.velY += (0.003 - it.velY) * 0.02;
        }
        it.model.group.rotation.y = it.rotY;
        it.model.group.rotation.x = it.rotX;
        if (it.model.tick) it.model.tick(t);
        it.renderer.render(it.scene, it.camera);
      });
    })();
  })();

})();
