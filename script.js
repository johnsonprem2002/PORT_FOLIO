(() => {
  // Lightweight pointer spotlight and scroll progress, with no dependency on libraries.
  const progress = document.createElement('div');
  progress.id = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<span></span>';
  document.body.prepend(progress);
  const progressFill = progress.querySelector('span');
  let scrollTick = false;
  function updateScrollProgress() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const amount = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    progressFill.style.width = `${amount * 100}%`;
    scrollTick = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollTick) { requestAnimationFrame(updateScrollProgress); scrollTick = true; }
  }, { passive: true });
  updateScrollProgress();
  const pointerSpotlight = event => {
    if (event.pointerType === 'touch') return;
    document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
  };
  window.addEventListener('pointermove', pointerSpotlight, { passive: true });
  window.addEventListener('resize', updateScrollProgress, { passive: true });

  const grid = document.querySelector('#project-grid');
  const modal = document.querySelector('#project-modal');
  const content = document.querySelector('#modal-content');
  const cards = [...document.querySelectorAll('.project-card')];
  const filters = [...document.querySelectorAll('.filter')];
  const search = document.querySelector('#project-search');
  const count = document.querySelector('#visible-project-count');
  let activeFilter = 'all';
  let lastProjectTrigger = null;

  // Category totals are computed from the project data, not manually maintained.
  filters.forEach(button => {
    const total = cards.filter(card => button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter).length;
    const label = button.querySelector('span');
    if (label) label.textContent = String(total).padStart(2, '0');
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filters.forEach(item => item.classList.toggle('active', item === button));
      applyFilters();
    });
  });

  function applyFilters() {
    const term = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesCategory = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !term || card.textContent.toLowerCase().includes(term) || (card.querySelector('img')?.alt || '').toLowerCase().includes(term);
      const show = matchesCategory && matchesSearch;
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = String(visible).padStart(2, '0');
    const empty = document.querySelector('.no-projects');
    if (visible === 0 && !empty) {
      const note = document.createElement('p');
      note.className = 'no-projects';
      note.textContent = 'No projects match that search. Try another keyword or reset the filters.';
      grid?.after(note);
    } else if (visible > 0 && empty) empty.remove();
  }
  search?.addEventListener('input', applyFilters);

  function openProject(id) {
    const card = cards.find(item => item.dataset.project === id);
    if (!card || !modal || !content) return;
    lastProjectTrigger = document.activeElement;
    const title = card.querySelector('h3')?.textContent || 'Project';
    const type = card.querySelector('.project-type')?.textContent || 'CAD PROJECT';
    const image = card.querySelector('img')?.getAttribute('src') || '';
    const lead = card.querySelector('.project-info p')?.textContent || 'A mechanical CAD and design study.';
      content.innerHTML = `<div class="eyebrow">${type}</div><h2 id="modal-title">${title}</h2><p class="modal-lead">${lead}</p><img class="modal-image" src="${image}" alt="${title}"><div class="modal-tags"><span>CAD MODELLING</span><span>DESIGN EXPLORATION</span><span>ENGINEERING VISUALISATION</span></div><h3>Project overview</h3><p>${lead}</p><h3>Design focus</h3><p>This project explores component geometry, assembly relationships, and clear engineering visualisation. The displayed model or drawing is the visual reference for this project.</p><h3>Skills shown</h3><p>3D CAD modelling, mechanical design thinking, and technical presentation.</p><a class="button button-primary" href="mailto:johnsonprem2002@gmail.com?subject=${encodeURIComponent('Portfolio enquiry: ' + title)}">Discuss this project <span>↗</span></a>`;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    const panel = modal.querySelector('.modal-panel');
    if (panel) panel.scrollTop = 0;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close')?.focus();
  }
  function closeProject() {
    modal?.classList.remove('open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastProjectTrigger?.focus?.();
  }
  document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.open)));
  document.querySelectorAll('.project-card .project-image').forEach(button => button.addEventListener('click', () => openProject(button.closest('.project-card').dataset.project)));
  modal?.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', closeProject));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeProject(); });

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav');
  toggle?.addEventListener('click', () => {
    const opened = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(opened));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));

  // Scroll reveals and a gentle 3D card response, both disabled for reduced-motion users.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: .12, rootMargin: '0px 0px -35px 0px' });
    document.querySelectorAll('.project-card, .experience-item, .skill-row, .about-image, .section-heading').forEach(el => {
      el.classList.add('reveal'); revealObserver.observe(el);
    });
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('pointermove', event => {
        if (event.pointerType === 'touch') return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 5}deg`);
        card.style.setProperty('--spot-x', `${x * 100}%`);
        card.style.setProperty('--spot-y', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  
  // Hero visual responds to cursor movement; galaxy remains fixed behind it.
  const heroCard = document.querySelector('.hero-card');
  if (heroCard && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    heroCard.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const rect = heroCard.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - .5;
      const ny = (event.clientY - rect.top) / rect.height - .5;
      heroCard.style.setProperty('--hero-tilt-x', `${-ny * 5}deg`);
      heroCard.style.setProperty('--hero-tilt-y', `${nx * 7}deg`);
    });
    heroCard.addEventListener('pointerleave', () => {
      heroCard.style.setProperty('--hero-tilt-x', '0deg');
      heroCard.style.setProperty('--hero-tilt-y', '0deg');
    });
  }

  // Fixed-position galaxy field: soft nebula, spiral arms, and drifting stars.
  const canvas = document.querySelector('#ambient');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  let w = 0, h = 0, dpr = 1, frame = 0, time = 0;
  // Galaxy is anchored to one stable viewport position.
  const galaxyAnchor = { x: innerWidth * .72, y: innerHeight * .42 };
  let stars = [];
  const galaxyReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.min(260, Math.floor(w * h / 5200)) }, (_, i) => {
      const arm = i % 4;
      const radius = Math.pow(Math.random(), .72) * Math.min(w, h) * .43;
      const angle = arm * Math.PI / 2 + radius * .018 + Math.random() * .65;
      return { arm, radius, angle, size: Math.random() * 1.45 + .25, alpha: Math.random() * .32 + .1, twinkle: Math.random() * 6 };
    });
  }
  function draw() {
    if (document.hidden) { frame = 0; return; }
    ctx.clearRect(0, 0, w, h);
    time += .003;
    const radius = Math.min(w, h) * .48;
    const nebula = ctx.createRadialGradient(galaxyAnchor.x, galaxyAnchor.y, 0, galaxyAnchor.x, galaxyAnchor.y, radius);
    nebula.addColorStop(0, 'rgba(116, 91, 210, .075)');
    nebula.addColorStop(.28, 'rgba(75, 160,220, .052)');
    nebula.addColorStop(.62, 'rgba(11,143,104, .026)');
    nebula.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = nebula; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(galaxyAnchor.x, galaxyAnchor.y); ctx.rotate(time * .08);
    for (let arm = 0; arm < 4; arm++) {
      ctx.beginPath();
      for (let n = 0; n <= 100; n++) {
        const r = n / 100 * radius * .72;
        const a = arm * Math.PI / 2 + n * .075;
        const x = Math.cos(a) * r, y = Math.sin(a) * r * .72;
        if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(92, 135, 190, .075)'; ctx.lineWidth = 1.1; ctx.stroke();
    }
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(w, h) * .12);
    core.addColorStop(0, 'rgba(255,255,255,.9)');
    core.addColorStop(.12, 'rgba(165,143,230,.13)');
    core.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(0, 0, Math.min(w, h) * .12, 0, Math.PI * 2); ctx.fill();
    stars.forEach(star => {
      const a = star.angle + time * (.04 + star.arm * .003);
      const x = Math.cos(a) * star.radius;
      const y = Math.sin(a) * star.radius * .72;
      const twinkle = .72 + Math.sin(time * 2 + star.twinkle) * .28;
      ctx.beginPath(); ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(67, 91, 142, ${star.alpha * twinkle})`; ctx.fill();
    });
    ctx.restore();
    if (!galaxyReduceMotion) frame = requestAnimationFrame(draw);
  }
  resize();
  draw();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !galaxyReduceMotion && !frame) draw(); });
})();
