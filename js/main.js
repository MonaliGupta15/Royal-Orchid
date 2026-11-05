/**
 * Royal Orchid Hotels & Regenta - Main JavaScript Architecture
 * Powers the preloader, hero carousel, RateGain-style booking engine,
 * dual-rate member simulator, filter tabs, RFP wedding lead capture,
 * table reservation modal, toast engine, and smooth scroll.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure the user always starts at the top of the page to experience the hero video
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  if (window.location.hash) {
    try {
      history.replaceState(null, '', window.location.pathname);
      window.scrollTo(0, 0);
    } catch (_) {}
  }

  initPreloader();
  initLenisSmoothScroll();
  initHeaderScroll();
  initMobileMenu();
  initHeroCarousel();
  initHeroVideoControls();
  initBookingWidget();
  initFilterTabs();
  initModals();
  initToastEngine();
  initScrollAnimations();
  initCardViewportAnimations();
  initCircularTransitions();
  initDateDefaults();

  // Smooth scroll for booking section triggers so page never jumps abruptly
  document.querySelectorAll('a[href="#booking-section"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('booking-section');
      if (target) {
        if (window.lenisInstance) {
          window.lenisInstance.scrollTo(target, { offset: -60, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Re-render Lucide icons if loaded
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

/* ==========================================================================
   1. Preloader Animation
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const counterEl = document.getElementById('preloader-counter');
  const progressBar = document.getElementById('preloader-progress');
  if (!preloader || !counterEl || !progressBar) return;

  let count = 0;
  const interval = setInterval(() => {
    if (count < 95) {
      count += Math.floor(Math.random() * 9) + 4;
      if (count > 95) count = 95;
      counterEl.textContent = count + '%';
      progressBar.style.width = count + '%';
    }
  }, 40);

  const complete = () => {
    clearInterval(interval);
    counterEl.textContent = '100%';
    progressBar.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('preloader-hidden');
    }, 350);
  };

  if (document.readyState === 'complete') {
    complete();
  } else {
    window.addEventListener('load', complete);
    // Safety fallback
    setTimeout(complete, 1600);
  }
}

/* ==========================================================================
   2. Lenis Kinetic Smooth Scroll (Desktop Only - Native Touch on Mobile)
   ========================================================================== */
function initLenisSmoothScroll() {
  if (typeof Lenis !== 'undefined') {
    // On mobile touch devices, prioritize native 120Hz momentum scrolling
    const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
    if (isTouch || window.innerWidth < 1024) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    window.lenisInstance = lenis;
  }
}

/* ==========================================================================
   3. Header Sticky Glassmorphism
   ========================================================================== */
function initHeaderScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   4. Mobile Navigation Drawer
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('menu-toggle-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (!toggleBtn || !mobileDrawer) return;

  const openDrawer = () => {
    mobileDrawer.classList.remove('hidden');
    mobileDrawer.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    mobileDrawer.classList.add('hidden');
    mobileDrawer.classList.remove('flex');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  const navLinks = mobileDrawer.querySelectorAll('a');
  navLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });
}

/* ==========================================================================
   5. Hero Carousel with Slide Wipe & Auto-advance
   ========================================================================== */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');
  const dotsContainer = document.getElementById('hero-dots-container');

  if (!slides || slides.length === 0) return;

  let currentIndex = 0;
  let timer = null;

  // Render indicator dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${
        idx === 0 ? 'bg-brand-gold w-8' : 'bg-white/40 hover:bg-white'
      }`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        restartTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.className = 'w-8 h-2.5 rounded-full bg-brand-gold transition-all duration-300';
      } else {
        dot.className = 'w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white transition-all duration-300';
      }
    });
  }

  function goToSlide(newIndex) {
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].classList.add(newIndex > currentIndex ? 'slide-prev' : 'slide-next');

    currentIndex = (newIndex + slides.length) % slides.length;

    slides[currentIndex].classList.remove('slide-prev', 'slide-next');
    slides[currentIndex].classList.add('active');
    updateDots();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartTimer();
    });
  }

  function startTimer() {
    timer = setInterval(nextSlide, 5000);
  }

  function restartTimer() {
    clearInterval(timer);
    startTimer();
  }

  startTimer();

  // Pause on hover
  const heroSection = document.getElementById('hero-section');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', () => clearInterval(timer));
    heroSection.addEventListener('mouseleave', startTimer);
  }
}

/* ==========================================================================
   5b. Hero Ambient Video & Tour Modal Controls (30-Second Loop)
   ========================================================================== */
function initHeroVideoControls() {
  const heroVideo = document.getElementById('hero-ambient-video');
  const togglePlayBtn = document.getElementById('toggle-video-playback-btn');
  const playLabel = document.getElementById('video-playback-label');
  const soundBtn = document.getElementById('hero-sound-toggle-btn');
  const openTourBtn = document.getElementById('open-video-tour-btn');
  const tourModal = document.getElementById('video-tour-modal');
  const modalVideoPlayer = document.getElementById('video-tour-modal-player');
  const closeTourBtn = document.getElementById('close-video-tour-modal-btn');
  const modalBookBtn = document.getElementById('modal-book-direct-btn');

  let isPlaying = true;
  const MAX_HERO_TIME = 30.0; // Strictly loop the first 30 seconds as requested

  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    heroVideo.loop = true;

    // Strict 30-second loop restriction
    heroVideo.addEventListener('timeupdate', () => {
      if (heroVideo.currentTime >= MAX_HERO_TIME) {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(() => {});
      }
    });

    // Handle end-of-clip fallback
    heroVideo.addEventListener('ended', () => {
      heroVideo.currentTime = 0;
      heroVideo.play().catch(() => {});
    });

    // Aggressive autoplay initiator
    const triggerPlay = () => {
      heroVideo.muted = true;
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isPlaying = true;
        }).catch(() => {
          // Retry on first user interaction if browser has strict policy
          const retryOnInteraction = () => {
            heroVideo.play().then(() => {
              isPlaying = true;
            }).catch(() => {});
            document.removeEventListener('click', retryOnInteraction);
            document.removeEventListener('touchstart', retryOnInteraction);
            document.removeEventListener('scroll', retryOnInteraction);
          };
          document.addEventListener('click', retryOnInteraction, { passive: true });
          document.addEventListener('touchstart', retryOnInteraction, { passive: true });
          document.addEventListener('scroll', retryOnInteraction, { passive: true });
        });
      }
    };

    triggerPlay();
    if (document.readyState === 'complete') {
      triggerPlay();
    } else {
      window.addEventListener('load', triggerPlay);
    }
  }

  // Toggle ambient video playback (pause / resume)
  if (togglePlayBtn && heroVideo) {
    togglePlayBtn.addEventListener('click', () => {
      if (!heroVideo.paused) {
        heroVideo.pause();
        isPlaying = false;
        togglePlayBtn.innerHTML = `
          <i data-lucide="play" class="w-3.5 h-3.5 text-brand-gold"></i>
          <span id="video-playback-label">Play Video</span>
        `;
      } else {
        heroVideo.play().catch(() => {});
        isPlaying = true;
        togglePlayBtn.innerHTML = `
          <i data-lucide="pause" class="w-3.5 h-3.5 text-brand-gold"></i>
          <span id="video-playback-label">Pause Video</span>
        `;
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // Open Full Tour Modal with Sound
  function launchVideoTour() {
    if (!tourModal) return;
    // Pause background ambient video
    if (heroVideo && !heroVideo.paused) {
      heroVideo.pause();
    }
    tourModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (modalVideoPlayer) {
      modalVideoPlayer.currentTime = 0;
      modalVideoPlayer.muted = false;
      modalVideoPlayer.play().catch(() => {});
    }
  }

  // Close Tour Modal
  function closeVideoTour() {
    if (!tourModal) return;
    tourModal.classList.remove('active');
    document.body.style.overflow = '';

    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
    }

    // Resume background ambient video if it was running
    if (heroVideo && isPlaying) {
      heroVideo.play().catch(() => {});
    }
  }

  if (openTourBtn) {
    openTourBtn.addEventListener('click', (e) => {
      e.preventDefault();
      launchVideoTour();
    });
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
      e.preventDefault();
      launchVideoTour();
    });
  }

  if (closeTourBtn) {
    closeTourBtn.addEventListener('click', closeVideoTour);
  }

  if (modalBookBtn) {
    modalBookBtn.addEventListener('click', closeVideoTour);
  }

  if (tourModal) {
    tourModal.addEventListener('click', (e) => {
      if (e.target === tourModal) {
        closeVideoTour();
      }
    });
  }

  // Keyboard accessibility: ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && tourModal && tourModal.classList.contains('active')) {
      closeVideoTour();
    }
  });
}

/* ==========================================================================
   6. Universal Booking Engine (RateGain Distribution Architecture)
   ========================================================================== */
function initBookingWidget() {
  // Destination Dropdown Toggle
  const destBtn = document.getElementById('booking-destination-btn');
  const destDropdown = document.getElementById('booking-destination-dropdown');
  const destLabel = document.getElementById('booking-destination-selected');
  const destSearchInput = document.getElementById('destination-search-input');
  const destOptions = document.querySelectorAll('.destination-option');

  if (destBtn && destDropdown) {
    destBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      destDropdown.classList.toggle('hidden');
      if (!destDropdown.classList.contains('hidden') && destSearchInput) {
        destSearchInput.focus();
      }
    });

    if (destSearchInput) {
      destSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        destOptions.forEach((opt) => {
          const text = opt.textContent.toLowerCase();
          opt.style.display = text.includes(query) ? 'block' : 'none';
        });
      });
    }

    destOptions.forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const hotelName = opt.getAttribute('data-hotel') || opt.textContent.trim();
        if (destLabel) destLabel.textContent = hotelName;
        destDropdown.classList.add('hidden');
      });
    });
  }

  // Guests & Rooms Counter Popover
  const guestsBtn = document.getElementById('booking-guests-btn');
  const guestsPopover = document.getElementById('booking-guests-popover');
  const guestsSummary = document.getElementById('booking-guests-summary');

  let adultsCount = 2;
  let childrenCount = 0;
  let roomsCount = 1;

  if (guestsBtn && guestsPopover) {
    guestsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      guestsPopover.classList.toggle('hidden');
    });

    const updateGuestsDisplay = () => {
      if (guestsSummary) {
        guestsSummary.textContent = `${adultsCount} Adult${adultsCount > 1 ? 's' : ''}, ${childrenCount} Child${childrenCount === 1 ? '' : 'ren'} · ${roomsCount} Room${roomsCount > 1 ? 's' : ''}`;
      }
      const aVal = document.getElementById('count-adults-val');
      const cVal = document.getElementById('count-children-val');
      const rVal = document.getElementById('count-rooms-val');
      if (aVal) aVal.textContent = adultsCount;
      if (cVal) cVal.textContent = childrenCount;
      if (rVal) rVal.textContent = roomsCount;
    };

    // Adults +/-
    const aMinus = document.getElementById('adults-minus');
    const aPlus = document.getElementById('adults-plus');
    if (aMinus) aMinus.addEventListener('click', (e) => { e.stopPropagation(); if (adultsCount > 1) { adultsCount--; updateGuestsDisplay(); } });
    if (aPlus) aPlus.addEventListener('click', (e) => { e.stopPropagation(); if (adultsCount < 8) { adultsCount++; updateGuestsDisplay(); } });

    // Children +/-
    const cMinus = document.getElementById('children-minus');
    const cPlus = document.getElementById('children-plus');
    if (cMinus) cMinus.addEventListener('click', (e) => { e.stopPropagation(); if (childrenCount > 0) { childrenCount--; updateGuestsDisplay(); } });
    if (cPlus) cPlus.addEventListener('click', (e) => { e.stopPropagation(); if (childrenCount < 6) { childrenCount++; updateGuestsDisplay(); } });

    // Rooms +/-
    const rMinus = document.getElementById('rooms-minus');
    const rPlus = document.getElementById('rooms-plus');
    if (rMinus) rMinus.addEventListener('click', (e) => { e.stopPropagation(); if (roomsCount > 1) { roomsCount--; updateGuestsDisplay(); } });
    if (rPlus) rPlus.addEventListener('click', (e) => { e.stopPropagation(); if (roomsCount < 5) { roomsCount++; updateGuestsDisplay(); } });

    const applyGuestsBtn = document.getElementById('apply-guests-btn');
    if (applyGuestsBtn) {
      applyGuestsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        guestsPopover.classList.add('hidden');
      });
    }
  }

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    if (destDropdown) destDropdown.classList.add('hidden');
    if (guestsPopover) guestsPopover.classList.add('hidden');
  });

  // Search Availability Action
  const searchBtn = document.getElementById('booking-search-submit');
  if (searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const destination = destLabel ? destLabel.textContent.trim() : 'Royal Orchid Bengaluru';
      const checkin = document.getElementById('booking-checkin')?.value || 'Tomorrow';
      const checkout = document.getElementById('booking-checkout')?.value || 'Next Day';
      const rateType = document.getElementById('booking-rate-type')?.value || 'rewards';

      openSearchResultsModal({
        destination,
        checkin,
        checkout,
        adults: adultsCount,
        rooms: roomsCount,
        rateType
      });
    });
  }
}

/* ==========================================================================
   7. Filter Tabs (Stays & Portfolio)
   ========================================================================== */
function initFilterTabs() {
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const cards = document.querySelectorAll('.hotel-portfolio-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Toggle active button style
      filterBtns.forEach((b) => {
        b.classList.remove('bg-brand-charcoal', 'text-white', 'border-brand-charcoal');
        b.classList.add('bg-white', 'text-text-secondary', 'border-border');
      });
      btn.classList.add('bg-brand-charcoal', 'text-white', 'border-brand-charcoal');
      btn.classList.remove('bg-white', 'text-text-secondary', 'border-border');

      const filterValue = btn.getAttribute('data-filter') || 'all';
      let visibleIdx = 0;

      cards.forEach((card) => {
        const category = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'block';
          card.classList.remove('card-delay-0', 'card-delay-100', 'card-delay-150', 'card-delay-200', 'card-delay-300', 'in-view');
          
          const delay = (visibleIdx % 3) * 120;
          if (delay === 120) card.classList.add('card-delay-150');
          else if (delay === 240) card.classList.add('card-delay-300');
          else card.classList.add('card-delay-0');
          visibleIdx++;

          setTimeout(() => {
            card.classList.add('in-view');
          }, 30);
        } else {
          card.classList.remove('in-view');
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* ==========================================================================
   8. Interactive Modals Engine
   ========================================================================== */
function initModals() {
  // Generic modal close handlers
  document.querySelectorAll('.modal-close-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop);
      }
    });
  });

  // Table Reservation Modal Triggers
  document.querySelectorAll('.open-dining-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const restaurantName = btn.getAttribute('data-restaurant') || 'Tiger Trail';
      const hotelName = btn.getAttribute('data-hotel') || 'Hotel Royal Orchid, Bengaluru';
      openDiningModal(restaurantName, hotelName);
    });
  });

  // Wedding / MICE RFP Lead Magnet Modal Triggers
  document.querySelectorAll('.open-rfp-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const eventType = btn.getAttribute('data-event-type') || 'Wedding';
      openRfpModal(eventType);
    });
  });

  // Regenta Rewards VIP Sign-in Modal Triggers
  document.querySelectorAll('.open-rewards-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openRewardsModal();
    });
  });

  // Best Rate Guarantee Claim Modal Triggers
  document.querySelectorAll('.open-brg-modal-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBrgModal();
    });
  });

  // Form Submissions with simulated CRM / RateGain pipeline
  const diningForm = document.getElementById('dining-reservation-form');
  if (diningForm) {
    diningForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('dining-modal'));
      showToast('Reservation Requested! Our restaurant captain will confirm via WhatsApp & SMS.', 'success');
      diningForm.reset();
    });
  }

  const rfpForm = document.getElementById('rfp-lead-form');
  if (rfpForm) {
    rfpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('rfp-modal'));
      showToast('Thank you! Your event inquiry is sent to our Banquet Director. Brochure download started!', 'success');
      rfpForm.reset();
    });
  }

  const rewardsForm = document.getElementById('rewards-login-form');
  if (rewardsForm) {
    rewardsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('rewards-modal'));
      showToast('Welcome to Regenta Rewards! Member Rate discounts (20% OFF) unlocked across all stays.', 'success');
      // Update UI to reflect member status
      document.querySelectorAll('.unlock-member-badge').forEach((el) => {
        el.textContent = 'MEMBER STATUS ACTIVE';
        el.classList.add('bg-emerald-600', 'text-white');
      });
    });
  }

  const brgForm = document.getElementById('brg-claim-form');
  if (brgForm) {
    brgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeModal(document.getElementById('brg-modal'));
      showToast('Best Rate Guarantee claim submitted. Our revenue auditor will respond within 4 business hours.', 'success');
      brgForm.reset();
    });
  }
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function openDiningModal(restaurantName, hotelName) {
  const modal = document.getElementById('dining-modal');
  const titleEl = document.getElementById('dining-modal-title');
  const hotelEl = document.getElementById('dining-modal-hotel');
  if (titleEl) titleEl.textContent = `Reserve a Table at ${restaurantName}`;
  if (hotelEl) hotelEl.textContent = hotelName;
  openModal(modal);
}

function openRfpModal(eventType) {
  const modal = document.getElementById('rfp-modal');
  const select = document.getElementById('rfp-event-type-select');
  if (select && eventType) {
    select.value = eventType;
  }
  openModal(modal);
}

function openRewardsModal() {
  const modal = document.getElementById('rewards-modal');
  openModal(modal);
}

function openBrgModal() {
  const modal = document.getElementById('brg-modal');
  openModal(modal);
}

/* Simulated Live Rate Query Modal */
function openSearchResultsModal(params) {
  const modal = document.getElementById('search-results-modal');
  const summaryEl = document.getElementById('search-modal-summary');
  const destEl = document.getElementById('search-modal-destination');

  if (destEl) destEl.textContent = params.destination;
  if (summaryEl) {
    summaryEl.textContent = `${params.checkin} → ${params.checkout} · ${params.adults} Adults · ${params.rooms} Room(s)`;
  }
  openModal(modal);
}

/* ==========================================================================
   9. Toast Notification Engine & Promo Copy
   ========================================================================== */
function initToastEngine() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Bind promo code buttons
  document.querySelectorAll('.copy-promo-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-code') || 'ROYAL20';
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Promo Code "${code}" copied to clipboard! Enjoy your exclusive member discount.`);
      }).catch(() => {
        showToast(`Promo Code: ${code} - Apply at checkout for extra savings!`);
      });
    });
  });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  const iconMarkup = type === 'success' 
    ? '<svg class="w-5 h-5 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>'
    : '<svg class="w-5 h-5 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';

  toast.innerHTML = `
    ${iconMarkup}
    <div class="text-sm font-medium">${message}</div>
    <button type="button" class="ml-auto text-neutral-400 hover:text-white">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger entrance
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('button').addEventListener('click', closeToast);
  setTimeout(closeToast, 4500);
}

/* ==========================================================================
   10. Scroll Entrance Animations (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  const elements = document.querySelectorAll(
    '.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-scale'
  );
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: '120px 0px 60px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   10b. Card Viewport Entrance Animations (Hemisphere Kinetic Stagger Engine)
   ========================================================================== */
function initCardViewportAnimations() {
  const cardSelectors = [
    // Stays & Hotel portfolio cards
    '#portfolio-grid > article',
    '.hotel-portfolio-card',
    '.hotel-card',
    '.property-item',
    // Dining cards
    '.dining-card',
    '#dining-grid > article',
    // Experience cards
    '.experience-card',
    'section .grid > a[href*="stays.html?type="]',
    // Room & Offer cards
    '.room-card',
    '.offer-card',
    '#rooms-grid > article',
    '#offers-grid > article',
    // Privileges & Tier cards
    '.privilege-card',
    '.tier-card',
    // Event cards & Grid child articles across all pages
    '.event-card',
    'main section .grid > article',
    'section .grid > article'
  ];

  const cardsSet = new Set();
  cardSelectors.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        if (el.closest('header') || el.closest('#preloader') || el.closest('#mobile-drawer') || el.closest('#booking-section')) return;
        cardsSet.add(el);
      });
    } catch (_) {}
  });

  const cards = Array.from(cardsSet);
  if (!cards.length) return;

  // Group cards by parent to compute column indices and staggered delays
  const parents = new Map();
  cards.forEach((card) => {
    const parent = card.parentElement || document.body;
    if (!parents.has(parent)) {
      parents.set(parent, []);
    }
    parents.get(parent).push(card);
  });

  parents.forEach((siblings) => {
    siblings.forEach((card, idx) => {
      card.classList.add('card-animate-viewport');
      card.classList.remove('card-delay-0', 'card-delay-100', 'card-delay-150', 'card-delay-200', 'card-delay-300');
      const delay = (idx % 3) * 120;
      if (delay === 120) card.classList.add('card-delay-150');
      else if (delay === 240) card.classList.add('card-delay-300');
      else card.classList.add('card-delay-0');
    });
  });

  // IntersectionObserver to trigger animation when cards enter the viewport
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '100px 0px 40px 0px' }
  );

  cards.forEach((card) => cardObserver.observe(card));
}

/* ==========================================================================
   11. Circular Aperture Transitions on Scroll
   ========================================================================== */
function initCircularTransitions() {
  const portals = document.querySelectorAll('.circular-portal');
  if (!portals.length) return;

  portals.forEach((p) => p.classList.add('portal-active'));
}

/* ==========================================================================
   12. Default Dates Initializer (Today + 1 day Check-in / Check-out)
   ========================================================================== */
function initDateDefaults() {
  const checkinInput = document.getElementById('booking-checkin');
  const checkoutInput = document.getElementById('booking-checkout');
  if (!checkinInput || !checkoutInput) return;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(today.getDate() + 2);

  const formatDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!checkinInput.value) checkinInput.value = formatDate(tomorrow);
  if (!checkoutInput.value) checkoutInput.value = formatDate(dayAfter);
  checkinInput.min = formatDate(today);
  checkoutInput.min = formatDate(tomorrow);

  checkinInput.addEventListener('change', () => {
    const cin = new Date(checkinInput.value);
    cin.setDate(cin.getDate() + 1);
    checkoutInput.min = formatDate(cin);
    if (new Date(checkoutInput.value) <= new Date(checkinInput.value)) {
      checkoutInput.value = formatDate(cin);
    }
  });
}
