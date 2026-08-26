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

function renderMobileNavigation(activePage) {
  return `
    <ul class="mobile-nav-links">
      ${config.navigation.map(item => `
        <li>
          <a href="${item.href}" ${activePage === item.id ? 'class="active" aria-current="page"' : ''}>${item.label}</a>
        </li>
      `).join('')}
    </ul>
  `;
}

function renderDiscordButton(size = '') {
  const sizeClass = size ? ` ${size}` : '';
  return `
    <a href="${config.links.discord}" target="_blank" rel="noopener" class="btn btn-outline btn-discord${sizeClass}">
      <img src="images/Icons/discord.svg" alt="">Join Discord
    </a>
  `;
}

function renderSocialLinks() {
  const socialLinks = [
    { label: 'Instagram', href: config.links.instagram, icon: 'instagram.svg' },
    { label: 'Discord', href: config.links.discord, icon: 'discord.svg' },
    { label: 'YouTube', href: config.links.youtube, icon: 'youtube.svg' }
  ];

  return socialLinks.map(link => `
    <a href="${link.href}" target="_blank" rel="noopener" aria-label="${link.label}">
      <img src="images/Icons/${link.icon}" alt="">
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

      <div class="nav-cta">
        ${renderDiscordButton('btn-sm')}
      </div>

      <button class="mobile-menu-btn" aria-label="Open navigation" aria-controls="mobile-menu" aria-expanded="false">
        <img class="menu-icon-open" src="images/Icons/bars.svg" alt="">
        <img class="menu-icon-close" src="images/Icons/xmark.svg" alt="">
      </button>
    </div>
  </nav>

  <nav id="mobile-menu" class="mobile-menu" aria-label="Mobile navigation" aria-hidden="true" inert>
    <div class="mobile-menu-inner">
      ${renderMobileNavigation(activePage)}

      <div class="mobile-cta">
        <a href="${config.links.apply}" target="_blank" rel="noopener" class="btn btn-apply btn-lg">Apply</a>
        <a href="${config.links.discord}" target="_blank" rel="noopener" class="btn btn-lg btn-icon" aria-label="Discord">
          <img src="images/Icons/discord.svg" alt="">
        </a>
        <a href="${config.links.instagram}" target="_blank" rel="noopener" class="btn btn-lg btn-icon" aria-label="Instagram">
          <img src="images/Icons/instagram.svg" alt="">
        </a>
        <a href="${config.links.youtube}" target="_blank" rel="noopener" class="btn btn-lg btn-icon" aria-label="YouTube">
          <img src="images/Icons/youtube.svg" alt="">
        </a>
      </div>
    </div>
  </nav>
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
              <li><a href="achievements.html">Timeline</a></li>
            </ul>
          </div>

          <div class="footer-nav">
            <h4 class="footer-heading">Resources</h4>
            <ul class="footer-links">
              <li><a href="https://www.arc-robotics.org/" target="_blank" rel="noopener">ARC Robotics</a></li>
              <li><a href="${config.links.apply}" target="_blank" rel="noopener">Join the Team</a></li>
            </ul>
          </div>

          <div class="footer-nav">
            <h4 class="footer-heading">Connect</h4>
            <ul class="footer-links">
              <li><a href="mailto:curobotics@colorado.edu">curobotics@colorado.edu</a></li>
              <li><span>Meetings at the Idea Forge</span></li>
              <li><a href="${config.links.discord}" target="_blank" rel="noopener">Current schedule on Discord</a></li>
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
