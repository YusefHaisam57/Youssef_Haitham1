(() => {
  const canvas = document.getElementById("network-bg");
  const ctx = canvas?.getContext("2d");
  let width = 0, height = 0, points = [], raf = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.7);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(26, Math.min(75, Math.floor(width / 20)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
      r: Math.random() * 1.4 + .6, phase: Math.random() * Math.PI * 2
    }));
  }

  function draw(time = 0) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const maxDistance = width < 650 ? 95 : 145;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!reduceMotion) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10 || p.x > width + 10) p.vx *= -1;
        if (p.y < -10 || p.y > height + 10) p.vy *= -1;
      }
      const glow = .45 + .35 * Math.sin(time * .0008 + p.phase);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(84,215,239,${glow})`; ctx.fill();
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j], dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDistance) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(84,215,239,${(1 - dist / maxDistance) * .14})`;
          ctx.lineWidth = .7; ctx.stroke();
        }
      }
    }
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }

  if (canvas && ctx) {
    resize();
    if (reduceMotion) draw(0); else raf = requestAnimationFrame(draw);
    window.addEventListener("resize", () => { cancelAnimationFrame(raf); resize(); if (!reduceMotion) raf = requestAnimationFrame(draw); else draw(0); }, { passive: true });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealItems.forEach((item, i) => {
      item.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      observer.observe(item);
    });
  } else revealItems.forEach(item => item.classList.add("is-visible"));

  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("nav-links");
  menuToggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav-links a")];
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  }
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
