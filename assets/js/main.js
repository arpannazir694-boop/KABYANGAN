/**
 * KABYANGAN (কাব্যাঙ্গন) — Academy of Elocution & Performing Arts
 * Main Application Script & Interactive Controller (Live Studio Enabled)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Header & Navigation Controller ---
  const header = document.querySelector('.site-header');
  const scrollTopBtn = document.querySelector('.scroll-top-btn');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const handleScroll = () => {
    const scrollY = window.scrollY;

    // Header sticky shadow
    if (scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll-to-top button visibility
    if (scrollY > 450) {
      scrollTopBtn?.classList.add('visible');
    } else {
      scrollTopBtn?.classList.remove('visible');
    }

    // Active navigation highlight (only runs on index.html where on-page sections exist)
    if (document.querySelector('#hero') && sections.length > 0) {
      let currentSectionId = '';
      sections.forEach(sec => {
        const secTop = sec.offsetTop - 120;
        const secHeight = sec.offsetHeight;
        if (scrollY >= secTop && scrollY < secTop + secHeight) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      if (currentSectionId) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${currentSectionId}` || link.getAttribute('href') === `index.html#${currentSectionId}`) {
            link.classList.add('active');
          }
        });
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 2. Mobile Drawer Navigation ---
  const menuToggle = document.querySelector('.menu-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-nav-link');

  const openDrawer = () => {
    drawer?.classList.add('open');
    backdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer?.classList.remove('open');
    backdrop?.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // ==========================================================================
  // 3. Classical Ambience & Recitation Audio Player
  // ==========================================================================
  const tracks = [
    {
      id: 1,
      title: "Nirjharer Swapnabhanga",
      poet: "Rabindranath Tagore",
      reciter: "Faculty Ensemble",
      durationSeconds: 225,
      excerpt: "আজি এ প্রভাতে রবির কর / কেমনে পশিল প্রাণের পর, / কেমনে পশিল গুহার আঁধারে প্রভাতপাখির গান!",
      raga: "Bhairav / Morning Resonance"
    },
    {
      id: 2,
      title: "Bidrohi (The Rebel)",
      poet: "Kazi Nazrul Islam",
      reciter: "Masterclasses Showcase",
      durationSeconds: 260,
      excerpt: "বল বীর— বল উন্নত মম শির! / শির নেহারি’ আমারি, নতশির ওই শিখর হিমাদ্রির!",
      raga: "Deep Chhanda & High Cadence"
    },
    {
      id: 3,
      title: "Banalata Sen",
      poet: "Jibanananda Das",
      reciter: "Senior Artist Recital",
      durationSeconds: 195,
      excerpt: "হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে, / সিংহল সমুদ্র থেকে নিশীথের অন্ধকারে মালয় সাগরে...",
      raga: "Acoustic Serenity"
    },
    {
      id: 4,
      title: "Keu Kotha Rakheni",
      poet: "Sunil Gangopadhyay",
      reciter: "Contemporary Verse Collective",
      durationSeconds: 230,
      excerpt: "কেউ কথা রাখেনি, তেত্রিশ বছর কাটলো, কেউ কথা রাখেনি! / একটি বোষ্টুমি এসে ব’লেছিল, নবীন বোষ্টুমের গান শোনাব...",
      raga: "Dramatic Monologue"
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let audioTimer = null;
  let currentSeconds = 0;

  // Web Audio Synthesizer for Ambient Tanpura / Poetic Sitar Drone
  let droneCtx = null;
  let droneGain = null;
  let droneOscillators = [];

  const initWebAudioDrone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!droneCtx) droneCtx = new AudioCtx();
      if (droneCtx.state === 'suspended') droneCtx.resume();

      if (droneOscillators.length === 0) {
        droneGain = droneCtx.createGain();
        droneGain.gain.setValueAtTime(0.001, droneCtx.currentTime);

        const filter = droneCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, droneCtx.currentTime);

        droneGain.connect(filter);
        filter.connect(droneCtx.destination);

        const freqs = [146.83, 220.00, 293.66, 440.00];
        freqs.forEach((freq, idx) => {
          const osc = droneCtx.createOscillator();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq + (Math.random() * 0.4 - 0.2), droneCtx.currentTime);

          const oscGain = droneCtx.createGain();
          oscGain.gain.setValueAtTime(0.04 / (idx + 1), droneCtx.currentTime);

          osc.connect(oscGain);
          oscGain.connect(droneGain);
          osc.start();
          droneOscillators.push(osc);
        });
      }

      droneGain.gain.cancelScheduledValues(droneCtx.currentTime);
      droneGain.gain.linearRampToValueAtTime(0.08, droneCtx.currentTime + 1.2);
    } catch (e) {
      console.warn("Web Audio not supported:", e);
    }
  };

  const stopWebAudioDrone = () => {
    if (droneCtx && droneGain) {
      try {
        droneGain.gain.cancelScheduledValues(droneCtx.currentTime);
        droneGain.gain.linearRampToValueAtTime(0.0001, droneCtx.currentTime + 0.8);
      } catch (e) {}
    }
  };

  const playerWidget = document.querySelector('.audio-player-widget');
  const playBtn = document.querySelector('.play-main-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const progressFill = document.querySelector('.progress-fill');
  const progressBar = document.querySelector('.progress-bar-container');
  const timeCurrent = document.querySelector('.time-current');
  const timeTotal = document.querySelector('.time-total');
  const trackTitle = document.querySelector('.current-track-title');
  const trackMeta = document.querySelector('.current-track-meta');
  const quoteDisplay = document.querySelector('.dynamic-quote-text');
  const quotePoetDisplay = document.querySelector('.dynamic-quote-author');
  const playlistItems = document.querySelectorAll('.playlist-item');

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const updatePlayerUI = () => {
    const track = tracks[currentTrackIndex];
    if (trackTitle) trackTitle.innerHTML = `${track.title} <span class="literary-accent font-bengali">সুর</span>`;
    if (trackMeta) trackMeta.innerHTML = `<span>By ${track.poet}</span> • <span>${track.reciter}</span> • <span class="gold-gradient-text">${track.raga}</span>`;
    if (timeTotal) timeTotal.textContent = formatTime(track.durationSeconds);
    if (quoteDisplay) quoteDisplay.textContent = `“${track.excerpt}”`;
    if (quotePoetDisplay) quotePoetDisplay.textContent = `— ${track.poet}`;

    playlistItems.forEach((item, index) => {
      item.classList.toggle('active', index === currentTrackIndex);
    });

    updateProgress();
  };

  const updateProgress = () => {
    const track = tracks[currentTrackIndex];
    const pct = (currentSeconds / track.durationSeconds) * 100;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (timeCurrent) timeCurrent.textContent = formatTime(currentSeconds);
  };

  const togglePlay = () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playerWidget?.classList.add('playing');
      if (playBtn) playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      initWebAudioDrone();

      audioTimer = setInterval(() => {
        const track = tracks[currentTrackIndex];
        currentSeconds += 1;
        if (currentSeconds >= track.durationSeconds) {
          nextTrack();
        } else {
          updateProgress();
        }
      }, 1000);
    } else {
      pauseTrack();
    }
  };

  const pauseTrack = () => {
    isPlaying = false;
    playerWidget?.classList.remove('playing');
    if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
    clearInterval(audioTimer);
    stopWebAudioDrone();
  };

  const nextTrack = () => {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    currentSeconds = 0;
    updatePlayerUI();
    if (isPlaying) {
      clearInterval(audioTimer);
      togglePlay();
      togglePlay();
    }
  };

  const prevTrack = () => {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    currentSeconds = 0;
    updatePlayerUI();
    if (isPlaying) {
      clearInterval(audioTimer);
      togglePlay();
      togglePlay();
    }
  };

  playBtn?.addEventListener('click', togglePlay);
  nextBtn?.addEventListener('click', nextTrack);
  prevBtn?.addEventListener('click', prevTrack);

  const heroListenBtn = document.querySelector('#hero-listen-btn');
  heroListenBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const loungeSec = document.querySelector('#recitation-lounge');
    loungeSec?.scrollIntoView({ behavior: 'smooth' });
    if (!isPlaying) {
      setTimeout(() => {
        togglePlay();
      }, 600);
    }
  });

  playlistItems.forEach((item) => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-track-index') || '0', 10);
      if (currentTrackIndex !== idx) {
        currentTrackIndex = idx;
        currentSeconds = 0;
        updatePlayerUI();
        if (!isPlaying) togglePlay();
      } else {
        togglePlay();
      }
    });
  });

  progressBar?.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, clickX / width));
    const track = tracks[currentTrackIndex];
    currentSeconds = Math.floor(pct * track.durationSeconds);
    updateProgress();
  });

  updatePlayerUI();

  // --- 5. Course Filter System ---
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter') || 'all';

      courseCards.forEach(card => {
        const category = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 6. FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(otherItem => {
        if (otherItem !== item) otherItem.classList.remove('active');
      });
      item.classList.toggle('active', !isActive);
    });
  });

  // --- 7. Admission Form Handler ---
  const auditionForm = document.getElementById('admission-form');
  const modalOverlay = document.getElementById('success-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalRefCode = document.getElementById('modal-ref-code');
  const modalWhatsappLink = document.getElementById('modal-whatsapp-link');

  auditionForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = document.getElementById('applicant-name')?.value.trim();
    const phone = document.getElementById('applicant-phone')?.value.trim();
    const email = document.getElementById('applicant-email')?.value.trim();
    const ageGroup = document.getElementById('applicant-age')?.value;
    const course = document.getElementById('applicant-course')?.value;
    const mode = document.getElementById('applicant-mode')?.value;
    const notes = document.getElementById('applicant-message')?.value.trim();

    if (!fullName || !phone) {
      alert('Please provide your Full Name and Contact Number.');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const refCode = `KBY-2026-${randomNum}`;

    if (modalRefCode) modalRefCode.textContent = refCode;

    const waText = encodeURIComponent(
      `*Admission Inquiry — Kabyangan (কাব্যাঙ্গন)*\n` +
      `*Ref:* ${refCode}\n` +
      `*Name:* ${fullName}\n` +
      `*Phone:* ${phone}\n` +
      `*Age Group:* ${ageGroup}\n` +
      `*Course:* ${course}\n` +
      `*Mode:* ${mode}\n` +
      (notes ? `*Note:* ${notes}` : '')
    );
    const waUrl = `https://wa.me/919830000000?text=${waText}`;

    if (modalWhatsappLink) modalWhatsappLink.setAttribute('href', waUrl);

    modalOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
    auditionForm.reset();
  });

  modalClose?.addEventListener('click', () => {
    modalOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  });

  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // --- 8. Lightbox ---
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxOverlay = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close-btn');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img && lightboxImg && lightboxOverlay) {
        lightboxImg.src = img.src;
        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  lightboxClose?.addEventListener('click', () => {
    lightboxOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  });

  lightboxOverlay?.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      lightboxOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // --- 9. Newsletter ---
  const newsletterForm = document.querySelector('.newsletter-form');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('.newsletter-input');
    if (input && input.value.trim()) {
      alert(`Thank you for subscribing to Kabyangan Literary Gazette! Updates will be sent to ${input.value}.`);
      input.value = '';
    }
  });

  // --- 10. Hero Circular Live Medallion (3D Tilt & 432Hz Acoustic Tone) ---
  const heroOrb = document.getElementById('hero-emblem-orb');
  const heroCard = document.querySelector('.hero-visual-card');
  const resonanceTrigger = document.getElementById('hero-resonance-trigger');
  const livePill = document.getElementById('hero-live-pill');
  const liveLabel = livePill?.querySelector('.orbit-live-label');

  if (heroCard && heroOrb) {
    let bounds;
    const updateBounds = () => { bounds = heroCard.getBoundingClientRect(); };
    window.addEventListener('resize', updateBounds);
    updateBounds();

    heroCard.addEventListener('mouseenter', updateBounds);
    heroCard.addEventListener('mousemove', (e) => {
      if (!bounds) updateBounds();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const tiltX = ((mouseY - centerY) / centerY) * -12;
      const tiltY = ((mouseX - centerX) / centerX) * 12;
      heroOrb.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
    });

    heroCard.addEventListener('mouseleave', () => {
      heroOrb.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  // Audio Drone for Hero Medallion Live Resonance
  let heroAudioCtx = null;
  let heroOscs = [];
  let heroGain = null;
  let isResonating = false;

  const toggleHeroResonance = () => {
    if (!isResonating) {
      // Start 432Hz Academy Drone
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!heroAudioCtx) {
          heroAudioCtx = new AudioContextClass();
        }
        if (heroAudioCtx.state === 'suspended') {
          heroAudioCtx.resume();
        }

        heroGain = heroAudioCtx.createGain();
        heroGain.gain.setValueAtTime(0.001, heroAudioCtx.currentTime);
        heroGain.gain.exponentialRampToValueAtTime(0.18, heroAudioCtx.currentTime + 1.2);
        heroGain.connect(heroAudioCtx.destination);

        // Indian classical Sa-Pa harmonic frequencies rooted at 432Hz
        const freqs = [108, 216, 324, 432];
        heroOscs = freqs.map(f => {
          const osc = heroAudioCtx.createOscillator();
          osc.type = f === 108 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(f, heroAudioCtx.currentTime);
          osc.connect(heroGain);
          osc.start();
          return osc;
        });

        isResonating = true;
        if (livePill) livePill.classList.add('active-resonance');
        if (liveLabel) liveLabel.textContent = '● 432 Hz RESONATING';
      } catch (err) {
        console.warn('Web Audio error:', err);
      }
    } else {
      // Stop Drone
      if (heroGain && heroAudioCtx) {
        heroGain.gain.exponentialRampToValueAtTime(0.0001, heroAudioCtx.currentTime + 0.8);
        setTimeout(() => {
          heroOscs.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch (e) {} });
          heroOscs = [];
        }, 850);
      }
      isResonating = false;
      if (livePill) livePill.classList.remove('active-resonance');
      if (liveLabel) liveLabel.textContent = 'LIVE ACOUSTIC RESONANCE';
    }
  };

  resonanceTrigger?.addEventListener('click', toggleHeroResonance);

  // ==========================================================================
  // 11. Founder's Literary Diary (প্রতিষ্ঠাত্রীর সারস্বত দিনলিপি) 6-Page Controller
  // ==========================================================================
  const diaryBook = document.getElementById('founder-diary-book');
  const diaryPages = document.querySelectorAll('.diary-deck .diary-page');
  const diaryDots = document.querySelectorAll('.diary-dots .diary-dot');
  const globalPrevBtn = document.getElementById('diary-global-prev');
  const globalNextBtn = document.getElementById('diary-global-next');
  const openDiaryBtn = document.getElementById('btn-open-diary');
  const returnCoverBtn = document.getElementById('btn-return-cover');

  let currentDiaryPage = 0;
  const totalDiaryPages = diaryPages.length; // 6 pages (0 to 5)
  let isTurning = false;

  // Realistic synthetic paper rustle sound via Web Audio API
  const playPaperRustle = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const actx = new AudioCtx();
      if (actx.state === 'suspended') actx.resume();

      const sr = actx.sampleRate;
      const dur = 0.18; // 180ms soft paper rustle
      const buf = actx.createBuffer(1, Math.floor(sr * dur), sr);
      const output = buf.getChannelData(0);

      for (let i = 0; i < output.length; i++) {
        const env = Math.exp(-i / (sr * 0.05));
        output[i] = (Math.random() * 2 - 1) * env;
      }

      const whiteNoise = actx.createBufferSource();
      whiteNoise.buffer = buf;

      const bandFilter = actx.createBiquadFilter();
      bandFilter.type = 'bandpass';
      bandFilter.frequency.value = 2100;
      bandFilter.Q.value = 1.6;

      const vol = actx.createGain();
      vol.gain.setValueAtTime(0.08, actx.currentTime);
      vol.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);

      whiteNoise.connect(bandFilter);
      bandFilter.connect(vol);
      vol.connect(actx.destination);

      whiteNoise.start();
    } catch (e) {
      // Audio fallback without error
    }
  };

  const syncAllPages = () => {
    diaryPages.forEach((page, i) => {
      page.classList.remove('turning-forward', 'turning-backward');
      if (i < currentDiaryPage) {
        page.classList.remove('active');
        page.classList.add('flipped');
      } else if (i === currentDiaryPage) {
        page.classList.remove('flipped');
        page.classList.add('active');
      } else {
        page.classList.remove('flipped', 'active');
      }
    });

    // Update Dots
    diaryDots.forEach((dot) => {
      const p = parseInt(dot.getAttribute('data-page'), 10);
      dot.classList.toggle('active', p === currentDiaryPage);
    });

    if (globalPrevBtn) {
      globalPrevBtn.style.opacity = currentDiaryPage === 0 ? '0.45' : '1';
    }
    if (globalNextBtn) {
      globalNextBtn.style.opacity = currentDiaryPage === totalDiaryPages - 1 ? '0.45' : '1';
    }
  };

  const updateDiaryState = (targetIndex, direction = 'forward') => {
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= totalDiaryPages) targetIndex = totalDiaryPages - 1;
    if (targetIndex === currentDiaryPage) return;

    isTurning = true;
    playPaperRustle();

    const oldIndex = currentDiaryPage;
    currentDiaryPage = targetIndex;

    if (direction === 'forward') {
      const leavingPage = diaryPages[oldIndex];
      const enteringPage = diaryPages[currentDiaryPage];

      // Immediately prepare entering page beneath the turning leaf
      if (enteringPage) {
        enteringPage.classList.remove('flipped', 'turning-backward', 'turning-forward');
        enteringPage.classList.add('active');
        enteringPage.style.zIndex = '8';
      }

      if (leavingPage) {
        leavingPage.classList.remove('active', 'turning-backward');
        leavingPage.classList.add('turning-forward');
        leavingPage.style.zIndex = '15';
      }

      setTimeout(() => {
        if (leavingPage) {
          leavingPage.classList.remove('turning-forward');
          leavingPage.classList.add('flipped');
          leavingPage.style.zIndex = '';
        }
        if (enteringPage) {
          enteringPage.style.zIndex = '';
        }
        syncAllPages();
        isTurning = false;
      }, 850);

    } else {
      const enteringPage = diaryPages[currentDiaryPage];
      const leavingPage = diaryPages[oldIndex];

      if (leavingPage) {
        leavingPage.classList.add('active');
        leavingPage.style.zIndex = '8';
      }

      if (enteringPage) {
        enteringPage.classList.remove('flipped');
        enteringPage.classList.add('turning-backward');
        enteringPage.style.zIndex = '15';
      }

      setTimeout(() => {
        if (leavingPage) {
          leavingPage.classList.remove('active');
          leavingPage.style.zIndex = '';
        }
        if (enteringPage) {
          enteringPage.classList.remove('turning-backward');
          enteringPage.classList.add('active');
          enteringPage.style.zIndex = '';
        }
        syncAllPages();
        isTurning = false;
      }, 850);
    }
  };

  const diaryGoNext = () => {
    if (isTurning) return;
    if (currentDiaryPage < totalDiaryPages - 1) {
      updateDiaryState(currentDiaryPage + 1, 'forward');
    } else {
      updateDiaryState(0, 'backward');
    }
  };

  const diaryGoPrev = () => {
    if (isTurning) return;
    if (currentDiaryPage > 0) {
      updateDiaryState(currentDiaryPage - 1, 'backward');
    }
  };

  const diaryGoToPage = (index) => {
    if (isTurning || index === currentDiaryPage) return;
    const dir = index > currentDiaryPage ? 'forward' : 'backward';
    updateDiaryState(index, dir);
  };

  // 1. "jekhanei click kori na keno pata ultabe" - Click anywhere on the book to advance
  if (diaryBook) {
    diaryBook.addEventListener('click', (e) => {
      // If clicked on an interactive link (like WhatsApp link) or inside an anchor tag, let it work
      if (e.target.closest('a')) return;

      // If clicked on a specific Prev button
      if (e.target.closest('.btn-turn-prev') || e.target.closest('#diary-global-prev')) {
        e.stopPropagation();
        diaryGoPrev();
        return;
      }

      // If clicked on "Return to Cover" button
      if (e.target.closest('#btn-return-cover')) {
        e.stopPropagation();
        diaryGoToPage(0);
        return;
      }

      // If clicked on the dots navigation bar
      if (e.target.closest('.diary-navigation-bar')) {
        return;
      }

      // Check click position: if clicked on the left 18% of the book, turn backward
      const rect = diaryBook.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.18 && currentDiaryPage > 0) {
        diaryGoPrev();
        return;
      }

      // Any other click flips forward!
      diaryGoNext();
    });

    // Keyboard navigation (Left/Right arrows, PageUp/Down, Home, End)
    diaryBook.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        diaryGoNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        diaryGoPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        diaryGoToPage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        diaryGoToPage(totalDiaryPages - 1);
      }
    });
  }

  // Global Prev / Next Arrows
  globalPrevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    diaryGoPrev();
  });

  globalNextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    diaryGoNext();
  });

  // Dots direct navigation
  diaryDots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetPage = parseInt(dot.getAttribute('data-page'), 10);
      if (!isNaN(targetPage)) {
        diaryGoToPage(targetPage);
      }
    });
  });

  // Open Diary button on Cover
  openDiaryBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    diaryGoNext();
  });

  // Return to Cover button on Page 5
  returnCoverBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    diaryGoToPage(0);
  });

  // Individual Next buttons on pages
  document.querySelectorAll('.btn-turn-next').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      diaryGoNext();
    });
  });

  // Individual Prev buttons on pages
  document.querySelectorAll('.btn-turn-prev').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      diaryGoPrev();
    });
  });

  // Initial sync on page load (support ?diary=pageNumber deep link)
  const urlParamPage = parseInt(new URLSearchParams(window.location.search).get('diary'), 10);
  if (!isNaN(urlParamPage) && urlParamPage >= 0 && urlParamPage < totalDiaryPages) {
    currentDiaryPage = urlParamPage;
  }
  syncAllPages();
});

