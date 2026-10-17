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
     MAQUETES 3D DOS PROJETOS — 4 mini-cenas interativas
     arraste para girar · inércia · giro lento ocioso
     ============================================================ */
  (function () {
    if (!window.THREE) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.proj-card'));
    if (!cards.length) return;

    if (reduceMotion) {
      cards.forEach(function (c) { c.classList.add('show-photo'); });
      var tgls = document.querySelectorAll('.maq-toggle');
      tgls.forEach(function (b) { b.style.display = 'none'; });
      return;
    }

    var CREAM = 0xece5da, WHITE = 0xf6f2ec, CHAMP = 0xd8c3a5, DARK = 0x20201e,
        WATER = 0x16414d, SAGE = 0x5f6b59, GLOW = 0xffe9c4;

    function box(w, h, d, color, opts) {
      var m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.6, metalness: 0.12 }, opts || {}))
      );
      return m;
    }
    function cyl(rt, rb, h, color, opts) {
      return new THREE.Mesh(
        new THREE.CylinderGeometry(rt, rb, h, 24),
        new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.6, metalness: 0.12 }, opts || {}))
      );
    }
    function glowSphere(r, intensity) {
      return new THREE.Mesh(
        new THREE.SphereGeometry(r, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xfff6e6, emissive: GLOW, emissiveIntensity: intensity || 1.4 })
      );
    }
    function basePlate() {
      var g = new THREE.Group();
      var plate = cyl(2.6, 2.7, 0.16, 0x181816, { roughness: 0.7 });
      g.add(plate);
      var rim = new THREE.Mesh(
        new THREE.TorusGeometry(2.62, 0.014, 8, 64),
        new THREE.MeshStandardMaterial({ color: CHAMP, emissive: CHAMP, emissiveIntensity: 0.35, roughness: 0.4 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.08;
      g.add(rim);
      return g;
    }

    function buildFachada() {
      var g = new THREE.Group();
      var t = new THREE.Group();
      t.scale.setScalar(0.75); // torre mais baixa cabe no card
      g.add(t);
      var windows = [];
      for (var i = 0; i < 6; i++) {
        var y = 0.12 + i * 0.62;
        var slab = box(2.05, 0.5, 1.25, CREAM);
        slab.position.y = y + 0.25;
        t.add(slab);
        var balcony = box(2.28, 0.05, 0.36, CHAMP);
        balcony.position.set(0, y + 0.5, 0.76);
        t.add(balcony);
        var win = box(1.72, 0.3, 0.05, 0x2a2f33, { emissive: 0xffd9a0, emissiveIntensity: 0.28, roughness: 0.25, metalness: 0.6 });
        win.position.set(0, y + 0.28, 0.64);
        t.add(win);
        windows.push(win);
      }
      var roof = box(1.5, 0.16, 1.0, DARK);
      roof.position.y = 3.85;
      t.add(roof);
      var antena = cyl(0.012, 0.012, 0.55, DARK);
      antena.position.y = 4.2;
      t.add(antena);
      var beacon = glowSphere(0.05, 1.6);
      beacon.position.y = 4.5;
      t.add(beacon);
      [-1.55, 1.55].forEach(function (x) {
        var tree = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 10), new THREE.MeshStandardMaterial({ color: SAGE, roughness: 0.8 }));
        tree.position.set(x, 0.34, 1.35);
        t.add(tree);
        var trunk = cyl(0.03, 0.03, 0.16, 0x3a3229);
        trunk.position.set(x, 0.16, 1.35);
        t.add(trunk);
      });
      return { group: g, tick: function (t) {
        var k = 0.22 + Math.sin(t * 0.8) * 0.1;
        windows.forEach(function (w, idx) { w.material.emissiveIntensity = k + Math.sin(t * 0.8 + idx) * 0.06; });
        beacon.material.emissiveIntensity = 1 + Math.sin(t * 2.2) * 0.7;
      } };
    }

    function buildLiving() {
      var g = new THREE.Group();
      var floor = box(2.9, 0.07, 2.1, CREAM);
      floor.position.y = 0.115;
      g.add(floor);
      var backWall = box(2.9, 1.15, 0.06, CREAM);
      backWall.position.set(0, 0.71, -1.02);
      g.add(backWall);
      var sideWall = box(0.06, 1.15, 2.1, CREAM);
      sideWall.position.set(-1.42, 0.71, 0);
      g.add(sideWall);
      var rug = cyl(0.72, 0.72, 0.014, CHAMP, { roughness: 0.9 });
      rug.position.set(0, 0.155, 0.28);
      g.add(rug);
      var sofaBase = box(1.5, 0.18, 0.6, CHAMP);
      sofaBase.position.set(0, 0.25, 0.55);
      g.add(sofaBase);
      var sofaBack = box(1.5, 0.42, 0.14, CHAMP);
      sofaBack.position.set(0, 0.45, 0.83);
      g.add(sofaBack);
      [-0.68, 0.68].forEach(function (x) {
        var arm = box(0.14, 0.3, 0.6, CHAMP);
        arm.position.set(x, 0.3, 0.55);
        g.add(arm);
      });
      var tableTop = cyl(0.3, 0.3, 0.05, DARK);
      tableTop.position.set(0, 0.3, -0.15);
      g.add(tableTop);
      var tableLeg = cyl(0.035, 0.05, 0.14, DARK);
      tableLeg.position.set(0, 0.2, -0.15);
      g.add(tableLeg);
      var tvWall = box(1.25, 0.65, 0.05, DARK);
      tvWall.position.set(0.45, 0.62, -0.97);
      g.add(tvWall);
      var tv = box(1.05, 0.42, 0.02, 0x101418, { emissive: 0x86b8d8, emissiveIntensity: 0.4, roughness: 0.2, metalness: 0.5 });
      tv.position.set(0.45, 0.62, -0.93);
      g.add(tv);
      var lampPole = cyl(0.014, 0.014, 0.72, DARK);
      lampPole.position.set(1.1, 0.52, 0.35);
      g.add(lampPole);
      var lampHead = glowSphere(0.09, 1.5);
      lampHead.position.set(1.1, 0.92, 0.35);
      g.add(lampHead);
      var plantPot = cyl(0.07, 0.055, 0.1, DARK);
      plantPot.position.set(-1.1, 0.2, 0.72);
      g.add(plantPot);
      var plantTop = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 10), new THREE.MeshStandardMaterial({ color: SAGE, roughness: 0.8 }));
      plantTop.position.set(-1.1, 0.4, 0.72);
      g.add(plantTop);
      return { group: g, tick: function (t) {
        lampHead.material.emissiveIntensity = 1.35 + Math.sin(t * 1.4) * 0.15;
        tv.material.emissiveIntensity = 0.32 + Math.sin(t * 3.1) * 0.1;
      } };
    }

    function buildPiscina() {
      var g = new THREE.Group();
      var deckY = 0.115;
      var front = box(2.9, 0.07, 0.55, CREAM); front.position.set(0, deckY, 0.775); g.add(front);
      var back = box(2.9, 0.07, 0.55, CREAM); back.position.set(0, deckY, -0.775); g.add(back);
      var left = box(0.55, 0.07, 1.0, CREAM); left.position.set(-1.175, deckY, 0); g.add(left);
      var right = box(0.55, 0.07, 1.0, CREAM); right.position.set(1.175, deckY, 0); g.add(right);
      var water = box(1.8, 0.02, 1.0, WATER, { emissive: 0x0d3846, emissiveIntensity: 0.4, roughness: 0.15, metalness: 0.4 });
      water.position.set(0, 0.09, 0);
      g.add(water);
      [-0.55, 0.55].forEach(function (x) {
        var seat = box(0.55, 0.05, 0.24, WHITE);
        seat.position.set(x, 0.19, 0.78);
        g.add(seat);
        var backr = box(0.55, 0.05, 0.2, WHITE);
        backr.position.set(x, 0.27, 0.9);
        backr.rotation.x = -0.7;
        g.add(backr);
      });
      [-1.15, 1.15].forEach(function (x) {
        var trunkM = cyl(0.035, 0.045, 0.55, 0x3a3229);
        trunkM.position.set(x, 0.43, -0.62);
        g.add(trunkM);
        var crown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 10), new THREE.MeshStandardMaterial({ color: SAGE, roughness: 0.8 }));
        crown.position.set(x, 0.88, -0.62);
        g.add(crown);
      });
      var lampsGlow = [];
      [-1.0, 1.0].forEach(function (x) {
        var pole = cyl(0.018, 0.018, 0.95, DARK);
        pole.position.set(x, 0.6, 0.95);
        g.add(pole);
        var head = glowSphere(0.07, 1.6);
        head.position.set(x, 1.1, 0.95);
        g.add(head);
        lampsGlow.push(head);
      });
      return { group: g, tick: function (t) {
        water.material.emissiveIntensity = 0.35 + Math.sin(t * 1.7) * 0.14;
        lampsGlow.forEach(function (l, idx) { l.material.emissiveIntensity = 1.4 + Math.sin(t * 1.1 + idx) * 0.25; });
      } };
    }

    function buildSuite() {
      var g = new THREE.Group();
      var floor = box(2.7, 0.07, 2.0, CREAM);
      floor.position.y = 0.115;
      g.add(floor);
      var backWall = box(2.7, 1.1, 0.06, CREAM);
      backWall.position.set(0, 0.68, -0.97);
      g.add(backWall);
      var rug = box(1.0, 0.014, 1.15, CHAMP, { roughness: 0.9 });
      rug.position.set(0, 0.157, 0.42);
      g.add(rug);
      var bedBase = box(1.05, 0.22, 1.35, DARK);
      bedBase.position.set(0, 0.27, 0.1);
      g.add(bedBase);
      var mattress = box(1.0, 0.16, 1.3, WHITE);
      mattress.position.set(0, 0.46, 0.1);
      g.add(mattress);
      var duvet = box(1.02, 0.07, 0.78, CHAMP);
      duvet.position.set(0, 0.56, 0.32);
      g.add(duvet);
      [-0.25, 0.25].forEach(function (x) {
        var pillow = box(0.36, 0.1, 0.2, WHITE);
        pillow.position.set(x, 0.58, -0.38);
        pillow.rotation.x = -0.12;
        g.add(pillow);
      });
      var headboard = box(1.35, 0.62, 0.07, CHAMP);
      headboard.position.set(0, 0.55, -0.62);
      g.add(headboard);
      var lampsGlow = [];
      [-0.75, 0.75].forEach(function (x) {
        var stand = box(0.24, 0.2, 0.22, DARK);
        stand.position.set(x, 0.25, -0.55);
        g.add(stand);
        var lamp = glowSphere(0.065, 1.5);
        lamp.position.set(x, 0.42, -0.55);
        g.add(lamp);
        lampsGlow.push(lamp);
      });
      var pendantCord = cyl(0.006, 0.006, 0.5, DARK);
      pendantCord.position.set(0.95, 1.13, 0.55);
      g.add(pendantCord);
      var pendant = glowSphere(0.08, 1.4);
      pendant.position.set(0.95, 0.85, 0.55);
      g.add(pendant);
      var sideWall = box(0.06, 1.1, 2.0, CREAM);
      sideWall.position.set(1.32, 0.68, 0);
      g.add(sideWall);
      var window_ = box(0.02, 0.72, 1.1, 0x22303a, { emissive: 0x9fc4d8, emissiveIntensity: 0.2, roughness: 0.2, metalness: 0.5 });
      window_.position.set(1.29, 0.72, 0.2);
      g.add(window_);
      return { group: g, tick: function (t) {
        lampsGlow.forEach(function (l, idx) { l.material.emissiveIntensity = 1.35 + Math.sin(t * 1.3 + idx * 2) * 0.18; });
        pendant.material.emissiveIntensity = 1.3 + Math.sin(t * 1.9) * 0.2;
      } };
    }

    var builders = { fachada: buildFachada, living: buildLiving, piscina: buildPiscina, suite: buildSuite };
    var items = [];

    cards.forEach(function (card) {
      var canvas = card.querySelector('.proj-maq');
      var kind = card.getAttribute('data-maq');
      var build = builders[kind];
      if (!canvas || !build) return;

      var renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
      } catch (err) { card.classList.add('show-photo'); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
      camera.position.set(0, 2.5, 5.6);
      camera.lookAt(0, 0.6, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      var keyL = new THREE.DirectionalLight(0xffe4c0, 1.15);
      keyL.position.set(3, 6, 4);
      scene.add(keyL);
      var fillL = new THREE.DirectionalLight(0x9db4cc, 0.35);
      fillL.position.set(-4, 3, -2);
      scene.add(fillL);

      var model = build();
      model.group.add(basePlate());
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
