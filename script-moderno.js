(() => {
  'use strict';
  const root = document.documentElement;
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#menu');
  const mobile = window.matchMedia('(max-width: 760px)');
  const setMenu = open => {
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = open ? 'Fechar menu' : 'Abrir menu';
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', event => {
    if (!event.target.closest('.topbar')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuButton.focus();
    }
  });
  window.addEventListener('resize', () => { if (!mobile.matches) setMenu(false); });
  document.querySelector('#year').textContent = new Date().getFullYear();

  const themeToggle = document.querySelector('.theme-toggle');
  const updateTheme = theme => {
    root.dataset.theme = theme === 'light' ? 'light' : 'dark';
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-pressed', String(light));
    const label = light ? 'Ativar tema escuro' : 'Ativar tema claro';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
  };
  updateTheme(root.dataset.theme);
  themeToggle.addEventListener('click', () => {
    updateTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
    try { localStorage.setItem('acnatural-modern-theme', root.dataset.theme); } catch (_) { /* Private browsing remains usable. */ }
  });

  const images = Array.from(document.querySelectorAll('.project-grid img'));
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Imagem ampliada');
  overlay.innerHTML = '<button class="lightbox-close" type="button" aria-label="Fechar imagem ampliada">×</button><button class="lightbox-prev" type="button" aria-label="Imagem anterior">←</button><div class="lightbox-content"><img alt=""><p aria-live="polite"></p></div><button class="lightbox-next" type="button" aria-label="Próxima imagem">→</button>';
  document.body.appendChild(overlay);
  const preview = overlay.querySelector('img');
  const caption = overlay.querySelector('p');
  const closeButton = overlay.querySelector('.lightbox-close');
  const background = Array.from(document.body.children).filter(el => el !== overlay && el.tagName !== 'SCRIPT');
  let current = 0;
  let returnFocus;
  let savedY = 0;
  let backgroundState = [];
  const showImage = index => {
    current = (index + images.length) % images.length;
    const image = images[current];
    preview.src = image.dataset.full || image.currentSrc || image.src;
    preview.alt = image.alt;
    caption.textContent = `${current + 1} / ${images.length} · ${image.closest('figure').querySelector('figcaption').innerText.replace(/\n/g, ' — ')}`;
  };
  const open = index => {
    returnFocus = images[index].closest('button');
    savedY = window.scrollY;
    showImage(index);
    overlay.hidden = false;
    // Fixed-body locking also prevents background scrolling in iPhone Safari.
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedY}px`;
    document.body.style.width = '100%';
    closeButton.focus({ preventScroll: true });
    backgroundState = background.map(el => ({ el, inert: el.inert, hidden: el.getAttribute('aria-hidden') }));
    background.forEach(el => { el.inert = true; el.setAttribute('aria-hidden', 'true'); });
  };
  const close = () => {
    overlay.hidden = true;
    backgroundState.forEach(({ el, inert, hidden }) => {
      el.inert = inert;
      if (hidden === null) el.removeAttribute('aria-hidden');
      else el.setAttribute('aria-hidden', hidden);
    });
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedY);
    if (returnFocus) returnFocus.focus({ preventScroll: true });
    requestAnimationFrame(() => { root.style.scrollBehavior = ''; });
    preview.removeAttribute('src');
  };
  images.forEach((image, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'project-image-button';
    button.setAttribute('aria-label', `${image.alt}. Clique para ampliar.`);
    button.setAttribute('aria-haspopup', 'dialog');
    image.parentNode.insertBefore(button, image);
    button.appendChild(image);
    button.addEventListener('click', () => open(index));
  });
  closeButton.addEventListener('click', close);
  overlay.querySelector('.lightbox-prev').addEventListener('click', () => showImage(current - 1));
  overlay.querySelector('.lightbox-next').addEventListener('click', () => showImage(current + 1));
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(current + 1); }
    if (event.key === 'Tab') {
      const buttons = Array.from(overlay.querySelectorAll('button'));
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (!overlay.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  if ('IntersectionObserver' in window) {
    const links = Array.from(menu.querySelectorAll('a'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => {
            if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
})();
