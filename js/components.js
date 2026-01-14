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
            <a href="https://instagram.com/curobotics" target="_blank" rel="noopener" aria-label="Instagram">
              <img src="images/instagram-icon.png" alt="Instagram">
            </a>
            <a href="https://discord.gg/Ym2kEbnNzg" target="_blank" rel="noopener" aria-label="Discord">
              <img src="images/discord-icon.png" alt="Discord">
            </a>
            <a href="https://youtube.com/@curobotics" target="_blank" rel="noopener" aria-label="YouTube">
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
          <a href="https://instagram.com/curobotics" target="_blank" rel="noopener" aria-label="Instagram">
            <img src="images/instagram-icon.png" alt="Instagram">
          </a>
          <a href="https://discord.gg/Ym2kEbnNzg" target="_blank" rel="noopener" aria-label="Discord">
            <img src="images/discord-icon.png" alt="Discord">
          </a>
          <a href="https://youtube.com/@curobotics" target="_blank" rel="noopener" aria-label="YouTube">
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
