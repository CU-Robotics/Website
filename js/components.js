// Shared components across all pages

function loadHeader(activePage) {
  const headerHTML = `
  <div class="geo-background">
    <canvas id="particle-canvas"></canvas>
  </div>

  <div class="geo-shapes">
    <div class="geo-shape hexagon"></div>
    <div class="geo-shape triangle"></div>
    <div class="geo-shape square"></div>
    <div class="geo-shape circle"></div>
    <div class="geo-shape hexagon"></div>
    <div class="geo-shape triangle"></div>
    <div class="geo-shape square"></div>
    <div class="geo-shape circle"></div>
    <div class="geo-shape hexagon"></div>
    <div class="geo-shape triangle"></div>
  </div>

  <div class="grid-overlay"></div>

  <nav class="navbar">
    <div class="container navbar-content">
      <a href="index.html" class="logo">
        <img src="images/logo.png" alt="CU Robotics Logo">
        <span class="logo-text">CU <span>Robotics</span></span>
      </a>

      <ul class="nav-links">
        <li><a href="index.html" ${activePage === 'home' ? 'class="active"' : ''}>Home</a></li>
        <li><a href="team.html" ${activePage === 'team' ? 'class="active"' : ''}>Leadership</a></li>
        <li><a href="projects.html" ${activePage === 'projects' ? 'class="active"' : ''}>Projects</a></li>
        <li><a href="achievements.html" ${activePage === 'achievements' ? 'class="active"' : ''}>Achievements</a></li>
        <li><a href="contact.html" ${activePage === 'contact' ? 'class="active"' : ''}>Contact</a></li>
      </ul>

      <div class="nav-cta">
        <a href="https://discord.gg/Ym2kEbnNzg" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="border-color:#5865F2;color:#5865F2;display:inline-flex;align-items:center;gap:6px;"><img src="images/discord-icon.png" alt="" style="width:16px;height:16px;">Join Discord</a>
      </div>

      <button class="mobile-menu-btn" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <div class="mobile-menu">
    <ul class="mobile-nav-links">
      <li><a href="index.html" ${activePage === 'home' ? 'class="active"' : ''}>Home</a></li>
      <li><a href="team.html" ${activePage === 'team' ? 'class="active"' : ''}>Leadership</a></li>
      <li><a href="projects.html" ${activePage === 'projects' ? 'class="active"' : ''}>Projects</a></li>
      <li><a href="achievements.html" ${activePage === 'achievements' ? 'class="active"' : ''}>Achievements</a></li>
      <li><a href="contact.html" ${activePage === 'contact' ? 'class="active"' : ''}>Contact</a></li>
    </ul>
    <div class="mobile-cta">
      <a href="https://discord.gg/Ym2kEbnNzg" target="_blank" rel="noopener" class="btn btn-outline" style="border-color:#5865F2;color:#5865F2;display:inline-flex;align-items:center;gap:8px;"><img src="images/discord-icon.png" alt="" style="width:18px;height:18px;">Join Discord</a>
      <a href="https://forms.gle/WEQET7xzyizAgc7LA" target="_blank" rel="noopener" class="btn btn-outline" style="margin-top:12px;">Apply to Team</a>
    </div>
  </div>
  `;

  const headerContainer = document.getElementById('site-header');
  if (headerContainer) {
    headerContainer.innerHTML = headerHTML;
  }
}

function loadFooter() {
  const footerHTML = `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="images/logo.png" alt="CU Robotics">
            <span>CU Robotics</span>
          </div>
          <p class="footer-tagline">
            Design. Build. Code. Compete. Representing the University of Colorado Boulder in ARC Robotics Competition.
          </p>
          <div class="footer-socials">
            <a href="https://www.instagram.com/curoboticsteam/" target="_blank" rel="noopener" aria-label="Instagram">
              <img src="images/instagram-icon.png" alt="Instagram">
            </a>
            <a href="https://discord.gg/Ym2kEbnNzg" target="_blank" rel="noopener" aria-label="Discord">
              <img src="images/discord-icon.png" alt="Discord">
            </a>
            <a href="https://www.youtube.com/@curoboticsteam" target="_blank" rel="noopener" aria-label="YouTube">
              <img src="images/youtube-icon.png" alt="YouTube">
            </a>
          </div>
        </div>

        <div class="footer-nav">
          <h4 class="footer-heading">Navigation</h4>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="team.html">Leadership</a></li>
            <li><a href="projects.html">Projects</a></li>
            <li><a href="achievements.html">Achievements</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>

        <div class="footer-nav">
          <h4 class="footer-heading">Resources</h4>
          <ul class="footer-links">
            <li><a href="https://www.arc-robotics.org/" target="_blank" rel="noopener">ARC Robotics</a></li>
            <li><a href="https://forms.gle/WEQET7xzyizAgc7LA" target="_blank" rel="noopener">Join the Team</a></li>
          </ul>
        </div>

        <div class="footer-newsletter">
          <h4 class="footer-heading">Stay Updated</h4>
          <p class="text-muted" style="font-size: 0.9rem; margin-bottom: var(--space-md);">
            Subscribe to get news about competitions and team updates.
          </p>
          <form class="newsletter-form" action="#" method="POST">
            <input type="email" class="newsletter-input" placeholder="Your email" required>
            <button type="submit" class="newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">
          &copy; 2026 <a href="https://www.colorado.edu/" target="_blank" rel="noopener">CU Robotics</a> | University of Colorado Boulder
        </p>
        <div class="footer-socials">
          <a href="https://www.instagram.com/curoboticsteam/" target="_blank" rel="noopener" aria-label="Instagram">
            <img src="images/instagram-icon.png" alt="Instagram">
          </a>
          <a href="https://discord.gg/Ym2kEbnNzg" target="_blank" rel="noopener" aria-label="Discord">
            <img src="images/discord-icon.png" alt="Discord">
          </a>
          <a href="https://www.youtube.com/@curoboticsteam" target="_blank" rel="noopener" aria-label="YouTube">
            <img src="images/youtube-icon.png" alt="YouTube">
          </a>
        </div>
      </div>
    </div>
  </footer>
  `;

  const footerContainer = document.getElementById('site-footer');
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }
}

// Load sponsors from JSON
async function loadSponsors() {
  const track = document.getElementById('sponsor-track');
  if (!track) return;

  try {
    const response = await fetch('data/sponsors.json');
    const data = await response.json();
    const sponsors = data.sponsors;

    // Create sponsor item HTML
    function createSponsorHTML(sponsor) {
      const iconHTML = sponsor.icon
        ? `<img src="${sponsor.icon}" alt="${sponsor.name}" class="sponsor-icon" onerror="this.style.display='none'">`
        : '';
      return `
        <a href="${sponsor.url}" target="_blank" rel="noopener" class="sponsor-item">
          ${iconHTML}
          <span>${sponsor.name}</span>
        </a>
        <span class="sponsor-divider"></span>
      `;
    }

    // Build content - repeat sponsors enough times to fill the screen
    let sponsorHTML = '';
    for (const sponsor of sponsors) {
      sponsorHTML += createSponsorHTML(sponsor);
    }

    // Create two identical tracks for seamless infinite scroll
    // Repeat the content 3x in each track to ensure no gaps
    const repeatedContent = sponsorHTML + sponsorHTML + sponsorHTML;

    track.innerHTML = `
      <div class="sponsor-ticker-content">${repeatedContent}</div>
      <div class="sponsor-ticker-content" aria-hidden="true">${repeatedContent}</div>
    `;
  } catch (error) {
    console.error('Error loading sponsors:', error);
  }
}

// Load projects from JSON
async function loadProjects() {
  const container = document.querySelector('.projects-grid');
  if (!container) return;

  try {
    const response = await fetch('data/projects.json');
    const data = await response.json();
    const projects = data.projects;

    // SVG icons for software/outreach projects
    const icons = {
      code: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--cu-gold)" stroke-width="1.5" opacity="0.8">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>`,
      eye: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--cu-gold)" stroke-width="1.5" opacity="0.8">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>`,
      users: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--cu-gold)" stroke-width="1.5" opacity="0.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`,
      tool: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--cu-gold)" stroke-width="1.5" opacity="0.8">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>`
    };

    function createProjectCard(project, index) {
      const staggerClass = `stagger-${(index % 4) + 1}`;
      const externalAttr = project.link.external ? 'target="_blank" rel="noopener"' : '';

      // Image or icon
      let imageHTML;
      if (project.image) {
        imageHTML = `<img src="${project.image}" alt="${project.title}">`;
      } else {
        const iconSVG = icons[project.icon] || icons.tool;
        imageHTML = `<div style="background: linear-gradient(135deg, var(--cu-charcoal) 0%, var(--cu-black) 100%); height: 100%; display: flex; align-items: center; justify-content: center;">
          ${iconSVG}
        </div>`;
      }

      // Tags
      const tagsHTML = project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('');

      return `
        <div class="project-card animate-on-scroll ${staggerClass}" data-category="${project.category}">
          <div class="project-image">
            ${imageHTML}
            <div class="project-overlay">
              <div class="project-tags">
                ${tagsHTML}
              </div>
            </div>
          </div>
          <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <a href="${project.link.url}" ${externalAttr} class="project-link">
              ${project.link.text}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      `;
    }

    container.innerHTML = projects.map((project, index) => createProjectCard(project, index)).join('');

    // Re-initialize animations for dynamically loaded content
    if (typeof initScrollAnimations === 'function') {
      initScrollAnimations();
    }
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}
