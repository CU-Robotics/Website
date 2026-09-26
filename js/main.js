/**
 * CU Robotics - Main JavaScript
 * Handles navbar and mobile-menu behaviour. Page content is static HTML.
 */

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
});

// ============================================
// NAVBAR - Scroll state and active link
// ============================================

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const scrollThreshold = 24;

  // The bar is transparent over the hero and turns solid once the page moves.
  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > scrollThreshold);
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

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
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  const pageContent = document.querySelectorAll('body > :not(#site-header):not(script)');

  if (!menuBtn || !mobileMenu) return;

  function setMenuOpen(isOpen) {
    menuBtn.classList.toggle('active', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    mobileMenu.classList.toggle('active', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    mobileMenu.toggleAttribute('inert', !isOpen);
    pageContent.forEach(element => element.toggleAttribute('inert', isOpen));
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

  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && mobileMenu.classList.contains('active')) {
      setMenuOpen(false);
    }
  });
}
