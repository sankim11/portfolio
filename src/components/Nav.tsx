import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import { profile } from '../data/profile';

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'offhours', label: 'Off-hours' },
  { id: 'contact', label: 'Contact' },
];

const Nav = () => {
  const navRef = useRef<HTMLElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () =>
      (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') ||
      'dark'
  );

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      let current: string | null = null;
      for (const { id } of links) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= 140 && r.bottom > 140) current = id;
      }
      setActive(current);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      navRef.current?.style.setProperty(
        '--sp',
        (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4)
      );
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('dsk-theme', next);
    } catch {
      /* storage unavailable */
    }
    setTheme(next);
  };

  return (
    <nav
      ref={navRef}
      className={`nav ${scrolled ? 'is-scrolled' : ''}`}
      aria-label="Primary"
    >
      <span className="nav-progress" aria-hidden />
      <a href="#top" className="nav-brand">
        {profile.name}
      </a>
      <div className="nav-links">
        {links.map((l) => (
          <a
            key={l.id}
            href={`#${l.id}`}
            className="nav-link"
            aria-current={active === l.id ? 'true' : undefined}
          >
            {l.label}
          </a>
        ))}
      </div>
      <div className="nav-actions">
        <button
          type="button"
          className="btn btn-icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a href={`mailto:${profile.email}`} className="btn btn-primary btn-sm" data-magnet>
          Email me
        </a>
      </div>
    </nav>
  );
};

export default Nav;
