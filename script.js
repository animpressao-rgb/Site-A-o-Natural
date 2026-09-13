const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#menu');

menuButton.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();

const galleryImages = document.querySelectorAll('.project-grid img');

const projectGrid = document.querySelector('#project-grid');
if (projectGrid) {
  const projects = Array.from(projectGrid.querySelectorAll('figure'));
  const remainingProjects = projects.slice(8);
  if (remainingProjects.length) {
    remainingProjects.forEach(project => { project.hidden = true; });
    const moreButton = document.createElement('button');
    moreButton.type = 'button';
    moreButton.className = 'btn btn-primary projects-more';
    moreButton.textContent = 'Ver mais';
    moreButton.setAttribute('aria-controls', 'project-grid');
    moreButton.setAttribute('aria-expanded', 'false');
    projectGrid.after(moreButton);
    moreButton.addEventListener('click', () => {
      const expanded = moreButton.getAttribute('aria-expanded') !== 'true';
      remainingProjects.forEach(project => { project.hidden = !expanded; });
      moreButton.setAttribute('aria-expanded', String(expanded));
      moreButton.textContent = expanded ? 'Ver menos' : 'Ver mais';
    });
  }
}

if (galleryImages.length) {
  const lightbox = document.createElement('dialog');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('aria-label', 'Imagem ampliada');
  lightbox.innerHTML = `
    <button class="lightbox-close" type="button" aria-label="Fechar imagem ampliada">&times;</button>
    <img src="" alt="">
    <p></p>
  `;
  document.body.appendChild(lightbox);

  const enlargedImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('p');
  const closeButton = lightbox.querySelector('.lightbox-close');

  const openLightbox = image => {
    enlargedImage.src = image.dataset.full || image.currentSrc || image.src;
    enlargedImage.alt = image.alt;
    caption.textContent = image.closest('figure')?.querySelector('figcaption')?.innerText || image.alt;
    lightbox.showModal();
    document.body.classList.add('lightbox-open');
  };

  const closeLightbox = () => lightbox.close();

  galleryImages.forEach(image => {
    image.tabIndex = 0;
    image.setAttribute('role', 'button');
    image.setAttribute('aria-label', `${image.alt}. Clique para ampliar.`);
    image.addEventListener('click', () => openLightbox(image));
    image.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(image);
      }
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  lightbox.addEventListener('close', () => {
    document.body.classList.remove('lightbox-open');
    enlargedImage.src = '';
  });
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
}

const themeToggle = document.querySelector('.theme-toggle');
const darkTheme = document.querySelector('#dark-theme');
if (themeToggle && darkTheme) {
  themeToggle.addEventListener('click', () => {
    const isLight = document.documentElement.dataset.theme !== 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
    darkTheme.disabled = isLight;
    themeToggle.setAttribute('aria-pressed', String(isLight));
    const label = isLight ? 'Ativar tema escuro' : 'Ativar tema claro';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.title = label;
  });
}
