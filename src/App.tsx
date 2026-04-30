import { useEffect } from 'react';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import OffHours from './components/OffHours';
import Contact from './components/Contact';

function App() {
  useEffect(() => {
    // ============== Theme ==============
    const root = document.documentElement;
    const stored = localStorage.getItem('dsk-theme');
    root.setAttribute('data-theme', stored || 'light');
    const themeToggle = document.getElementById('themeToggle');
    const onThemeClick = () => {
      const cur = root.getAttribute('data-theme') || 'light';
      const next = cur === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('dsk-theme', next);
    };
    themeToggle?.addEventListener('click', onThemeClick);

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // ============== Headline char reveal ==============
    document.querySelectorAll<HTMLElement>('#heroHeadline .rc').forEach((el, i) => {
      el.classList.add('reveal-char');
      el.style.animationDelay = 60 + i * 35 + 'ms';
      requestAnimationFrame(() => el.classList.add('in'));
    });

    // ============== Section enter ==============
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('in');
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.enter').forEach((el) => io.observe(el));

    // ============== Sticky nav condensing ==============
    const nav = document.getElementById('nav');
    const links = document.querySelectorAll<HTMLElement>('.nav-link');
    const indicator = document.getElementById('navIndicator');
    const sectionMap = ['about', 'work', 'experience', 'offhours', 'contact'];

    function updateNavIndicator() {
      let active: string | null = null;
      sectionMap.forEach((id) => {
        const s = document.getElementById(id);
        if (!s) return;
        const r = s.getBoundingClientRect();
        if (r.top <= 140 && r.bottom > 140) active = id;
      });
      if (!active) {
        if (indicator) indicator.style.opacity = '0';
        return;
      }
      const link = document.querySelector<HTMLElement>(
        `.nav-link[data-section="${active}"]`
      );
      if (!link || !indicator) return;
      const lr = link.getBoundingClientRect();
      const pr = (link.parentElement as HTMLElement).getBoundingClientRect();
      indicator.style.left = lr.left - pr.left + 'px';
      indicator.style.width = lr.width + 'px';
      indicator.style.opacity = '1';
    }

    const onScroll = () => {
      if (window.scrollY > 24) nav?.classList.add('condensed');
      else nav?.classList.remove('condensed');
      updateNavIndicator();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(updateNavIndicator, 200);
    // Touch links to silence "links is unused" if tree-shaken
    void links;

    // ============== Custom cursor + magnetic ==============
    const dot = document.getElementById('curDot');
    const ring = document.getElementById('curRing');
    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    let cursorRaf = 0;

    const cursorEnabled =
      !reduced && window.matchMedia('(min-width: 901px)').matches;

    const cursorEnterHandlers = new WeakMap<Element, EventListener>();
    const cursorLeaveHandlers = new WeakMap<Element, EventListener>();
    const magnetMoveHandlers = new WeakMap<Element, EventListener>();
    const magnetLeaveHandlers = new WeakMap<Element, EventListener>();

    const onMouseMoveCursor = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot) dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    };

    if (cursorEnabled && dot && ring) {
      window.addEventListener('mousemove', onMouseMoveCursor);
      const tick = () => {
        rx += (mx - rx) * 0.18;
        ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
        cursorRaf = requestAnimationFrame(tick);
      };
      tick();

      document
        .querySelectorAll<HTMLElement>('[data-cursor]')
        .forEach((el) => {
          const enter = () => {
            const m = el.dataset.cursor;
            ring.classList.remove('hover', 'text');
            if (m === 'hover') ring.classList.add('hover');
            if (m === 'text') ring.classList.add('text');
          };
          const leave = () => {
            ring.classList.remove('hover', 'text');
          };
          el.addEventListener('mouseenter', enter);
          el.addEventListener('mouseleave', leave);
          cursorEnterHandlers.set(el, enter);
          cursorLeaveHandlers.set(el, leave);
        });

      document
        .querySelectorAll<HTMLElement>('[data-magnet]')
        .forEach((el) => {
          const move = (ev: Event) => {
            const e = ev as MouseEvent;
            const r = el.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
            const dy = (e.clientY - (r.top + r.height / 2)) * 0.25;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
          };
          const leave = () => {
            el.style.transform = '';
          };
          el.addEventListener('mousemove', move);
          el.addEventListener('mouseleave', leave);
          magnetMoveHandlers.set(el, move);
          magnetLeaveHandlers.set(el, leave);
        });
    } else {
      if (dot) dot.style.display = 'none';
      if (ring) ring.style.display = 'none';
    }

    // ============== Hero parallax ==============
    const onParallax = () => {
      const orb = document.querySelector<HTMLElement>('.orb');
      const y = Math.min(window.scrollY, 800);
      if (orb) (orb.style as any).translate = `0 ${y * 0.25}px`;
    };
    if (!reduced) {
      window.addEventListener('scroll', onParallax, { passive: true });
    }

    // ============== Responsive ==============
    function applyResponsive() {
      const small = window.innerWidth < 820;
      document
        .querySelectorAll<HTMLElement>(
          '.about-grid, .exp-grid, .hero-grid, .contact-grid, .about-paras'
        )
        .forEach((el) => {
          if (small) {
            el.style.gridTemplateColumns = '1fr';
            el.style.gap = '32px';
          } else {
            el.style.gridTemplateColumns = '';
            el.style.gap = '';
          }
        });
      const rail = document.getElementById('hobbyList');
      if (rail)
        rail.style.gridTemplateColumns = small
          ? 'repeat(2, 1fr)'
          : 'repeat(5, 1fr)';
      document.querySelectorAll<HTMLElement>('.pcard').forEach((el) => {
        if (small) {
          el.style.gridTemplateColumns = '1fr';
          el.querySelectorAll<HTMLElement>('[style*="order"]').forEach(
            (c) => (c.style.order = '')
          );
        }
      });
      document
        .querySelectorAll<HTMLElement>('.contact-meta')
        .forEach((el) => {
          el.style.textAlign = small ? 'left' : 'right';
        });
    }
    applyResponsive();
    window.addEventListener('resize', applyResponsive);

    return () => {
      themeToggle?.removeEventListener('click', onThemeClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onParallax);
      window.removeEventListener('resize', applyResponsive);
      window.removeEventListener('mousemove', onMouseMoveCursor);
      if (cursorRaf) cancelAnimationFrame(cursorRaf);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <Cursor />
      <Nav />
      <Hero />
      <div className="wrap">
        <div className="hairline"></div>
      </div>
      <About />
      <Projects />
      <Experience />
      <Skills />
      <OffHours />
      <Contact />
    </>
  );
}

export default App;
