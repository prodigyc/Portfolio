(() => {
  const $ = (s) => document.querySelector(s);
  const filmstrip = $('#project-filmstrip');
  const filters = $('#filters');
  const showcase = $('#showcase');
  const dialog = $('#case-dialog');
  const menuButton = $('#menu-button');
  const mobileNav = $('#mobile-nav');
  let activeFilter = 'all';
  let selected = projects[0];
  let switching = false;

  function visibleProjects() {
    return projects.filter((project) => activeFilter === 'all' || project.category === activeFilter);
  }
  function renderFilmstrip() {
    const visible = visibleProjects();
    filmstrip.innerHTML = visible.map((project) => {
      const index = projects.indexOf(project) + 1;
      const active = project.id === selected.id;
      return `<button class="film-tile${active ? ' is-current' : ''}" type="button" data-project="${project.id}" aria-label="Show project ${index}: ${project.title}" aria-pressed="${active}" title="${project.title}"><img src="${project.image}" alt="" loading="lazy"><span class="film-tile-label"><b>${String(index).padStart(2, '0')}</b>${project.title}</span></button>`;
    }).join('');
    $('#project-count').textContent = `${String(visible.length).padStart(2, '0')} CASE FILE${visible.length === 1 ? '' : 'S'}`;
  }
  function commitProject(project) {
    selected = project;
    const visible = visibleProjects();
    const position = Math.max(0, visible.findIndex((item) => item.id === project.id));
    const image = $('#showcase-image');
    image.src = project.image;
    image.alt = `Original digital artwork for ${project.title}`;
    $('#project-position').textContent = `${String(position + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    $('#project-status').textContent = project.status.toUpperCase();
    $('#project-type').textContent = `${project.type.toUpperCase()} / ${project.year}`;
    $('#project-title').textContent = project.title;
    $('#project-summary').textContent = project.summary;
    $('#visual-category').textContent = project.type.toUpperCase();
    $('#visual-year').textContent = project.year;
    const tools = $('#project-tools');
    tools.replaceChildren(...project.tools.map((tool) => {const item = document.createElement('span'); item.textContent = tool; return item;}));
    renderFilmstrip();
    document.dispatchEvent(new CustomEvent('portfolio:project-applied', { detail: { id: project.id } }));
  }
  function selectProject(project) {
    if (!project || project.id === selected.id || switching) return;
    switching = true;
    const event = new CustomEvent('portfolio:project-request', {
      cancelable: true,
      detail: { project, commit: () => {commitProject(project);}, done: () => {switching = false;} }
    });
    if (document.dispatchEvent(event)) {
      commitProject(project);
      switching = false;
    }
  }
  function moveProject(direction) {
    const current = visibleProjects();
    if (!current.length) return;
    const index = current.findIndex((item) => item.id === selected.id);
    selectProject(current[(index + direction + current.length) % current.length]);
  }
  function setFilter(filter) {
    if (!['all','security','forensics','systems','data'].includes(filter)) return;
    activeFilter = filter;
    filters.querySelectorAll('[data-filter]').forEach((item) => {
      const active = item.dataset.filter === filter;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-pressed', String(active));
    });
    const visible = visibleProjects();
    renderFilmstrip();
    if (visible.length && !visible.some((project) => project.id === selected.id)) selectProject(visible[0]);
    else commitProject(selected);
  }
  function openDialog() {
    $('#dialog-category').textContent = `${selected.type.toUpperCase()} / ${selected.year}`;
    $('#dialog-title').textContent = selected.title;
    $('#dialog-description').textContent = selected.description;
    $('#dialog-outcomes').replaceChildren(...selected.outcomes.map((outcome) => { const li = document.createElement('li'); li.textContent = outcome; return li; }));
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }
  function closeDialog() { if (dialog.open) dialog.close(); }

  filmstrip.addEventListener('click', (event) => {
    const button = event.target.closest('[data-project]');
    if (button) selectProject(projects.find((project) => project.id === button.dataset.project));
  });
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (button) setFilter(button.dataset.filter);
  });
  $('#project-prev').addEventListener('click', () => moveProject(-1));
  $('#project-next').addEventListener('click', () => moveProject(1));
  showcase.addEventListener('keydown', (event) => {
    if (dialog.open || ['INPUT','TEXTAREA'].includes(event.target.tagName)) return;
    if (event.key === 'ArrowRight') {event.preventDefault();moveProject(1);}
    if (event.key === 'ArrowLeft') {event.preventDefault();moveProject(-1);}
  });
  $('#case-open').addEventListener('click', openDialog);
  $('#dialog-close').addEventListener('click', closeDialog);
  $('#dialog-close-bottom').addEventListener('click', closeDialog);
  dialog.addEventListener('click', (event) => {if (event.target === dialog) closeDialog();});
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

  function toggleMenu(force) {
    const open = force ?? !mobileNav.classList.contains('is-open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileNav.classList.toggle('is-open',open);
    mobileNav.inert = !open;
    document.body.classList.toggle('menu-open',open);
  }
  menuButton.addEventListener('click', () => toggleMenu());
  mobileNav.addEventListener('click', (event) => {if (event.target.closest('a')) toggleMenu(false);});
  window.addEventListener('keydown', (event) => {if (event.key === 'Escape' && mobileNav.classList.contains('is-open')) {toggleMenu(false);menuButton.focus();}});
  window.addEventListener('resize', () => {if (window.innerWidth > 780 && mobileNav.classList.contains('is-open')) toggleMenu(false);}, {passive: true});

  const progress = $('#scroll-progress');
  const topbar = $('#topbar');
  let scrollFrame = 0;
  function updateScroll() {
    scrollFrame = 0;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${available > 0 ? Math.min(1,window.scrollY/available) : 0})`;
    topbar.classList.toggle('is-scrolled', window.scrollY > 35);
    const hero = $('.hero');
    const value = Math.max(0, Math.min(window.scrollY, window.innerHeight));
    hero.style.setProperty('--hero-motion',`${Math.round(value * -.12)}px`);
    hero.style.setProperty('--grid-motion',`${Math.round(value * .21)}px`);
  }
  window.addEventListener('scroll', () => {if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);},{passive:true});
  window.addEventListener('resize',updateScroll,{passive:true});
  commitProject(selected);
  updateScroll();
})();
