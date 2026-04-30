const Nav = () => {
  return (
    <nav className="sticky-nav" id="nav">
      <div
        className="wrap"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 22,
          paddingBottom: 22,
          position: 'relative',
        }}
      >
        <a
          href="#top"
          className="font-display"
          style={{
            fontSize: 18,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
            fontStyle: 'italic',
          }}
          data-cursor="hover"
        >
          David San Kim
        </a>
        <div
          id="navLinks"
          style={{
            display: 'flex',
            gap: 36,
            alignItems: 'center',
            position: 'relative',
          }}
          className="hidden md:flex"
        >
          <a
            href="#about"
            className="label nav-link"
            data-section="about"
            data-cursor="hover"
          >
            About
          </a>
          <a
            href="#work"
            className="label nav-link"
            data-section="work"
            data-cursor="hover"
          >
            Work
          </a>
          <a
            href="#experience"
            className="label nav-link"
            data-section="experience"
            data-cursor="hover"
          >
            Experience
          </a>
          <a
            href="#offhours"
            className="label nav-link"
            data-section="offhours"
            data-cursor="hover"
          >
            Off-hours
          </a>
          <a
            href="#contact"
            className="label nav-link"
            data-section="contact"
            data-cursor="hover"
          >
            Contact
          </a>
          <span
            className="nav-indicator"
            id="navIndicator"
            style={{ opacity: 0 }}
          ></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span className="label" style={{ fontSize: 10 }}>
            DARK
          </span>
          <div
            className="theme-toggle"
            id="themeToggle"
            data-cursor="hover"
            role="button"
            aria-label="Toggle theme"
          ></div>
          <span className="label" style={{ fontSize: 10 }}>
            LIGHT
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
