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
  initDestinationsModal();

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
  const announcementBar = document.getElementById('top-announcement-bar');
  if (!header) return;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    const barHeight = (announcementBar && announcementBar.getBoundingClientRect().height > 0)
      ? announcementBar.offsetHeight
      : 0;

    if (scrollY >= barHeight || scrollY > 20) {
      header.classList.add('scrolled');
      header.style.top = '0px';
    } else {
      header.classList.remove('scrolled');
      header.style.top = Math.max(0, barHeight - scrollY) + 'px';
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
    timer = setInterval(nextSlide, 3500); // Auto-slide every 3.5 seconds
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

  // Hero Booking Form submission handler
  const heroForm = document.getElementById('hero-booking-form');
  if (heroForm) {
    heroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const destination = document.getElementById('booking-destination')?.value || 'Hotel Royal Orchid, Bengaluru';
      const checkin = document.getElementById('booking-checkin')?.value || 'Nov 22';
      const checkout = document.getElementById('booking-checkout')?.value || 'Nov 24';
      const guests = document.getElementById('booking-guests')?.value || '2';
      const promo = document.getElementById('booking-promo-code')?.value || '';
      const isMember = document.getElementById('member-discount-checkbox')?.checked;

      openSearchResultsModal({
        destination,
        checkin,
        checkout,
        adults: parseInt(guests, 10) || 2,
        rooms: 1,
        promo,
        isMember
      });
    });
  }

  // Promo Code Apply Button
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoInput = document.getElementById('booking-promo-code');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = promoInput.value.trim().toUpperCase();
      if (code) {
        showToast(`Promo Code "${code}" Applied! Instant discount of up to 25% unlocked.`, 'success');
        const chk = document.getElementById('member-discount-checkbox');
        if (chk) chk.checked = true;
      } else {
        showToast('Please enter a valid promo code (e.g. ROYALDIRECT or DIRECT15)');
      }
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
      const code = btn.getAttribute('data-code') || 'ROYALDIRECT';
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Promo Code "${code}" copied to clipboard! Instant discount unlocked.`, 'success');
        const promoInput = document.getElementById('booking-promo-code');
        if (promoInput) promoInput.value = code;
        const chk = document.getElementById('member-discount-checkbox');
        if (chk) chk.checked = true;
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

function closeMobileDrawer() {
  const drawer = document.getElementById('mobile-drawer');
  const panel = document.getElementById('mobile-drawer-panel');
  if (drawer && panel) {
    drawer.classList.remove('opacity-100');
    drawer.classList.add('opacity-0', 'pointer-events-none');
    panel.classList.remove('translate-x-0');
    panel.classList.add('translate-x-full');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   13. Mega Destinations & Hotel Directory (Matching royalorchidhotels.com)
   ========================================================================== */
function openDestinationsModal() {
  const modal = document.getElementById('destinations-modal');
  openModal(modal);
  setTimeout(() => {
    const searchInput = document.getElementById('mega-dest-search-input');
    if (searchInput) searchInput.focus();
  }, 150);
}

function initDestinationsModal() {
  const modal = document.getElementById('destinations-modal');
  if (!modal) return;

  const tabBtns = modal.querySelectorAll('.dest-tab-btn');
  const panes = modal.querySelectorAll('.dest-tab-pane');
  const searchResultsPane = document.getElementById('pane-search-results');
  const searchInput = document.getElementById('mega-dest-search-input');
  const clearBtn = document.getElementById('mega-dest-search-clear');

  // Tab switching
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach((b) => {
        b.classList.remove('active', 'border-brand-terracotta', 'text-brand-slate', 'bg-brand-terracotta/10');
        b.classList.add('border-transparent', 'text-text-muted');
      });
      btn.classList.add('active', 'border-brand-terracotta', 'text-brand-slate', 'bg-brand-terracotta/10');
      btn.classList.remove('border-transparent', 'text-text-muted');

      if (searchInput && searchInput.value.trim() !== '') {
        searchInput.value = '';
        if (clearBtn) clearBtn.classList.add('hidden');
        if (searchResultsPane) searchResultsPane.classList.add('hidden');
      }

      panes.forEach((p) => p.classList.add('hidden'));
      const activePane = document.getElementById(`pane-${targetTab}`);
      if (activePane) activePane.classList.remove('hidden');
    });
  });

  // Accordion toggle on '+' buttons
  modal.querySelectorAll('.dest-expand-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentGroup = btn.closest('.dest-city-group');
      if (!parentGroup) return;
      const accordion = parentGroup.querySelector('.dest-city-accordion');
      if (accordion) {
        const isClosed = accordion.classList.contains('hidden');
        if (isClosed) {
          accordion.classList.remove('hidden');
          btn.textContent = '−';
          btn.classList.add('text-brand-slate');
        } else {
          accordion.classList.add('hidden');
          btn.textContent = '+';
          btn.classList.remove('text-brand-slate');
        }
      }
    });
  });

  // 1-Click Selection: Clicking city opens its dedicated hotel page; clicking hotel selects it
  modal.addEventListener('click', (e) => {
    const selBtn = e.target.closest('.dest-select-btn');
    if (!selBtn) return;
    const selection = selBtn.getAttribute('data-selection') || '';
    const type = selBtn.getAttribute('data-type');
    const parentCity = selBtn.closest('.dest-city-group')?.getAttribute('data-city');

    if (type === 'city' || selection.includes('(All Properties)')) {
      // User clicked on a city or country (e.g. Ahmedabad, Bangalore, Goa, Jaipur, Nepal, Sri Lanka)
      let raw = parentCity || selection;
      let slug = raw.toLowerCase().replace(/\s*\(all properties\)/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      closeModal(modal);

      // If already on stays.html and renderCityView is available, update smoothly
      if (typeof window.renderCityView === 'function') {
        history.pushState(null, '', `stays.html?city=${slug}`);
        window.renderCityView(slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      window.location.href = `stays.html?city=${slug}`;
      return;
    }

    // User clicked on a specific hotel
    e.preventDefault();
    const bookingDest = document.getElementById('booking-destination');
    if (bookingDest) {
      bookingDest.value = selection;
      closeModal(modal);
      showToast(`Selected "${selection}". Direct rate unlocked!`, 'success');
      const bookingSec = document.getElementById('booking-section');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // On stays.html or other pages
      let slug = (parentCity || 'ahmedabad').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      closeModal(modal);
      if (typeof window.renderCityView === 'function') {
        history.pushState(null, '', `stays.html?city=${slug}`);
        window.renderCityView(slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (typeof window.openSearchResultsModal === 'function') {
            window.openSearchResultsModal({ destination: selection, checkin: 'Nov 22', checkout: 'Nov 24', adults: 2, rooms: 1 });
          }
        }, 300);
      } else {
        window.location.href = `stays.html?city=${slug}`;
      }
    }
  });

  // Live Instant Search across 72 cities + hotel names
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      if (clearBtn) {
        if (query.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
      }

      if (query.length === 0) {
        if (searchResultsPane) searchResultsPane.classList.add('hidden');
        const activeTab = modal.querySelector('.dest-tab-btn.active')?.getAttribute('data-tab') || 'our-hotels';
        const activePane = document.getElementById(`pane-${activeTab}`);
        if (activePane) activePane.classList.remove('hidden');
        return;
      }

      panes.forEach((p) => p.classList.add('hidden'));
      if (searchResultsPane) searchResultsPane.classList.remove('hidden');

      const resultsGrid = document.getElementById('search-results-grid');
      const countEl = document.getElementById('search-result-count');
      if (!resultsGrid) return;

      const matches = [];
      modal.querySelectorAll('#pane-our-hotels .dest-city-group, #pane-intl-hotels .dest-city-group').forEach((group) => {
        const city = group.getAttribute('data-city') || '';
        const cityName = group.querySelector('.dest-select-btn[data-type="city"]')?.textContent.trim() || city;
        
        let cityMatched = city.includes(query);
        const matchedHotels = [];

        group.querySelectorAll('.dest-select-btn[data-type="hotel"]').forEach((hBtn) => {
          const hName = hBtn.getAttribute('data-selection') || hBtn.textContent.trim();
          if (hName.toLowerCase().includes(query)) {
            matchedHotels.push(hName);
          }
        });

        if (cityMatched || matchedHotels.length > 0) {
          matches.push({
            city: cityName,
            cityMatched,
            hotels: matchedHotels
          });
        }
      });

      if (countEl) countEl.textContent = `${matches.length} matching destinations found`;
      resultsGrid.innerHTML = '';

      if (matches.length === 0) {
        resultsGrid.innerHTML = `
          <div class="col-span-full py-8 text-center text-text-muted">
            <p class="font-medium text-sm">No properties found matching "${query}"</p>
            <p class="text-xs mt-1">Try searching by city (e.g. Bangalore, Goa, Jaipur) or hotel name.</p>
          </div>
        `;
        return;
      }

      matches.forEach((m) => {
        const card = document.createElement('div');
        card.className = 'p-3 rounded-lg border border-border bg-surface-subtle hover:border-brand-terracotta hover:bg-white transition-all text-xs';
        let hotelsHtml = '';
        if (m.hotels.length > 0) {
          hotelsHtml = `
            <div class="mt-2 pt-2 border-t border-border-subtle space-y-1">
              ${m.hotels.map(h => `
                <button type="button" class="dest-select-btn block w-full text-left text-[11px] font-medium text-brand-slate hover:text-brand-terracotta py-0.5 truncate" data-selection="${h}">
                  • ${h}
                </button>
              `).join('')}
            </div>
          `;
        }

        card.innerHTML = `
          <div class="flex items-center justify-between">
            <button type="button" class="dest-select-btn text-xs font-bold text-text-primary hover:text-brand-terracotta text-left" data-selection="${m.city} (All Properties)">
              📍 ${m.city}
            </button>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-brand-slate/10 text-brand-slate font-semibold">City</span>
          </div>
          ${hotelsHtml}
        `;
        resultsGrid.appendChild(card);
      });
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.classList.add('hidden');
        if (searchResultsPane) searchResultsPane.classList.add('hidden');
        const activeTab = modal.querySelector('.dest-tab-btn.active')?.getAttribute('data-tab') || 'our-hotels';
        const activePane = document.getElementById(`pane-${activeTab}`);
        if (activePane) activePane.classList.remove('hidden');
        searchInput.focus();
      });
    }
  }
}


/* ========================================================
   CORPORATE MODAL SYSTEM (About Us, Investors, Team, Careers, Feedback, Media, Contact)
   ======================================================== */
const CORPORATE_INFO = {
  about: {
    badge: 'Our Heritage · Since 1973',
    title: 'About Royal Orchid & Regenta Hotels',
    subtitle: 'Over 5 Decades of Heartfelt Indian Hospitality & Global Standards',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p>
          Founded in 1973 by hospitality visionary <strong>Mr. Chander K. Baljee</strong>, Royal Orchid & Regenta Hotels has grown from a single flagship property into one of India’s most respected and rapidly expanding hospitality groups, operating over <strong>100+ hotels across 74 destinations</strong> in India, Nepal, and Sri Lanka.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div class="p-3 rounded-lg bg-surface-subtle border border-border text-center">
            <div class="text-xl sm:text-2xl font-serif font-bold text-brand-slate">100+</div>
            <div class="text-[10px] uppercase font-semibold text-text-muted mt-0.5">Hotels & Resorts</div>
          </div>
          <div class="p-3 rounded-lg bg-surface-subtle border border-border text-center">
            <div class="text-xl sm:text-2xl font-serif font-bold text-brand-slate">74</div>
            <div class="text-[10px] uppercase font-semibold text-text-muted mt-0.5">Destinations</div>
          </div>
          <div class="p-3 rounded-lg bg-surface-subtle border border-border text-center">
            <div class="text-xl sm:text-2xl font-serif font-bold text-brand-slate">1973</div>
            <div class="text-[10px] uppercase font-semibold text-text-muted mt-0.5">Established</div>
          </div>
          <div class="p-3 rounded-lg bg-surface-subtle border border-border text-center">
            <div class="text-xl sm:text-2xl font-serif font-bold text-brand-slate">5,000+</div>
            <div class="text-[10px] uppercase font-semibold text-text-muted mt-0.5">Keys Nationwide</div>
          </div>
        </div>
        <h4 class="font-serif text-base font-bold text-brand-slate pt-2">Our Philosophy: Warmth with Clarity</h4>
        <p>
          Rooted in the timeless Indian tradition of <em>'Atithi Devo Bhava'</em> (Guest is God), we balance intuitive warmth and culinary mastery with modern efficiency, state-of-the-art tech corridors, and prime commercial access.
        </p>
        <h4 class="font-serif text-base font-bold text-brand-slate pt-2">Brand Portfolio</h4>
        <p>
          Our family of brands spans luxury palaces, five-star business flagships, boutique hotels, scenic eco-resorts, and long-stay executive suites: <strong>Hotel Royal Orchid, Royal Orchid Resorts, Crestoria, Iconiqa, Royal Orchid Central, Royal Orchid Suites, Regenta, Regenta Resorts, Regenta Central, Regenta Suites, Regenta Place, and Regenta Inn</strong>.
        </p>
      </div>
    `
  },
  investors: {
    badge: 'Investor Relations · BSE / NSE Listed',
    title: 'Investor Relations & Financial Disclosures',
    subtitle: 'Royal Orchid Hotels Limited (ROHLTD · BSE: 532699 · NSE: ROHLTD)',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <div class="p-3 bg-brand-slate/5 border border-brand-slate/15 rounded-lg flex flex-wrap items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-text-muted">Stock Exchange Tickers</span>
            <div class="font-serif text-lg font-bold text-brand-slate">BSE: 532699 | NSE: ROHLTD</div>
          </div>
          <button type="button" onclick="showToast('Downloading Latest Investor Presentation (Q3 FY26)...', 'success')" class="px-3 py-1.5 rounded bg-brand-terracotta text-white text-xs font-bold hover:bg-brand-gold-rich transition-colors">
            Download Presentation (PDF)
          </button>
        </div>
        <h4 class="font-serif text-base font-bold text-brand-slate pt-2">Financial Disclosures & Reports</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors flex items-center justify-between cursor-pointer" onclick="showToast('Opening Q3 FY26 Financial Statement...')">
            <div>
              <div class="font-bold text-brand-slate">Q3 FY26 Financial Results</div>
              <div class="text-[11px] text-text-muted">Unaudited Standalone & Consolidated</div>
            </div>
            <i data-lucide="download" class="w-4 h-4 text-brand-terracotta"></i>
          </div>
          <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors flex items-center justify-between cursor-pointer" onclick="showToast('Opening Annual Report 2024-25...')">
            <div>
              <div class="font-bold text-brand-slate">Annual Report 2024–25</div>
              <div class="text-[11px] text-text-muted">Integrated Governance & ESG Report</div>
            </div>
            <i data-lucide="download" class="w-4 h-4 text-brand-terracotta"></i>
          </div>
          <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors flex items-center justify-between cursor-pointer" onclick="showToast('Opening Shareholding Pattern...')">
            <div>
              <div class="font-bold text-brand-slate">Shareholding Pattern</div>
              <div class="text-[11px] text-text-muted">Quarter ended December 31, 2025</div>
            </div>
            <i data-lucide="download" class="w-4 h-4 text-brand-terracotta"></i>
          </div>
          <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors flex items-center justify-between cursor-pointer" onclick="showToast('Opening Corporate Governance Report...')">
            <div>
              <div class="font-bold text-brand-slate">Corporate Governance</div>
              <div class="text-[11px] text-text-muted">Board Committees & Charters</div>
            </div>
            <i data-lucide="download" class="w-4 h-4 text-brand-terracotta"></i>
          </div>
        </div>
        <div class="p-3 bg-surface-subtle border border-border rounded text-xs text-text-muted">
          <strong>Registrar & Share Transfer Agent:</strong> Link Intime India Pvt. Ltd., C-101, 247 Park, LBS Marg, Vikhroli (West), Mumbai - 400083. Compliance Officer: <a href="mailto:investors@royalorchidhotels.com" class="text-brand-terracotta hover:underline font-bold">investors@royalorchidhotels.com</a>
        </div>
      </div>
    `
  },
  team: {
    badge: 'Executive Leadership · Board of Directors',
    title: 'Our Leadership Team',
    subtitle: 'Steering Five Decades of Hospitality Innovation & Growth',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <div class="p-4 rounded-xl bg-surface-subtle border border-border flex flex-col sm:flex-row gap-4 items-center sm:items-start">
          <div class="w-20 h-20 rounded-full bg-brand-slate text-brand-brass flex items-center justify-center font-serif text-2xl font-bold shrink-0">
            CKB
          </div>
          <div>
            <h4 class="font-serif text-lg font-bold text-brand-slate">Mr. Chander K. Baljee</h4>
            <div class="text-xs font-semibold text-brand-terracotta">Chairman & Managing Director</div>
            <p class="text-xs text-text-muted mt-2 leading-relaxed">
              An alumnus of IIM Ahmedabad, Mr. Baljee founded the Royal Orchid Group in 1973 with a vision to create world-class Indian hospitality. With over 50 years of industry leadership, he spearheads the group’s vision, expansion into 74+ cities, and commitment to sustainable growth.
            </p>
          </div>
        </div>
        <h4 class="font-serif text-base font-bold text-brand-slate pt-2">Key Management Personnel</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-3 rounded border border-border">
            <div class="font-bold text-brand-slate">Amit Jaiswal</div>
            <div class="text-xs text-brand-terracotta font-semibold">Chief Financial Officer</div>
            <div class="text-[11px] text-text-muted mt-1">Directs global capital structure, investor relations, and financial reporting.</div>
          </div>
          <div class="p-3 rounded border border-border">
            <div class="font-bold text-brand-slate">Philip Logan</div>
            <div class="text-xs text-brand-terracotta font-semibold">Chief Operating Officer</div>
            <div class="text-[11px] text-text-muted mt-1">Oversees hotel operations, brand standards, guest satisfaction, and digital hospitality.</div>
          </div>
          <div class="p-3 rounded border border-border">
            <div class="font-bold text-brand-slate">Ranabir Sanyal</div>
            <div class="text-xs text-brand-terracotta font-semibold">Company Secretary & Compliance Officer</div>
            <div class="text-[11px] text-text-muted mt-1">Leads corporate governance, statutory compliance, and secretarial audits.</div>
          </div>
          <div class="p-3 rounded border border-border">
            <div class="font-bold text-brand-slate">Vikas Passi</div>
            <div class="text-xs text-brand-terracotta font-semibold">Vice President — Operations & Growth</div>
            <div class="text-[11px] text-text-muted mt-1">Manages national franchise partnerships, management contracts, and pipeline rollouts.</div>
          </div>
        </div>
      </div>
    `
  },
  careers: {
    badge: 'Careers & Opportunities · People First',
    title: 'Careers at Royal Orchid & Regenta',
    subtitle: 'Build an Inspiring Career with India’s Fastest Growing Hospitality Brand',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p>
          At Royal Orchid Hotels, we believe that true hospitality begins with the people who create it. With 100+ properties across India, Nepal, and Sri Lanka, we provide dynamic growth pathways, competitive packages, and leadership development.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
          <div class="p-3 rounded bg-surface-subtle border border-border text-center">
            <i data-lucide="utensils" class="w-5 h-5 mx-auto text-brand-terracotta mb-1"></i>
            <div class="font-bold text-brand-slate text-xs">Food & Beverage</div>
            <div class="text-[10px] text-text-muted">Master Chefs & Service</div>
          </div>
          <div class="p-3 rounded bg-surface-subtle border border-border text-center">
            <i data-lucide="concierge-bell" class="w-5 h-5 mx-auto text-brand-terracotta mb-1"></i>
            <div class="font-bold text-brand-slate text-xs">Front Office</div>
            <div class="text-[10px] text-text-muted">Guest Relations & Concierge</div>
          </div>
          <div class="p-3 rounded bg-surface-subtle border border-border text-center">
            <i data-lucide="sparkles" class="w-5 h-5 mx-auto text-brand-terracotta mb-1"></i>
            <div class="font-bold text-brand-slate text-xs">Housekeeping</div>
            <div class="text-[10px] text-text-muted">Luxury Facility Care</div>
          </div>
          <div class="p-3 rounded bg-surface-subtle border border-border text-center">
            <i data-lucide="briefcase" class="w-5 h-5 mx-auto text-brand-terracotta mb-1"></i>
            <div class="font-bold text-brand-slate text-xs">Sales & Revenue</div>
            <div class="text-[10px] text-text-muted">Corporate & MICE Growth</div>
          </div>
          <div class="p-3 rounded bg-surface-subtle border border-border text-center">
            <i data-lucide="settings" class="w-5 h-5 mx-auto text-brand-terracotta mb-1"></i>
            <div class="font-bold text-brand-slate text-xs">Engineering</div>
            <div class="text-[10px] text-text-muted">Property Maintenance</div>
          </div>
          <div class="p-3 rounded bg-surface-subtle border border-border text-center">
            <i data-lucide="award" class="w-5 h-5 mx-auto text-brand-terracotta mb-1"></i>
            <div class="font-bold text-brand-slate text-xs">General Management</div>
            <div class="text-[10px] text-text-muted">Hotel Leadership Track</div>
          </div>
        </div>
        <div class="p-4 rounded-lg bg-surface border border-border space-y-3">
          <div class="font-bold text-brand-slate">Submit Your Resume for Open Positions</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="text" id="career-name" placeholder="Full Name" class="p-2 border border-border rounded text-xs" />
            <input type="email" id="career-email" placeholder="Email Address" class="p-2 border border-border rounded text-xs" />
            <input type="tel" id="career-phone" placeholder="Phone Number" class="p-2 border border-border rounded text-xs" />
            <select id="career-dept" class="p-2 border border-border rounded text-xs">
              <option value="">Preferred Department</option>
              <option value="fb">Food & Beverage / Culinary</option>
              <option value="fo">Front Office / Guest Relations</option>
              <option value="hk">Housekeeping</option>
              <option value="sales">Sales & Corporate Travel</option>
              <option value="mgmt">Hotel General Management</option>
            </select>
          </div>
          <button type="button" onclick="showToast('Application submitted successfully! Our Talent Acquisition team will connect within 48 hours.', 'success'); closeCorporateModal();" class="w-full py-2 bg-brand-terracotta hover:bg-brand-gold-rich text-white font-bold text-xs uppercase tracking-wider rounded transition-colors">
            Submit Application
          </button>
        </div>
      </div>
    `
  },
  feedback: {
    badge: 'Guest Experience · We Value Your Voice',
    title: 'Guest Feedback & Review',
    subtitle: 'Help Us Perfect Every Detail of Your Stay',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p>Your comfort and satisfaction are our highest priorities. Please take a moment to share your recent experience with our team.</p>
        <div class="space-y-3 p-4 rounded-xl bg-surface-subtle border border-border">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] font-bold text-brand-slate mb-1">Hotel Visited</label>
              <input type="text" id="fb-hotel" placeholder="e.g. Z By Regenta Ahmedabad" class="w-full p-2 border border-border rounded text-xs bg-white" />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-brand-slate mb-1">Date of Stay</label>
              <input type="date" id="fb-date" class="w-full p-2 border border-border rounded text-xs bg-white" />
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-brand-slate mb-1">Rate Your Overall Experience</label>
            <div class="flex gap-2 text-amber-500 text-lg cursor-pointer select-none">
              <span onclick="this.parentElement.setAttribute('data-stars', '1'); showToast('Rated 1 Star')">★</span>
              <span onclick="this.parentElement.setAttribute('data-stars', '2'); showToast('Rated 2 Stars')">★</span>
              <span onclick="this.parentElement.setAttribute('data-stars', '3'); showToast('Rated 3 Stars')">★</span>
              <span onclick="this.parentElement.setAttribute('data-stars', '4'); showToast('Rated 4 Stars')">★</span>
              <span onclick="this.parentElement.setAttribute('data-stars', '5'); showToast('Rated 5 Stars (Exceptional)')">★</span>
            </div>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-brand-slate mb-1">Your Comments & Suggestions</label>
            <textarea id="fb-comments" rows="3" placeholder="Tell us about the hospitality, room comfort, dining, or staff assistance..." class="w-full p-2 border border-border rounded text-xs bg-white"></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input type="text" id="fb-guest-name" placeholder="Your Name" class="p-2 border border-border rounded text-xs bg-white" />
            <input type="email" id="fb-guest-email" placeholder="Email / Phone" class="p-2 border border-border rounded text-xs bg-white" />
          </div>
          <button type="button" onclick="showToast('Thank you for your valuable feedback! We appreciate your care.', 'success'); closeCorporateModal();" class="w-full py-2 bg-brand-terracotta hover:bg-brand-gold-rich text-white font-bold text-xs uppercase tracking-wider rounded transition-colors">
            Submit Feedback
          </button>
        </div>
      </div>
    `
  },
  media: {
    badge: 'Press & Media Centre',
    title: 'Media Releases & Brand Assets',
    subtitle: 'Official Press Statements, Brand Kits, and Accreditations',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p>For press inquiries, editorial photography, and official management interviews, contact our Corporate Communications Bureau.</p>
        <div class="p-3 bg-brand-slate/5 border border-brand-slate/15 rounded-lg flex items-center justify-between">
          <div>
            <div class="text-[10px] uppercase font-bold text-text-muted">Press Bureau Contact</div>
            <div class="font-bold text-brand-slate">pr@royalorchidhotels.com</div>
          </div>
          <button type="button" onclick="showToast('Downloading Official Media Kit & High-Res Logos...', 'success')" class="px-3 py-1.5 rounded bg-brand-terracotta text-white text-xs font-bold hover:bg-brand-gold-rich">
            Download Brand Kit
          </button>
        </div>
        <h4 class="font-serif text-base font-bold text-brand-slate pt-2">Recent Announcements</h4>
        <div class="space-y-2">
          <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors">
            <span class="text-[10px] text-brand-terracotta font-bold uppercase">November 2026</span>
            <div class="font-bold text-brand-slate text-xs sm:text-sm">Royal Orchid Group Expands Gujarat Footprint with 5 Premier Properties in Ahmedabad</div>
          </div>
          <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors">
            <span class="text-[10px] text-brand-terracotta font-bold uppercase">October 2026</span>
            <div class="font-bold text-brand-slate text-xs sm:text-sm">International Expansion: Regenta Resort & Spa Opens on Narayani Riverfront, Chitwan, Nepal</div>
          </div>
        </div>
      </div>
    `
  },
  contact: {
    badge: 'Central Reservations & Corporate Office',
    title: 'Contact Royal Orchid & Regenta',
    subtitle: '24/7 Dedicated Guest Care and Regional Offices',
    content: `
      <div class="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="p-4 rounded-xl bg-surface-subtle border border-border">
            <div class="flex items-center gap-2 text-brand-terracotta font-bold text-xs uppercase mb-1">
              <i data-lucide="phone-call" class="w-4 h-4"></i>
              <span>24/7 Central Reservations</span>
            </div>
            <div class="font-serif text-lg font-bold text-brand-slate">+91 80 4178 3000</div>
            <div class="font-serif text-lg font-bold text-brand-slate">+91 7711000222</div>
            <div class="text-[11px] text-text-muted mt-2">reservations@royalorchidhotels.com</div>
          </div>
          <div class="p-4 rounded-xl bg-surface-subtle border border-border">
            <div class="flex items-center gap-2 text-brand-terracotta font-bold text-xs uppercase mb-1">
              <i data-lucide="building-2" class="w-4 h-4"></i>
              <span>Corporate Headquarters</span>
            </div>
            <div class="font-bold text-brand-slate text-xs">Royal Orchid Hotels Limited</div>
            <div class="text-[11px] text-text-muted mt-1 leading-relaxed">
              No. 1, Golf Avenue, Adjoining KGA Golf Course, HAL Airport Road, Kodihalli, Bengaluru, Karnataka - 560008, India.
            </div>
          </div>
        </div>
        <div class="p-3 rounded border border-border">
          <div class="font-bold text-brand-slate text-xs mb-1">Regional Sales Offices</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-text-muted">
            <div><strong>Mumbai:</strong> +91 22 2673 0000</div>
            <div><strong>New Delhi:</strong> +91 11 4151 0000</div>
            <div><strong>Kolkata:</strong> +91 33 2289 0000</div>
            <div><strong>Ahmedabad:</strong> +91 79 4000 0000</div>
          </div>
        </div>
      </div>
    `
  },
  terms: {
    badge: 'Legal & Policies',
    title: 'Terms & Conditions',
    subtitle: 'Standard Booking, Tariff, and Stay Policies',
    content: `
      <div class="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p><strong>1. Check-In & Check-Out:</strong> Standard check-in time is 14:00 hrs and check-out is 12:00 hrs noon. Early check-in or late check-out is subject to availability and may incur supplemental charges.</p>
        <p><strong>2. Identification:</strong> As per Government of India regulations, all guests aged 18 and above must present valid government-approved photo ID with address (Aadhaar Card, Passport, Voter ID, Driving Licence) upon check-in. PAN cards are not accepted.</p>
        <p><strong>3. Cancellation Policy:</strong> Guaranteed direct bookings on our official portal offer flexible cancellation up to 24-48 hours prior to arrival, subject to specific rate plans.</p>
        <p><strong>4. Best Rate Guarantee:</strong> If an identical booking is found publicly on an authorized OTA at a lower rate within 24 hours of booking, we match the rate and provide an additional 10% discount.</p>
      </div>
    `
  },
  privacy: {
    badge: 'Privacy & Cookie Protection',
    title: 'Privacy Policy & Data Security',
    subtitle: 'Commitment to Guest Data Protection & Confidentiality',
    content: `
      <div class="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p>Royal Orchid Hotels Limited is dedicated to safeguarding guest confidentiality. We employ 256-bit SSL encryption for all booking transactions.</p>
        <p><strong>Information Collected:</strong> Contact details, passport/ID details for statutory police registration, dietary preferences, and billing information are collected strictly to execute your reservation.</p>
        <p><strong>Data Sharing:</strong> We do not sell or rent guest personal data to unauthorized third parties. For data inquiries, email <a href="mailto:privacy@royalorchidhotels.com" class="text-brand-terracotta font-bold">privacy@royalorchidhotels.com</a>.</p>
      </div>
    `
  },
  blog: {
    badge: 'Royal Orchid Journal · Travel & Hospitality',
    title: 'The Royal Orchid Journal',
    subtitle: 'Curated Stories, Culinary Traditions & Destination Guides',
    content: `
      <div class="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors cursor-pointer" onclick="showToast('Opening article: 48 Hours in Ahmedabad...')">
          <span class="text-[10px] text-brand-terracotta font-bold uppercase">City Guide</span>
          <div class="font-bold text-brand-slate text-sm">48 Hours in Ahmedabad: Heritage Walks, Sabarmati Riverfront & Culinary Gems</div>
          <div class="text-[11px] text-text-muted mt-1">From Vastrapur Lake to the bustling streets of Manek Chowk and boutique stays at Regenta Central.</div>
        </div>
        <div class="p-3 rounded border border-border hover:border-brand-terracotta transition-colors cursor-pointer" onclick="showToast('Opening article: The Legacy of Tiger Trail...')">
          <span class="text-[10px] text-brand-terracotta font-bold uppercase">Culinary Heritage</span>
          <div class="font-bold text-brand-slate text-sm">The Legacy of Tiger Trail: Five Decades of Authentic Frontier Flavours</div>
          <div class="text-[11px] text-text-muted mt-1">Discover the slow-cooked charcoal gravies and rustic clay tandoor recipes perfected since 1973.</div>
        </div>
      </div>
    `
  },
  sitemap: {
    badge: 'Directory & Navigation',
    title: 'Website Sitemap',
    subtitle: 'Quick Directory of All 74 Destinations & Brand Portals',
    content: `
      <div class="space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div><a href="index.html" class="font-bold text-brand-slate hover:text-brand-terracotta">Home Page</a></div>
          <div><a href="stays.html" class="font-bold text-brand-slate hover:text-brand-terracotta">Stays & Resorts</a></div>
          <div><a href="stays.html?city=ahmedabad" class="font-bold text-brand-slate hover:text-brand-terracotta">Ahmedabad Hotels</a></div>
          <div><a href="stays.html?city=bangalore" class="font-bold text-brand-slate hover:text-brand-terracotta">Bangalore Hotels</a></div>
          <div><a href="stays.html?city=goa" class="font-bold text-brand-slate hover:text-brand-terracotta">Goa Resorts</a></div>
          <div><a href="stays.html?city=jaipur" class="font-bold text-brand-slate hover:text-brand-terracotta">Jaipur Hotels</a></div>
          <div><a href="stays.html?city=nepal" class="font-bold text-brand-slate hover:text-brand-terracotta">Nepal Properties</a></div>
          <div><a href="stays.html?city=sri-lanka" class="font-bold text-brand-slate hover:text-brand-terracotta">Sri Lanka Properties</a></div>
          <div><a href="dining.html" class="font-bold text-brand-slate hover:text-brand-terracotta">Tiger Trail & Dining</a></div>
          <div><a href="events.html" class="font-bold text-brand-slate hover:text-brand-terracotta">Weddings & Banquets</a></div>
          <div><a href="offers.html" class="font-bold text-brand-slate hover:text-brand-terracotta">Exclusive Offers</a></div>
          <div><a href="partner.html" class="font-bold text-brand-slate hover:text-brand-terracotta">Partner With Us</a></div>
        </div>
      </div>
    `
  }
};

function openCorporateModal(topic) {
  const modal = document.getElementById('corporate-info-modal');
  if (!modal) return;
  const data = CORPORATE_INFO[topic] || CORPORATE_INFO['about'];
  
  const badgeEl = document.getElementById('corp-modal-badge');
  const titleEl = document.getElementById('corp-modal-title');
  const subtitleEl = document.getElementById('corp-modal-subtitle');
  const contentEl = document.getElementById('corp-modal-content');

  if (badgeEl) badgeEl.textContent = data.badge;
  if (titleEl) titleEl.textContent = data.title;
  if (subtitleEl) subtitleEl.textContent = data.subtitle;
  if (contentEl) contentEl.innerHTML = data.content;

  openModal(modal);
  if (window.lucide) window.lucide.createIcons();
}

function closeCorporateModal() {
  const modal = document.getElementById('corporate-info-modal');
  closeModal(modal);
}

// Auto-open modal if URL hash or search param matches corporate topic
document.addEventListener('DOMContentLoaded', () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const infoParam = urlParams.get('info');
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (infoParam && typeof CORPORATE_INFO !== 'undefined' && CORPORATE_INFO[infoParam]) {
      setTimeout(() => openCorporateModal(infoParam), 400);
    } else if (hash && typeof CORPORATE_INFO !== 'undefined' && CORPORATE_INFO[hash]) {
      setTimeout(() => openCorporateModal(hash), 400);
    }
  } catch (e) {}
});

window.openCorporateModal = openCorporateModal;
window.closeCorporateModal = closeCorporateModal;



// ============================================================================
// HOTEL OVERVIEW & DETAILED MODAL SYSTEM (Matching royalorchidhotels.com)
// ============================================================================

let currentHotelData = null;

function findHotelById(hotelId) {
  if (!hotelId) return null;
  const cleanId = String(hotelId).toLowerCase().trim();
  if (typeof ROYAL_CITIES_DB === 'undefined') return null;

  for (const citySlug in ROYAL_CITIES_DB) {
    const city = ROYAL_CITIES_DB[citySlug];
    if (city && city.hotels) {
      for (const h of city.hotels) {
        if (
          h.id === cleanId || 
          h.name.toLowerCase() === cleanId ||
          cleanId.includes(h.id) ||
          h.id.includes(cleanId) ||
          cleanId.replace(/-/g, ' ').includes(h.name.toLowerCase()) ||
          h.name.toLowerCase().includes(cleanId.replace(/-/g, ' '))
        ) {
          return h;
        }
      }
    }
  }
  return null;
}

function openHotelOverviewModal(hotelId) {
  const hotel = findHotelById(hotelId);
  if (!hotel) {
    showToast('Viewing hotel information and live direct privileges.', 'info');
    return;
  }
  currentHotelData = hotel;

  const modal = document.getElementById('hotel-overview-modal');
  if (!modal) return;

  // Header
  const nameEl = document.getElementById('hom-hotel-name');
  if (nameEl) nameEl.textContent = hotel.name;
  
  const addrEl = document.getElementById('hom-address-text');
  if (addrEl) addrEl.textContent = hotel.address;

  const phoneEl = document.getElementById('hom-phone-text');
  if (phoneEl) phoneEl.textContent = hotel.phone || '+91 80 4178 3000';

  const phoneLink = document.getElementById('hom-phone-link');
  if (phoneLink) phoneLink.href = 'tel:' + (hotel.phone ? hotel.phone.replace(/[^+\d]/g, '') : '+918041783000');

  const ratingEl = document.getElementById('hom-rating-badge');
  if (ratingEl) ratingEl.textContent = (hotel.rating || '4.6') + ' ★';

  const reviewsEl = document.getElementById('hom-reviews-count');
  if (reviewsEl) reviewsEl.textContent = '(' + (hotel.reviews || '450') + ' Verified Reviews)';

  const transitEl = document.getElementById('hom-transit-badge');
  if (transitEl) transitEl.textContent = hotel.transit;

  // Brand Badge
  const brandBadge = document.getElementById('hom-brand-badge');
  if (brandBadge) {
    const lowerName = hotel.name.toLowerCase();
    if (lowerName.includes('resort')) brandBadge.textContent = 'REGENTA RESORTS';
    else if (lowerName.includes('place')) brandBadge.textContent = 'REGENTA PLACE';
    else if (lowerName.includes('inn')) brandBadge.textContent = 'REGENTA INN';
    else if (lowerName.includes('royal orchid')) brandBadge.textContent = 'HOTEL ROYAL ORCHID';
    else if (lowerName.includes('central')) brandBadge.textContent = 'REGENTA CENTRAL';
    else brandBadge.textContent = 'REGENTA HOTELS';
  }

  // Hero Image & Thumbnails
  const gallery = (hotel.gallery && hotel.gallery.length) ? hotel.gallery : [hotel.image || 'images/hero/19_49_2026_10_49_13banner1.jpg'];
  const heroImg = document.getElementById('hom-hero-image');
  if (heroImg) heroImg.src = gallery[0];

  const counter = document.getElementById('hom-gallery-counter');
  if (counter) counter.textContent = `Photo 1 of ${gallery.length}`;

  const thumbsContainer = document.getElementById('hom-thumbnails');
  if (thumbsContainer) {
    thumbsContainer.innerHTML = gallery.map((imgUrl, idx) => `
      <button type="button" onclick="setHeroPhoto('${imgUrl}', ${idx + 1}, ${gallery.length}, this)" class="hom-thumb-btn w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 ${idx === 0 ? 'border-brand-terracotta' : 'border-transparent'} hover:opacity-100 transition-all opacity-80 cursor-pointer">
        <img src="${imgUrl}" alt="Photo ${idx+1}" class="w-full h-full object-cover" onerror="this.src='images/hero/19_49_2026_10_49_13banner1.jpg'" />
      </button>
    `).join('');
  }

  // Overview Tab text
  const descEl = document.getElementById('hom-full-description');
  if (descEl) descEl.textContent = hotel.description;

  // Rooms Tab
  const roomsContainer = document.getElementById('hom-rooms-container');
  if (roomsContainer) {
    const roomsList = hotel.roomsList || [
      {
        name: "Deluxe Room",
        size: "280 sq.ft",
        bed: "King or Twin Bed",
        image: gallery[0],
        description: "Contemporary and thoughtfully designed with plush bedding, high-speed Wi-Fi, 43-inch Smart TV, ergonomic work desk, and luxury bath amenities.",
        price: hotel.price,
        memberPrice: hotel.memberPrice
      }
    ];
    roomsContainer.innerHTML = roomsList.map(r => `
      <div class="p-4 sm:p-5 rounded-xl border border-border bg-white flex flex-col md:flex-row gap-5 items-start">
        <div class="w-full md:w-56 h-44 rounded-lg overflow-hidden shrink-0 bg-surface-subtle">
          <img src="${r.image || gallery[0]}" alt="${r.name}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onerror="this.src='images/hero/19_49_2026_10_49_13banner1.jpg'" />
        </div>
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-surface-subtle border border-border text-[10px] font-bold text-brand-slate uppercase">${r.size}</span>
            <span class="px-2 py-0.5 rounded bg-surface-subtle border border-border text-[10px] font-bold text-text-muted">• ${r.bed}</span>
          </div>
          <h5 class="font-serif text-lg sm:text-xl font-normal text-text-primary">${r.name}</h5>
          <p class="text-xs text-text-secondary leading-relaxed">${r.description}</p>
          <div class="flex flex-wrap gap-1.5 pt-1 text-[11px] text-text-muted">
            <span>✓ High-Speed Wi-Fi</span>
            <span>✓ 43" Smart TV</span>
            <span>✓ Tea/Coffee Maker</span>
            <span>✓ Rain Shower</span>
            <span>✓ Electronic Safe</span>
          </div>
        </div>
        <div class="w-full md:w-48 shrink-0 flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
          <div>
            <div class="text-[10px] uppercase font-bold text-text-muted">Tariff</div>
            <div class="text-lg font-bold text-brand-slate">₹${r.price} <span class="text-xs font-normal text-text-muted">/ night</span></div>
            <div class="text-[11px] text-brand-terracotta font-bold">Member: ₹${r.memberPrice}</div>
          </div>
          <button type="button" onclick="closeHotelOverviewModal(); openSearchResultsModal({ destination: '${hotel.name} - ${r.name}', checkin: 'Nov 22', checkout: 'Nov 24', adults: 2, rooms: 1 });" class="mt-3 w-full px-4 py-2 bg-brand-terracotta hover:bg-brand-gold-rich text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow cursor-pointer">
            Reserve Room
          </button>
        </div>
      </div>
    `).join('');
  }

  // Dining Tab
  const diningContainer = document.getElementById('hom-dining-container');
  if (diningContainer) {
    const d = hotel.dining || {
      name: "PINXX Multi-Cuisine Restaurant & Lounge",
      description: "All-day fine dining venue serving signature North Indian, Continental, and Pan-Asian specialties prepared by master chefs.",
      timings: "07:00 AM - 11:00 PM",
      cuisine: "Multi-Cuisine"
    };
    diningContainer.innerHTML = `
      <div class="p-5 sm:p-6 rounded-xl border border-border bg-white flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-64 h-48 rounded-xl overflow-hidden shrink-0 bg-surface-subtle">
          <img src="${gallery[Math.min(2, gallery.length - 1)]}" alt="${d.name}" class="w-full h-full object-cover" onerror="this.src='images/hero/19_49_2026_10_49_13banner1.jpg'" />
        </div>
        <div class="flex-1 space-y-3">
          <div class="inline-block px-2.5 py-0.5 rounded bg-brand-terracotta/10 text-brand-terracotta text-[10px] font-bold uppercase tracking-wider">
            ${d.cuisine || 'Multi-Cuisine Fine Dining'}
          </div>
          <h4 class="font-serif text-2xl text-brand-slate font-normal">${d.name}</h4>
          <p class="text-xs sm:text-sm text-text-secondary leading-relaxed">${d.description}</p>
          <div class="text-xs text-text-muted">
            <strong>Operating Hours:</strong> ${d.timings || '07:00 AM - 11:00 PM'} · Buffet &amp; À La Carte
          </div>
          <button type="button" onclick="showToast('Table reservation request received for ${hotel.name}! Our restaurant host will confirm shortly.', 'success')" class="px-5 py-2 bg-brand-slate hover:bg-brand-slate/90 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow cursor-pointer">
            Reserve a Table
          </button>
        </div>
      </div>
    `;
  }

  // Banquets Tab
  const banquetsContainer = document.getElementById('hom-banquets-container');
  if (banquetsContainer) {
    const b = hotel.banquets || {
      name: "Orchid Grand Ballroom & Meeting Suites",
      description: "State-of-the-art conference and wedding venue with advanced audiovisual projection, high-speed connectivity, and curated catering.",
      capacity: "50 to 400 Guests",
      events: "Conferences, Seminars, Weddings & Receptions"
    };
    banquetsContainer.innerHTML = `
      <div class="p-5 sm:p-6 rounded-xl border border-border bg-white flex flex-col md:flex-row gap-6">
        <div class="w-full md:w-64 h-48 rounded-xl overflow-hidden shrink-0 bg-surface-subtle">
          <img src="${gallery[Math.min(3, gallery.length - 1)]}" alt="${b.name}" class="w-full h-full object-cover" onerror="this.src='images/hero/19_49_2026_10_49_13banner1.jpg'" />
        </div>
        <div class="flex-1 space-y-3">
          <div class="inline-block px-2.5 py-0.5 rounded bg-brand-slate/10 text-brand-slate text-[10px] font-bold uppercase tracking-wider">
            ${b.capacity || '50 - 400 Guests'}
          </div>
          <h4 class="font-serif text-2xl text-brand-slate font-normal">${b.name}</h4>
          <p class="text-xs sm:text-sm text-text-secondary leading-relaxed">${b.description}</p>
          <div class="text-xs text-text-muted">
            <strong>Suitable For:</strong> ${b.events || 'Corporate Seminars, Executive Conclaves, Weddings &amp; Receptions'}
          </div>
          <button type="button" onclick="showToast('Banquet &amp; Event enquiry sent for ${hotel.name}! Our Events Team will connect within 2 hours.', 'success')" class="px-5 py-2 bg-brand-terracotta hover:bg-brand-gold-rich text-white text-xs font-bold uppercase tracking-wider rounded transition-colors shadow cursor-pointer">
            Request Event Proposal
          </button>
        </div>
      </div>
    `;
  }

  // Attractions Tab
  const attrEl = document.getElementById('hom-attractions-text');
  if (attrEl) attrEl.textContent = hotel.attractions || 'Centrally located with convenient access to major heritage and commercial destinations.';

  // Facilities Tab
  const amenitiesGrid = document.getElementById('hom-amenities-grid');
  if (amenitiesGrid) {
    const allAmenities = hotel.amenities || [
      "Free High-Speed Wi-Fi",
      "24/7 Room Service",
      "Multi-Cuisine Dining",
      "Fitness Center",
      "Meeting Facilities",
      "Valet Parking",
      "Airport Transfers"
    ];
    amenitiesGrid.innerHTML = allAmenities.map(a => `
      <div class="p-3 rounded-lg bg-surface-subtle border border-border flex items-center gap-2 text-xs font-medium text-text-secondary">
        <i data-lucide="check-circle" class="w-4 h-4 text-emerald-700 shrink-0"></i>
        <span>${a}</span>
      </div>
    `).join('');
  }

  // Bottom Pricing & Reserve CTA
  const bottomPrice = document.getElementById('hom-bottom-price');
  if (bottomPrice) bottomPrice.textContent = '₹' + hotel.price;

  const bottomMemberPrice = document.getElementById('hom-bottom-member-price');
  if (bottomMemberPrice) bottomMemberPrice.textContent = '₹' + hotel.memberPrice;

  const reserveBtn = document.getElementById('hom-reserve-btn');
  if (reserveBtn) {
    reserveBtn.onclick = function() {
      closeHotelOverviewModal();
      openSearchResultsModal({ destination: hotel.name, checkin: 'Nov 22', checkout: 'Nov 24', adults: 2, rooms: 1 });
    };
  }

  switchHotelTab('overview');
  openModal(modal);
  if (window.lucide) window.lucide.createIcons();
}

function setHeroPhoto(url, current, total, btnElem) {
  const heroImg = document.getElementById('hom-hero-image');
  if (heroImg) heroImg.src = url;
  const counter = document.getElementById('hom-gallery-counter');
  if (counter) counter.textContent = `Photo ${current} of ${total}`;

  // Update active border on thumbnails
  document.querySelectorAll('.hom-thumb-btn').forEach(btn => {
    btn.classList.remove('border-brand-terracotta');
    btn.classList.add('border-transparent');
  });
  if (btnElem) {
    btnElem.classList.remove('border-transparent');
    btnElem.classList.add('border-brand-terracotta');
  }
}

function switchHotelTab(tabName) {
  const tabs = ['overview', 'rooms', 'dining', 'banquets', 'attractions', 'facilities'];
  tabs.forEach(t => {
    const pane = document.getElementById('hotel-tab-' + t);
    const btn = document.getElementById('tab-btn-' + t);
    if (pane) {
      if (t === tabName) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
    if (btn) {
      if (t === tabName) {
        btn.classList.add('border-brand-terracotta', 'text-brand-terracotta');
        btn.classList.remove('border-transparent');
      } else {
        btn.classList.remove('border-brand-terracotta', 'text-brand-terracotta');
        btn.classList.add('border-transparent');
      }
    }
  });
  if (window.lucide) window.lucide.createIcons();
}

function closeHotelOverviewModal() {
  const modal = document.getElementById('hotel-overview-modal');
  closeModal(modal);
}

// Auto-open hotel modal if ?hotel=slug is in URL
document.addEventListener('DOMContentLoaded', () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const hotelParam = urlParams.get('hotel');
    if (hotelParam) {
      setTimeout(() => openHotelOverviewModal(hotelParam), 500);
    }
  } catch (e) {}
});

window.openHotelOverviewModal = openHotelOverviewModal;
window.closeHotelOverviewModal = closeHotelOverviewModal;
window.setHeroPhoto = setHeroPhoto;
window.switchHotelTab = switchHotelTab;
