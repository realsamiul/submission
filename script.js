/**
 * Exo Ape Motion System
 * Handles title animations, scroll triggers, parallax, and micro-interactions
 * Optimized for GPU acceleration and accessibility
 */

(function() {
  'use strict';

  // =========================================================================
  // CONFIGURATION
  // =========================================================================
  
  const CONFIG = {
    animation: {
      duration: 800, // ms
      stagger: 150, // ms between title lines
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    observer: {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    },
    parallax: {
      enabled: true,
      speed: 0.3, // Base parallax speed
    },
  };

  // =========================================================================
  // UTILITY FUNCTIONS
  // =========================================================================

  /**
   * Debounce function to limit execution frequency
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Check if user prefers reduced motion
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if element is in viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // =========================================================================
  // TITLE MASK ANIMATIONS
  // =========================================================================

  class TitleAnimator {
    constructor() {
      this.titles = document.querySelectorAll('.title');
      this.init();
    }

    init() {
      if (prefersReducedMotion()) {
        // Show all titles immediately if reduced motion is preferred
        this.titles.forEach(title => {
          const lines = title.querySelectorAll('.title-line');
          lines.forEach(line => line.classList.add('is-visible'));
        });
        return;
      }

      // Animate titles on page load or when they enter viewport
      this.titles.forEach(title => {
        if (isInViewport(title)) {
          this.animateTitle(title);
        } else {
          this.observeTitle(title);
        }
      });
    }

    animateTitle(title) {
      const lines = title.querySelectorAll('.title-line');
      lines.forEach((line, index) => {
        setTimeout(() => {
          line.classList.add('is-visible');
        }, index * CONFIG.animation.stagger);
      });
    }

    observeTitle(title) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateTitle(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, CONFIG.observer);

      observer.observe(title);
    }
  }

  // =========================================================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // =========================================================================

  class ScrollAnimator {
    constructor() {
      this.elements = document.querySelectorAll('.animate');
      this.init();
    }

    init() {
      if (prefersReducedMotion()) {
        // Show all elements immediately if reduced motion is preferred
        this.elements.forEach(el => el.classList.add('animate-in'));
        return;
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target); // Fire once
          }
        });
      }, CONFIG.observer);

      this.elements.forEach(el => observer.observe(el));
    }
  }

  // =========================================================================
  // PARALLAX EFFECTS
  // =========================================================================

  class ParallaxController {
    constructor() {
      this.layers = document.querySelectorAll('[data-speed]');
      this.ticking = false;
      this.init();
    }

    init() {
      if (!CONFIG.parallax.enabled || prefersReducedMotion() || this.layers.length === 0) {
        return;
      }

      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      window.addEventListener('resize', debounce(() => this.onScroll(), 100));
      
      // Initial position
      this.onScroll();
    }

    onScroll() {
      if (!this.ticking) {
        window.requestAnimationFrame(() => {
          this.updateParallax();
          this.ticking = false;
        });
        this.ticking = true;
      }
    }

    updateParallax() {
      const scrolled = window.pageYOffset;

      this.layers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed) || CONFIG.parallax.speed;
        const yPos = -(scrolled * speed);
        
        // Use transform for GPU acceleration
        layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });
    }
  }

  // =========================================================================
  // MARQUEE PAUSE ON HOVER
  // =========================================================================

  class MarqueeController {
    constructor() {
      this.marquees = document.querySelectorAll('.marquee');
      this.init();
    }

    init() {
      this.marquees.forEach(marquee => {
        const track = marquee.querySelector('.marquee-track');
        
        marquee.addEventListener('mouseenter', () => {
          track.style.animationPlayState = 'paused';
        });

        marquee.addEventListener('mouseleave', () => {
          track.style.animationPlayState = 'running';
        });
      });
    }
  }

  // =========================================================================
  // IMAGE LAZY LOADING (Native + Fallback)
  // =========================================================================

  class LazyLoader {
    constructor() {
      this.images = document.querySelectorAll('img[data-src]');
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });

        this.images.forEach(img => imageObserver.observe(img));
      } else {
        // Fallback for browsers without IntersectionObserver
        this.images.forEach(img => {
          img.src = img.dataset.src;
        });
      }
    }
  }

  // =========================================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =========================================================================

  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      this.init();
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          
          // Skip if it's just "#"
          if (href === '#') return;

          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({
              behavior: prefersReducedMotion() ? 'auto' : 'smooth',
              block: 'start',
            });
          }
        });
      });
    }
  }

  // =========================================================================
  // PERFORMANCE OPTIMIZATIONS
  // =========================================================================

  class PerformanceOptimizer {
    constructor() {
      this.init();
    }

    init() {
      // Remove will-change after animations complete to free up memory
      document.addEventListener('transitionend', (e) => {
        if (e.target.classList.contains('animate-in') || 
            e.target.classList.contains('is-visible')) {
          // Keep will-change for elements that might animate again
          // Remove for one-time animations if needed
        }
      });

      // Preload critical fonts
      if ('fonts' in document) {
        Promise.all([
          document.fonts.load('300 1em "TWK Lausanne"'),
          document.fonts.load('400 1em "TWK Lausanne"'),
          document.fonts.load('500 1em "TWK Lausanne"'),
        ]).then(() => {
          document.documentElement.classList.add('fonts-loaded');
        });
      }
    }
  }

  // =========================================================================
  // INITIALIZATION
  // =========================================================================

  class ExoApeMotionSystem {
    constructor() {
      this.init();
    }

    init() {
      // Wait for DOM to be fully loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.setup());
      } else {
        this.setup();
      }
    }

    setup() {
      // Initialize all animation systems
      this.titleAnimator = new TitleAnimator();
      this.scrollAnimator = new ScrollAnimator();
      this.parallaxController = new ParallaxController();
      this.marqueeController = new MarqueeController();
      this.lazyLoader = new LazyLoader();
      this.smoothScroll = new SmoothScroll();
      this.performanceOptimizer = new PerformanceOptimizer();

      // Log initialization in development
      if (window.location.hostname === 'localhost' || 
          window.location.hostname === '127.0.0.1') {
        console.log('Exo Ape Motion System initialized');
      }
    }
  }

  // =========================================================================
  // BOOT
  // =========================================================================

  // Initialize the motion system
  new ExoApeMotionSystem();

})();
