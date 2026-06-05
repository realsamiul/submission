// ── SMOOTH SCROLL (Exo Ape style with fixed body + inner scroll) ──
(function() {
  // Only apply on desktop to avoid touch issues on mobile
  if (window.innerWidth < 601) return;

  const body = document.body;
  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'smooth-scroll';

  // Move all existing content into the scroll container
  while (body.firstChild) {
    scrollContainer.appendChild(body.firstChild);
  }
  body.appendChild(scrollContainer);

  let currentScroll = 0;
  let targetScroll = 0;
  let isScrolling = false;

  scrollContainer.addEventListener('scroll', () => {
    currentScroll = scrollContainer.scrollTop;
    if (!isScrolling) {
      targetScroll = currentScroll;
    }
  });

  function smoothScrollTo(target, duration = 1200) {
    const start = scrollContainer.scrollTop;
    const change = target - start;
    const startTime = performance.now();
    isScrolling = true;

    function animateScroll(now) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - t, 3); // cubic out
      scrollContainer.scrollTop = start + change * ease;
      if (t < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        isScrolling = false;
        currentScroll = target;
      }
    }
    requestAnimationFrame(animateScroll);
  }

  // Intercept anchor clicks
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = rect.top + scrollContainer.scrollTop;
        smoothScrollTo(scrollTop, 1000);
        history.pushState(null, null, targetId);
      }
    });
  });
})();

// ── TEXT MASK REVEAL (title-line animations) ──
(function() {
  const titleLines = document.querySelectorAll('.title-line');
  if (!titleLines.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -80px 0px' });

  titleLines.forEach(line => observer.observe(line));
})();

// ── SCROLL REVEAL (original, enhanced with faster response) ──
(function() {
  const revealElements = document.querySelectorAll('.reveal');
  if (!revealElements.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('up');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => io.observe(el));
})();

// ── MARQUEE DUPLICATE + PAUSE ON HOVER (enhanced) ──
(function() {
  document.querySelectorAll('.marquee-track').forEach(track => {
    // duplicate content for seamless loop
    const content = track.innerHTML;
    track.innerHTML = content + content;
  });
})();

// ── NAV BLEND (improved for smooth-scroll container) ──
(function() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const updateNavBackground = () => {
    const scrollContainer = document.querySelector('.smooth-scroll');
    const scrolled = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
    if (scrolled > 80) {
      nav.style.background = 'rgba(245,242,236,0.92)';
      nav.style.backdropFilter = 'blur(12px)';
      nav.style.mixBlendMode = 'normal';
    } else {
      nav.style.background = 'transparent';
      nav.style.backdropFilter = 'none';
      nav.style.mixBlendMode = 'multiply';
    }
  };

  window.addEventListener('scroll', updateNavBackground);
  const scrollContainer = document.querySelector('.smooth-scroll');
  if (scrollContainer) scrollContainer.addEventListener('scroll', updateNavBackground);
})();

// ── ACTIVE NAV LINK (original) ──
(function() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();
