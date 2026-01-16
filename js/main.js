/**
 * CU Robotics - Main JavaScript
 * Handles animations, scroll effects, and UI interactions
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initParallax();
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

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
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
// PARALLAX EFFECT
// ============================================

function initParallax() {
  const parallaxElements = document.querySelectorAll('.hero-parallax');

  if (!parallaxElements.length) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollY = window.pageYOffset;
        parallaxElements.forEach(el => {
          const speed = el.dataset.speed || 0.5;
          el.style.transform = `translateY(${scrollY * speed}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  });
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
  // Load achievements if on achievements page
  if (document.querySelector('.achievements-container')) {
    await loadAchievements();
  }

  // Load leadership timeline if on team/leadership page
  if (document.querySelector('.leadership-container')) {
    await loadLeadership();
  }

  // Load team members if on team page (old format)
  if (document.querySelector('.team-container')) {
    await loadTeamMembers();
  }

  // Load robots if on homepage or projects page
  if (document.querySelector('.robots-container')) {
    await loadRobots();
  }
}

async function loadAchievements() {
  try {
    const response = await fetch('data/achievements.json');
    const data = await response.json();
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
      <h3 class="year-label">${yearGroup.year}</h3>
      <div class="achievements-grid">
        ${yearGroup.items.map((item, index) => `
          <div class="achievement-card animate-on-scroll stagger-${(index % 4) + 1}">
            ${item.image ? `<img src="${item.image}" alt="${item.competition}" class="achievement-image" onerror="this.style.display='none'">` : ''}
            <div class="achievement-content">
              <span class="achievement-award">${item.award}</span>
              <h4 class="achievement-competition">${item.competition}</h4>
              <p class="achievement-description">${item.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Re-initialize scroll animations for new content
  initScrollAnimations();
}

async function loadLeadership() {
  try {
    const response = await fetch('data/leaders.json');
    const data = await response.json();
    renderLeadership(data.leadership);
  } catch (error) {
    console.error('Error loading leadership:', error);
    showLoadError('.leadership-container', 'leadership history');
  }
}

function renderLeadership(leadership) {
  const container = document.querySelector('.leadership-container');
  if (!container) return;

  container.innerHTML = leadership.map((yearGroup, yearIndex) => `
    <div class="leadership-year animate-on-scroll">
      <div class="year-marker"></div>
      <div class="year-header">
        <h3 class="year-label">${yearGroup.year}</h3>
        <span class="season-label">${yearGroup.season}</span>
      </div>
      ${yearGroup.groups ? `
        <div class="leadership-groups-container">
          ${yearGroup.groups.map(group => `
            <div class="leadership-group">
              <h4 class="group-label">${group.name}</h4>
              <div class="leadership-grid">
                ${group.members.map((member, index) => createLeaderCard(member, index, yearIndex === 0, yearGroup.year)).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="leadership-grid">
          ${yearGroup.members.map((member, index) => createLeaderCard(member, index, yearIndex === 0, yearGroup.year)).join('')}
        </div>
      `}
    </div>
  `).join('');

  // Re-initialize scroll animations for new content
  initScrollAnimations();
}

function createLeaderCard(member, index, isCurrent, seasonYear) {
  const isTBD = member.name === 'TBD';
  const socials = [];

  if (member.email) socials.push(`<a href="mailto:${member.email}" title="Email" aria-label="Email"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></a>`);
  if (member.linkedin) socials.push(`<a href="${member.linkedin}" target="_blank" rel="noopener" title="LinkedIn" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>`);
  if (member.github) socials.push(`<a href="${member.github}" target="_blank" rel="noopener" title="GitHub" aria-label="GitHub"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>`);

  // Support both old format (photo, major, year) and new format (years, graduationYear)
  const photoSrc = member.photo || 'images/placeholder-avatar.svg';

  // Calculate class standing from graduation year relative to the season
  // seasonYear format: "2025-2026" - use the second year (graduation year of seniors that season)
  const getClassStanding = (gradYear, seasonYear) => {
    if (!gradYear) return '';
    const gradYearInt = parseInt(gradYear);
    // Extract the end year of the season (e.g., "2025-2026" -> 2026)
    const seasonEndYear = seasonYear ? parseInt(seasonYear.split('-')[1]) : new Date().getFullYear();
    const yearsUntilGrad = gradYearInt - seasonEndYear;

    if (yearsUntilGrad <= 0) return 'Senior';
    if (yearsUntilGrad === 1) return 'Junior';
    if (yearsUntilGrad === 2) return 'Sophomore';
    if (yearsUntilGrad === 3) return 'Freshman';
    return 'Freshman';
  };

  const classStanding = member.graduationYear ? getClassStanding(member.graduationYear, seasonYear) : '';
  const yearInfo = member.major ? `${member.major}${member.year ? ' | ' + member.year : ''}` :
                   (classStanding ? classStanding : '');

  return `
    <div class="leader-card animate-on-scroll stagger-${(index % 4) + 1} ${isTBD ? 'leader-tbd' : ''} ${isCurrent ? 'leader-current' : ''}">
      <div class="leader-photo">
        <img src="${photoSrc}" alt="${member.name}" onerror="this.src='images/placeholder-avatar.svg'">
        ${isCurrent && !isTBD ? '<span class="current-badge">Current</span>' : ''}
        ${isTBD ? '<span class="tbd-badge">Open Position</span>' : ''}
      </div>
      <div class="leader-info">
        <h4 class="leader-name">${member.name}</h4>
        <p class="leader-role">${member.role}</p>
        ${yearInfo && yearInfo !== 'To Be Announced' ? `<p class="leader-major">${yearInfo}</p>` : ''}
        ${member.bio && !isTBD ? `<p class="leader-bio">${member.bio}</p>` : ''}
        ${socials.length ? `<div class="leader-socials">${socials.join('')}</div>` : ''}
      </div>
    </div>
  `;
}

async function loadTeamMembers() {
  try {
    const response = await fetch('data/leaders.json');
    const data = await response.json();
    renderTeamMembers(data);
  } catch (error) {
    console.error('Error loading team members:', error);
    showLoadError('.team-container', 'team members');
  }
}

function renderTeamMembers(data) {
  const container = document.querySelector('.team-container');
  if (!container) return;

  const leadershipHTML = data.leadership.map((member, index) => createTeamCard(member, index)).join('');
  const membersHTML = data.members.map((member, index) => createTeamCard(member, index)).join('');

  container.innerHTML = `
    <div class="leadership-section">
      <div class="leadership-header animate-on-scroll">
        <h2>Leadership Team</h2>
        <div class="leadership-divider">
          <span>${data.team.tagline}</span>
        </div>
      </div>
      <div class="team-grid">
        ${leadershipHTML}
      </div>
    </div>

    <div class="members-section mt-2xl">
      <div class="leadership-header animate-on-scroll">
        <h2>Team Members</h2>
      </div>
      <div class="team-grid">
        ${membersHTML}
      </div>
    </div>
  `;

  // Re-initialize scroll animations
  initScrollAnimations();
}

function createTeamCard(member, index) {
  const socials = [];
  if (member.email) socials.push(`<a href="mailto:${member.email}" title="Email"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></a>`);
  if (member.linkedin) socials.push(`<a href="${member.linkedin}" target="_blank" rel="noopener" title="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>`);
  if (member.github) socials.push(`<a href="${member.github}" target="_blank" rel="noopener" title="GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>`);

  return `
    <div class="team-card animate-on-scroll stagger-${(index % 4) + 1}">
      <div class="team-photo">
        <img src="${member.photo}" alt="${member.name}" onerror="this.src='images/placeholder-avatar.svg'">
      </div>
      <h3 class="team-name">${member.name}</h3>
      <p class="team-role">${member.role}</p>
      <p class="team-major">${member.major} | ${member.year}</p>
      <p class="team-bio">${member.bio}</p>
      ${socials.length ? `<div class="team-socials">${socials.join('')}</div>` : ''}
    </div>
  `;
}

async function loadRobots() {
  try {
    const response = await fetch('data/robots.json');
    const data = await response.json();
    renderRobots(data.robots);
  } catch (error) {
    console.error('Error loading robots:', error);
  }
}

function renderRobots(robots) {
  const selector = document.querySelector('.robot-selector');
  if (!selector) return;

  selector.innerHTML = robots.map((robot, index) => `
    <div class="robot-thumb ${robot.status === 'active' ? 'active' : ''}"
         data-robot-id="${robot.id}"
         data-model="${robot.model3d}"
         data-name="${robot.name}">
      <img src="${robot.image}" alt="${robot.name}" onerror="this.parentElement.innerHTML='<span>${robot.name}</span>'">
    </div>
  `).join('');

  // Add click handlers
  selector.querySelectorAll('.robot-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      selector.querySelectorAll('.robot-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      // Trigger model loading in 3D viewer
      const modelPath = thumb.dataset.model;
      const robotName = thumb.dataset.name;
      if (window.robotViewer && modelPath) {
        window.robotViewer.loadModel(modelPath, robotName);
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

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
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

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other scripts
window.CURobotics = {
  initScrollAnimations,
  loadAchievements,
  loadLeadership,
  loadTeamMembers,
  loadRobots,
  debounce,
  throttle
};
