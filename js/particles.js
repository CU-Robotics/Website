/**
 * CU Robotics - Particle Background Animation
 * Subtle animated geometric particles with gold accents
 */

class ParticleBackground {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.connections = [];
    this.mouse = { x: null, y: null, radius: 150 };

    // Configuration
    this.config = {
      particleCount: 80,
      particleSize: { min: 1.5, max: 4 },
      particleSpeed: 0.4,
      connectionDistance: 180,
      colors: {
        particle: 'rgba(207, 184, 124, 0.8)',      // CU Gold
        particleDim: 'rgba(207, 184, 124, 0.3)',
        connection: 'rgba(207, 184, 124, 0.15)',
        connectionHover: 'rgba(207, 184, 124, 0.4)'
      }
    };

    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.addEventListeners();
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const { particleCount, particleSize, particleSpeed } = this.config;

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (particleSize.max - particleSize.min) + particleSize.min,
        speedX: (Math.random() - 0.5) * particleSpeed,
        speedY: (Math.random() - 0.5) * particleSpeed,
        opacity: Math.random() * 0.5 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
        // Shape type: 0 = circle, 1 = square, 2 = triangle
        shape: Math.floor(Math.random() * 3)
      });
    }
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    // Track mouse for interactive connections
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }

  drawParticle(particle) {
    const { ctx } = this;
    const pulse = Math.sin(Date.now() * particle.pulseSpeed + particle.pulsePhase) * 0.3 + 0.7;
    const alpha = particle.opacity * pulse;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.config.colors.particle;
    ctx.translate(particle.x, particle.y);

    switch (particle.shape) {
      case 0: // Circle
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 1: // Square (diamond)
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
        break;

      case 2: // Triangle
        ctx.beginPath();
        ctx.moveTo(0, -particle.size * 1.5);
        ctx.lineTo(particle.size * 1.3, particle.size);
        ctx.lineTo(-particle.size * 1.3, particle.size);
        ctx.closePath();
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  drawConnections() {
    const { ctx, particles, mouse, config } = this;
    const { connectionDistance, colors } = config;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = 1 - (distance / connectionDistance);
          ctx.strokeStyle = colors.connection;
          ctx.globalAlpha = opacity * 0.5;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const dx = particles[i].x - mouse.x;
        const dy = particles[i].y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const opacity = 1 - (distance / mouse.radius);
          ctx.strokeStyle = colors.connectionHover;
          ctx.globalAlpha = opacity * 0.8;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  updateParticles() {
    for (const particle of this.particles) {
      // Move particle
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // Wrap around edges
      if (particle.x < -10) particle.x = this.canvas.width + 10;
      if (particle.x > this.canvas.width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = this.canvas.height + 10;
      if (particle.y > this.canvas.height + 10) particle.y = -10;

      // Subtle mouse interaction - push particles away slightly
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          particle.x += (dx / distance) * force * 0.5;
          particle.y += (dy / distance) * force * 0.5;
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawConnections();

    for (const particle of this.particles) {
      this.drawParticle(particle);
    }

    this.updateParticles();

    requestAnimationFrame(() => this.animate());
  }
}

// Additional floating hexagon animation
class FloatingHexagons {
  constructor() {
    this.hexagons = document.querySelectorAll('.geo-shape');
    if (this.hexagons.length === 0) return;

    this.randomizePositions();
  }

  randomizePositions() {
    this.hexagons.forEach((hex, index) => {
      // Randomize size slightly
      const scale = 0.5 + Math.random() * 1;
      hex.style.transform = `scale(${scale})`;

      // Randomize opacity
      hex.style.opacity = 0.02 + Math.random() * 0.04;

      // Randomize position more
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      hex.style.left = `${left}%`;
      hex.style.top = `${top}%`;

      // Add random animation delay
      hex.style.animationDelay = `${Math.random() * 5}s`;
    });
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize on pages with the particle canvas
  if (document.getElementById('particle-canvas')) {
    new ParticleBackground('particle-canvas');
  }

  // Initialize floating hexagons
  new FloatingHexagons();
});
