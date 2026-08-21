(function initSiteComponents() {
const { config, escapeHTML, fetchJSON } = window.CURobotics;

function renderNavigation(activePage, listClass) {
  return `
    <ul class="${listClass}">
      ${config.navigation.map(item => `
        <li><a href="${item.href}" ${activePage === item.id ? 'class="active" aria-current="page"' : ''}>${item.label}</a></li>
      `).join('')}
    </ul>
  `;
}

function renderDiscordButton(size = '') {
  const sizeClass = size ? ` ${size}` : '';
  return `
    <a href="${config.links.discord}" target="_blank" rel="noopener" class="btn btn-outline btn-discord${sizeClass}">
      <img src="images/Icons/discord-icon.png" alt="">Join Discord
    </a>
  `;
}

function renderSocialLinks() {
  const socialLinks = [
    { label: 'Instagram', href: config.links.instagram, icon: 'instagram-icon.png' },
    { label: 'Discord', href: config.links.discord, icon: 'discord-icon.png' },
    { label: 'YouTube', href: config.links.youtube, icon: 'youtube-icon.png' }
  ];

  return socialLinks.map(link => `
    <a href="${link.href}" target="_blank" rel="noopener" aria-label="${link.label}">
      <img src="images/Icons/${link.icon}" alt="${link.label}">
    </a>
  `).join('');
}

function loadHeader(activePage) {
  const headerHTML = `
  <nav class="navbar">
    <div class="container navbar-content">
      <a href="index.html" class="logo">
        <img src="images/cu-robotics-logo.png" alt="CU Robotics Logo">
        <span class="logo-text">CU <span>Robotics</span></span>
      </a>

      ${renderNavigation(activePage, 'nav-links')}

      <button class="mobile-menu-btn" aria-label="Toggle menu" aria-controls="mobile-menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>

  <div id="mobile-menu" class="mobile-menu">
    ${renderNavigation(activePage, 'mobile-nav-links')}
    <div class="mobile-cta">
      ${renderDiscordButton()}
      <a href="${config.links.apply}" target="_blank" rel="noopener" class="btn btn-apply mobile-apply-btn">Apply</a>
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
            <img src="images/cu-robotics-logo.png" alt="CU Robotics">
            <span>CU Robotics</span>
          </div>
          <div class="footer-socials">${renderSocialLinks()}</div>
        </div>

        <div class="footer-nav-group">
          <div class="footer-nav">
            <h4 class="footer-heading">Navigation</h4>
            <ul class="footer-links">
              <li><a href="index.html">Home</a></li>
              <li><a href="team.html">Leadership</a></li>
              <li><a href="achievements.html">Achievements</a></li>
              <li><a href="contact.html">Contact</a></li>
            </ul>
          </div>

          <div class="footer-nav">
            <h4 class="footer-heading">Resources</h4>
            <ul class="footer-links">
              <li><a href="https://www.arc-robotics.org/" target="_blank" rel="noopener">ARC Robotics</a></li>
              <li><a href="${config.links.apply}" target="_blank" rel="noopener">Join the Team</a></li>
            </ul>
          </div>
        </div>

      </div>

      <div class="footer-bottom">
        <p class="footer-copyright">
          &copy; 2026 <a href="https://www.colorado.edu/" target="_blank" rel="noopener">CU Robotics</a> | University of Colorado Boulder
        </p>
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
    const data = await fetchJSON('data/sponsors.json');
    const sponsors = data.sponsors;

    // Create sponsor item HTML
    function createSponsorHTML(sponsor) {
      const iconHTML = sponsor.icon
        ? `<img src="${escapeHTML(sponsor.icon)}" alt="${escapeHTML(sponsor.name)}" class="sponsor-icon">`
        : '';
      return `
        <a href="${escapeHTML(sponsor.url)}" target="_blank" rel="noopener" class="sponsor-item">
          ${iconHTML}
          <span>${escapeHTML(sponsor.name)}</span>
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
    track.querySelectorAll('.sponsor-icon').forEach(icon => {
      icon.addEventListener('error', () => icon.remove());
    });
  } catch (error) {
    console.error('Error loading sponsors:', error);
  }
}

loadHeader(document.body.dataset.page);
loadFooter();
loadSponsors();
})();
