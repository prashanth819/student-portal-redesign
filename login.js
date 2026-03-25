document.addEventListener("DOMContentLoaded", () => {
  // 1. Password Visibility Toggle
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      togglePassword.innerHTML = type === "password" ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash" style="color: white;"></i>';
    });
  }

  // 2. Submit Button Intercept & Simulation
  const loginForm = document.getElementById("loginForm");
  const btnSubmit = document.querySelector(".btn-submit");

  if (loginForm && btnSubmit) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault(); // Intercept real submission
      
      const icon = btnSubmit.querySelector('.btn-icon');
      const textSpan = btnSubmit.querySelector('span');

      textSpan.innerText = 'Authenticating...';
      if(icon) {
        icon.className = 'fa-solid fa-circle-notch fa-spin';
      }
      
      btnSubmit.style.opacity = '0.8';
      btnSubmit.style.pointerEvents = 'none';

      // Simulate network request before redirecting to dashboard
      setTimeout(() => {
        textSpan.innerText = 'Access Granted';
        if(icon) {
          icon.className = 'fa-solid fa-check';
        }
        btnSubmit.style.background = 'linear-gradient(135deg, #059669, #047857)';
        
        setTimeout(() => {
          window.location.href = "index.html"; // The SPA dashboard root
        }, 500);
      }, 1500);
    });
  }

  // 3. Immersive Physics: 3D Magnetic Tilt Effect
  const container = document.querySelector('.login-container');
  const card = document.querySelector('.login-split-layout');
  
  if (container && card && window.innerWidth > 960) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate rotation based on cursor pos (subtle)
      const rotateX = -(y / rect.height) * 12; // Max 6 deg
      const rotateY = (x / rect.width) * 12;  // Max 6 deg
      
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    container.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  }

  // 4. Mathematical WebGL/Canvas Particle System (Constellation)
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles;

  function initParticles() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    particles = [];
    // Dynamically calculate particle density against resolution
    const particleCount = Math.floor((width * height) / 10000);
    // Cap to ensure performance
    const maxParticles = Math.min(particleCount, 120);

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.5 + 0.5;
      this.baseAlpha = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around bounds seamlessly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 163, 184, ${this.baseAlpha})`;
      ctx.fill();
    }
  }

  // Optimize with requestAnimationFrame
  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      // Draw faint constellation linkages based on hypotenuse distance
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;
        
        // Link radius calculation logic (100px ^ 2 = 10000)
        if (distSq < 15000) {
          const dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.15 - dist / 800})`; // Fades out over distance
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(renderParticles);
  }

  // Handle resizing gracefully
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initParticles, 200);
  });
  
  // Power it on
  initParticles();
  renderParticles();
});
