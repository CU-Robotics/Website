/**
 * CU Robotics - Homepage interactions
 * The lineup's alliance toggle and the click-to-play highlight reel.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAllianceToggle();
  initReelPlayer();
});

// Swaps the lineup between the blue and red alliance photos.
function initAllianceToggle() {
  const lineup = document.querySelector('.lineup');
  if (!lineup) return;

  const buttons = lineup.querySelectorAll('.alliance-toggle button');
  const images = {
    blue: lineup.querySelector('.lineup-img-blue'),
    red: lineup.querySelector('.lineup-img-red')
  };

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const alliance = button.dataset.alliance;
      lineup.dataset.alliance = alliance;

      buttons.forEach(other => {
        other.setAttribute('aria-pressed', String(other === button));
      });

      Object.entries(images).forEach(([color, image]) => {
        image?.toggleAttribute('aria-hidden', color !== alliance);
      });
    });
  });
}

// Loads the YouTube player only when someone asks to watch.
function initReelPlayer() {
  const player = document.querySelector('.reel-player');
  const facade = player?.querySelector('.reel-facade');
  if (!player || !facade) return;

  facade.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${player.dataset.videoId}?autoplay=1&rel=0`;
    iframe.title = 'CU Robotics 2025 highlight reel';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
    player.classList.add('is-playing');
    iframe.focus();
  });
}
