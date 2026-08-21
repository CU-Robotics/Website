/**
 * CU Robotics - Main JavaScript
 * Handles animations, scroll effects, and UI interactions
 */

const { escapeHTML, fetchJSON } = window.CURobotics;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initStatsCounter();
  initSmoothScroll();
  loadJSONContent();
});

// ============================================
// NAVBAR - Glassmorphism & Scroll Effects
// ============================================

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScroll = 0;
  const scrollThreshold = 50;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add scrolled class for background change
    if (currentScroll > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide/show navbar on scroll direction (optional)
    // if (currentScroll > lastScroll && currentScroll > 200) {
    //   navbar.style.transform = 'translateY(-100%)';
    // } else {
    //   navbar.style.transform = 'translateY(0)';
    // }

    lastScroll = currentScroll;
  });

  // Active link highlighting
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  if (!menuBtn || !mobileMenu) return;

  function setMenuOpen(isOpen) {
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  menuBtn.addEventListener('click', () => {
    setMenuOpen(!mobileMenu.classList.contains('active'));
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      setMenuOpen(false);
      menuBtn.focus();
    }
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  if (!animatedElements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: unobserve after animation
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// ANIMATED STATS COUNTER
// ============================================

function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');

  if (!statNumbers.length) return;

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  statNumbers.forEach(stat => observer.observe(stat));
}

function animateCounter(element) {
  const target = parseInt(element.dataset.target) || parseInt(element.textContent);
  const duration = 2000; // 2 seconds
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * easeOut);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      // Add suffix if present
      const suffix = element.dataset.suffix || '';
      element.textContent = target.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(update);
}

// ============================================
// SMOOTH SCROLL
// ============================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Skip if it's just "#"
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// JSON CONTENT LOADING
// ============================================

async function loadJSONContent() {
  const loaders = [
    ['.achievements-container', loadAchievements],
    ['.leadership-container', loadLeadership]
  ];

  await Promise.all(loaders
    .filter(([selector]) => document.querySelector(selector))
    .map(([, load]) => load()));
}

async function loadAchievements() {
  try {
    const data = await fetchJSON('data/achievements.json');
    renderAchievements(data.achievements);
  } catch (error) {
    console.error('Error loading achievements:', error);
    showLoadError('.achievements-container', 'achievements');
  }
}

function renderAchievements(achievements) {
  const container = document.querySelector('.achievements-container');
  if (!container) return;

  container.innerHTML = achievements.map(yearGroup => `
    <div class="achievement-year animate-on-scroll">
      <div class="year-marker"></div>
      <h3 class="year-label">${escapeHTML(yearGroup.year)}</h3>
      <div class="achievements-grid">
        ${yearGroup.items.map((item, index) => `
          <div class="achievement-card animate-on-scroll stagger-${(index % 4) + 1}">
            ${item.image ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.competition)}" class="achievement-image" data-image-fallback="remove">` : ''}
            <div class="achievement-content">
              <span class="achievement-award">${escapeHTML(item.award)}</span>
              <h4 class="achievement-competition">${escapeHTML(item.competition)}</h4>
              <p class="achievement-description">${escapeHTML(item.description)}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  initImageFallbacks(container);

  // Re-initialize scroll animations for new content
  initScrollAnimations();
}

async function loadLeadership() {
  try {
    const data = await fetchJSON('data/leaders.json');
    renderLeadership(data.leadership);
  } catch (error) {
    console.error('Error loading leadership:', error);
    showLoadError('.leadership-container', 'leadership history');
  }
}

function renderLeadership(leadership) {
  const container = document.querySelector('.leadership-container');
  if (!container) return;

  container.innerHTML = leadership.map((yearGroup, yearIndex) => {
    const isCurrent = yearIndex === 0;

    return `
    <div class="leadership-year">
      <div class="year-header">
        <h3 class="year-label">${escapeHTML(yearGroup.year)}</h3>
        <span class="season-label">${escapeHTML(yearGroup.season)}</span>
      </div>
      ${yearGroup.groups ? `
        <div class="leadership-groups-container">
          ${yearGroup.groups.map(group => `
            <div class="leadership-group">
              <h4 class="group-label">${escapeHTML(group.name)}</h4>
              <div class="leadership-grid">
                ${group.members.map(member => createLeaderCard(member, isCurrent, yearGroup.year)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="leadership-grid">
          ${yearGroup.members.map(member => createLeaderCard(member, isCurrent, yearGroup.year)).join('')}
        </div>
      `}
    </div>
  `;
  }).join('');
  initImageFallbacks(container);
}

function getClassStanding(graduationYear, seasonYear) {
  if (!graduationYear) return '';

  const seasonEndYear = Number.parseInt(seasonYear?.split('-')[1], 10) || new Date().getFullYear();
  const yearsUntilGraduation = Number.parseInt(graduationYear, 10) - seasonEndYear;
  return ['Senior', 'Junior', 'Sophomore', 'Freshman'][Math.max(0, Math.min(yearsUntilGraduation, 3))];
}

function createLeaderCard(member, isCurrent, seasonYear) {
  const isTBD = member.name === 'TBD';
  const socials = [];

  if (member.email) socials.push(`<a href="mailto:${escapeHTML(member.email)}" title="Email" aria-label="Email"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></a>`);
  if (member.linkedin) socials.push(`<a href="${escapeHTML(member.linkedin)}" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>`);
  if (member.github) socials.push(`<a href="${escapeHTML(member.github)}" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>`);

  const photoSrc = member.photo || 'images/Members/placeholder-avatar.svg';
  const classStanding = getClassStanding(member.graduationYear, seasonYear);
  const yearInfo = member.major ? `${member.major}${member.year ? ` | ${member.year}` : ''}` : classStanding;

  // Directors (and the president) outrank leads; the rail node says which.
  const rank = /director|president|head/i.test(member.role || '') ? 'leader-rank-director' : 'leader-rank-lead';

  return `
    <div class="leader-card ${rank} ${isTBD ? 'leader-tbd' : ''} ${isCurrent ? 'leader-current' : ''}">
      <div class="leader-photo">
        <img src="${escapeHTML(photoSrc)}" alt="${escapeHTML(member.name)}" data-image-fallback="avatar">
        ${isCurrent && !isTBD ? '<span class="current-badge">Current</span>' : ''}
        ${isTBD ? '<span class="tbd-badge">Open Position</span>' : ''}
      </div>
      <div class="leader-info">
        <h4 class="leader-name">${escapeHTML(member.name)}</h4>
        <p class="leader-role">${escapeHTML(member.role)}</p>
        ${yearInfo && yearInfo !== 'To Be Announced' ? `<p class="leader-major">${escapeHTML(yearInfo)}</p>` : ''}
        ${socials.length ? `<div class="leader-socials">${socials.join('')}</div>` : ''}
      </div>
    </div>
  `;
}

function initImageFallbacks(container) {
  container.querySelectorAll('[data-image-fallback]').forEach(image => {
    image.addEventListener('error', () => {
      if (image.dataset.imageFallback === 'avatar') {
        image.src = 'images/Members/placeholder-avatar.svg';
        image.removeAttribute('data-image-fallback');
      } else {
        image.remove();
      }
    });
  });
}

function showLoadError(containerSelector, dataType) {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <p>Unable to load ${dataType}. Please try refreshing the page.</p>
      </div>
    `;
  }
}
