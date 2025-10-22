// Carrossel de banner
// - Estrutura HTML inserida em index.html (section.banner)
// - Este JS controla altura dinâmica, navegação, auto-slide e swipe

(function () {
  // Aguarda DOM pronto
  document.addEventListener('DOMContentLoaded', function () {
    const banner = document.querySelector('.banner');
    if (!banner) return;

    const wrapper = banner.querySelector('.banner-wrapper');
    const track = banner.querySelector('.banner-track');
    const slides = Array.from(banner.querySelectorAll('.banner-slide'));
    const dotsContainer = banner.querySelector('.banner-dots');
    const dots = Array.from(banner.querySelectorAll('.banner-dot'));
    const prevBtn = banner.querySelector('.banner-arrow.left');
    const nextBtn = banner.querySelector('.banner-arrow.right');

    // Acessibilidade: permite foco pelo teclado no wrapper
    if (wrapper) wrapper.setAttribute('tabindex', '0');

    // Estado
    let current = 0;
    const total = slides.length || 4;
    const INTERVAL = 9000; // troca automática um pouco mais lenta
    let timer = null;

    // Ajusta a altura do banner com base no header
    function setBannerHeight() {
      const header = document.querySelector('header');
      const h = header ? header.offsetHeight : 0;
      // Aplica min-height dinâmico
      banner.style.minHeight = `calc(100vh - ${h}px)`;
      // Opcional: expõe variável CSS
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    }

    // Atualiza a posição do trilho
    function goTo(i) {
      const idx = ((i % total) + total) % total; // wrap seguro
      current = idx;
      const x = -current * 100;
      track.style.transform = `translateX(${x}%)`;
      updateDots();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function updateDots() {
      dots.forEach((btn, i) => {
        btn.classList.toggle('is-active', i === current);
        btn.setAttribute('aria-pressed', i === current ? 'true' : 'false');
      });
    }

    function startAuto() {
      stopAuto();
      // Respeita usuários com redução de movimento
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(next, INTERVAL);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function restartAuto() {
      startAuto();
    }

    // Eventos setas
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); restartAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); restartAuto(); });

    // Eventos dots
    dots.forEach((btn, i) => {
      btn.addEventListener('click', function () { goTo(i); restartAuto(); });
    });

    // Pausa auto-slide ao passar o mouse (desktop)
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAuto);
      wrapper.addEventListener('mouseleave', startAuto);
    }

    // Navegação por teclado no wrapper (setas esquerda/direita)
    if (wrapper) {
      wrapper.addEventListener('keydown', function (e) {
        const key = e.key || e.code;
        if (key === 'ArrowLeft') { e.preventDefault(); prev(); restartAuto(); }
        if (key === 'ArrowRight') { e.preventDefault(); next(); restartAuto(); }
      });
    }

    // Suporte a swipe/touch em mobile
    let startX = 0;
    let deltaX = 0;
    let touching = false;
    const THRESHOLD = 60; // ~60px

    function onTouchStart(e) {
      touching = true;
      startX = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) || 0;
      deltaX = 0;
      stopAuto();
    }
    function onTouchMove(e) {
      if (!touching) return;
      const x = (e.touches && e.touches[0] ? e.touches[0].clientX : e.clientX) || 0;
      deltaX = x - startX;
    }
    function onTouchEnd() {
      touching = false;
      if (Math.abs(deltaX) > THRESHOLD) {
        if (deltaX < 0) next(); else prev();
      }
      deltaX = 0;
      startAuto();
    }

    if (wrapper) {
      wrapper.addEventListener('touchstart', onTouchStart, { passive: true });
      wrapper.addEventListener('touchmove', onTouchMove, { passive: true });
      wrapper.addEventListener('touchend', onTouchEnd);
      // Suporte básico a pointer (arrasto com mouse), opcional
      wrapper.addEventListener('pointerdown', onTouchStart);
      wrapper.addEventListener('pointermove', onTouchMove);
      wrapper.addEventListener('pointerup', onTouchEnd);
      wrapper.addEventListener('pointercancel', onTouchEnd);
      wrapper.addEventListener('pointerleave', function(){ if (touching) onTouchEnd(); });
    }

    // Ajuste de altura em load/resize
    setBannerHeight();
    window.addEventListener('resize', setBannerHeight);

    // Inicialização
    goTo(0);
    startAuto();
  });
})();

// Menu mobile (hambúrguer)
document.addEventListener('DOMContentLoaded', function(){
  const header = document.querySelector('header');
  const toggle = document.querySelector('.menu-toggle') || document.querySelector('header .menu-icon');
  const nav = document.querySelector('header nav');
  if (!header || !toggle || !nav) return;

  function openMenu(){
    header.classList.add('is-open');
    document.body.classList.add('menu-open');
    if (toggle.setAttribute) toggle.setAttribute('aria-expanded','true');
  }
  function closeMenu(){
    header.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (toggle.setAttribute) toggle.setAttribute('aria-expanded','false');
  }
  function toggleMenu(){
    if (header.classList.contains('is-open')) closeMenu(); else openMenu();
  }

  // Interações
  toggle.addEventListener('click', toggleMenu);

  // Fecha ao clicar em qualquer link do menu
  nav.addEventListener('click', function(e){
    const link = e.target.closest('a');
    if (link) closeMenu();
  });

  // Fecha com ESC
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  // Fecha ao clicar fora do header quando aberto
  document.addEventListener('click', function(e){
    if (!header.classList.contains('is-open')) return;
    if (header.contains(e.target)) return;
    closeMenu();
  });

  // Fecha ao sair do breakpoint mobile
  const mq = window.matchMedia('(min-width: 821px)');
  if (mq.addEventListener) {
    mq.addEventListener('change', (e)=>{ if (e.matches) closeMenu(); });
  } else if (mq.addListener) {
    mq.addListener(function(e){ if (e.matches) closeMenu(); });
  }
});

// Galeria moderna + Lightbox
document.addEventListener('DOMContentLoaded', function(){
  try {
    // Injeta CSS de melhorias da galeria e lightbox
    const cssId = 'gallery-modern-css';
    if (!document.getElementById(cssId)) {
      const style = document.createElement('style');
      style.id = cssId;
      style.textContent = `
/* Modern gallery overrides */
.galeria .galeria-grid{display:grid;gap:16px;align-items:start;grid-template-columns:repeat(2,1fr)}
@media(min-width:820px){.galeria .galeria-grid{grid-template-columns:repeat(3,1fr)}}
.galeria .galeria-grid .galeria-item:last-child:nth-child(odd){grid-column:auto;justify-self:stretch;max-width:unset}
.galeria .galeria-item{position:relative;overflow:hidden;background:#fad3d7;border-radius:12px;box-shadow:var(--shadow);aspect-ratio:1/1}
.galeria .galeria-item::after{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0),rgba(0,0,0,.12));pointer-events:none}
/* garante corte uniforme em todas as imagens */
.galeria .galeria-item img{object-fit:cover !important}
@media(min-width:900px){.galeria .galeria-grid{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}}
/* Força 2 colunas apenas nas seções pedidas */
#galeria .galeria-grid{grid-template-columns:repeat(2,1fr)!important}
#temas-halloween .galeria-grid{grid-template-columns:repeat(2,1fr)!important}
/* Lightbox */
.lightbox{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.9);z-index:1000}
.lightbox.is-open{display:flex}
.lightbox__img{max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.lightbox__close,.lightbox__prev,.lightbox__next{position:absolute;background:rgba(0,0,0,.4);color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:999px;width:44px;height:44px;display:grid;place-items:center;cursor:pointer;transition:background .2s ease,transform .15s ease}
.lightbox__close{top:20px;right:24px;font-size:24px}
.lightbox__prev{left:20px;top:50%;transform:translateY(-50%);font-size:28px}
.lightbox__next{right:20px;top:50%;transform:translateY(-50%);font-size:28px}
.lightbox__close:hover,.lightbox__prev:hover,.lightbox__next:hover{background:rgba(255,255,255,.15);transform:scale(1.05)}
body.lb-open{overflow:hidden}
      `;
      document.head.appendChild(style);
    }

    // Cria lightbox na página (uma instância global)
    let lb = document.getElementById('lightbox');
    if (!lb) {
      lb = document.createElement('div');
      lb.id = 'lightbox';
      lb.className = 'lightbox';
      lb.setAttribute('aria-modal','true');
      lb.setAttribute('role','dialog');
      lb.setAttribute('aria-hidden','true');
      lb.innerHTML = `
        <button class="lightbox__close" aria-label="Fechar">×</button>
        <img class="lightbox__img" alt="Imagem ampliada">
        <button class="lightbox__prev" aria-label="Anterior">‹</button>
        <button class="lightbox__next" aria-label="Próximo">›</button>
      `;
      document.body.appendChild(lb);
    }

    const imgEl = lb.querySelector('.lightbox__img');
    const btnClose = lb.querySelector('.lightbox__close');
    const btnPrev = lb.querySelector('.lightbox__prev');
    const btnNext = lb.querySelector('.lightbox__next');

    let currentList = [];
    let currentIndex = 0;

    function openLightbox(list, index){
      currentList = list;
      currentIndex = index;
      const src = currentList[currentIndex].getAttribute('src');
      const alt = currentList[currentIndex].getAttribute('alt') || '';
      imgEl.src = src;
      imgEl.alt = alt;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden','false');
      document.body.classList.add('lb-open');
    }
    function closeLightbox(){
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden','true');
      document.body.classList.remove('lb-open');
      imgEl.src = '';
    }
    function showNext(){ if (!currentList.length) return; currentIndex = (currentIndex + 1) % currentList.length; openLightbox(currentList, currentIndex); }
    function showPrev(){ if (!currentList.length) return; currentIndex = (currentIndex - 1 + currentList.length) % currentList.length; openLightbox(currentList, currentIndex); }

    btnClose.addEventListener('click', closeLightbox);
    btnNext.addEventListener('click', showNext);
    btnPrev.addEventListener('click', showPrev);

    lb.addEventListener('click', function(e){
      if (e.target === lb) closeLightbox();
    });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Liga clique nas imagens por seção (navegação por seção)
    const sections = document.querySelectorAll('section.galeria');
    sections.forEach(sec => {
      const imgs = Array.from(sec.querySelectorAll('.galeria-item img'));
      imgs.forEach((img, i) => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(imgs, i));
      });
    });
  } catch (err) {
    // Falha silenciosa para não quebrar o site
    console && console.warn && console.warn('Gallery/lightbox init error:', err);
  }
});
