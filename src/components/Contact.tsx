const Contact = () => {
  return (
    <section id="contact" style={{ padding: '160px 0 100px' }}>
      <div className="wrap">
        <span className="label">§.06 — Contact</span>
        <h2
          className="font-display enter"
          style={{
            fontSize: 'clamp(56px, 11vw, 180px)',
            color: 'var(--fg)',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            marginTop: 24,
            marginBottom: 56,
          }}
        >
          Let's build
          <br />
          something <em style={{ color: 'var(--gold)' }}>durable.</em>
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 60,
            alignItems: 'end',
          }}
          className="contact-grid"
        >
          <div>
            <a
              href="mailto:davidsankim02@gmail.com"
              className="font-display ulink ulink-gold"
              data-cursor="text"
              style={{
                fontSize: 'clamp(28px, 4vw, 56px)',
                fontStyle: 'italic',
                fontWeight: 300,
              }}
            >
              davidsankim02@gmail.com
            </a>
            <div
              style={{
                display: 'flex',
                gap: 28,
                marginTop: 40,
                flexWrap: 'wrap',
              }}
            >
              <a
                href="https://linkedin.com/in/davidskim11"
                className="ulink label"
                data-cursor="hover"
              >
                LinkedIn ↗
              </a>
              <a
                href="https://github.com/sankim11"
                className="ulink label"
                data-cursor="hover"
              >
                GitHub ↗
              </a>
              <a
                href="tel:+18254547093"
                className="ulink label"
                data-cursor="hover"
              >
                +1 (825) 454-7093
              </a>
            </div>
          </div>
          {/* <div style={{ textAlign: 'right' }} className="contact-meta">
            <div className="label" style={{ marginBottom: 8 }}>
              Currently
            </div>
            <p
              style={{
                color: 'var(--fg)',
                fontFamily: "'Fraunces', serif",
                fontSize: 22,
                lineHeight: 1.3,
                fontWeight: 300,
                maxWidth: '28ch',
                marginLeft: 'auto',
              }}
            >
              Based in Calgary. Open to full-stack roles, contracts, and
              mission-aligned founder work.
            </p>
          </div> */}
        </div>

        <div className="hairline" style={{ marginTop: 100 }}></div>
        <footer
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 28,
          }}
          className="label"
        >
          <span>© MMXXVI · D.S. Kim</span>
          <span>Set in Fraunces &amp; Inter</span>
          <span>Designed &amp; engineered by hand</span>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
