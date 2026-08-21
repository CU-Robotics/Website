(function defineSiteUtilities() {
const SITE_CONFIG = Object.freeze({
  links: Object.freeze({
    apply: 'https://forms.gle/WEQET7xzyizAgc7LA',
    discord: 'https://discord.gg/Ym2kEbnNzg',
    instagram: 'https://www.instagram.com/curoboticsteam/',
    youtube: 'https://www.youtube.com/@curoboticsteam'
  }),
  navigation: Object.freeze([
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'team', label: 'Leadership', href: 'team.html' },
    { id: 'achievements', label: 'Achievements', href: 'achievements.html' },
    { id: 'contact', label: 'Contact', href: 'contact.html' }
  ])
});

async function fetchJSON(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.CURobotics = Object.assign(window.CURobotics || {}, {
  config: SITE_CONFIG,
  escapeHTML,
  fetchJSON
});
})();
