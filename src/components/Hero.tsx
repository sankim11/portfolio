const heroChars = [
  { ch: 'D' },
  { ch: 'a' },
  { ch: 'v' },
  { ch: 'i' },
  { ch: 'd' },
  { ch: ' ' },
  { ch: 'S' },
  { ch: 'a' },
  { ch: 'n' },
];

const heroChars2 = [{ ch: 'K' }, { ch: 'i' }, { ch: 'm' }, { ch: '.' }];

const Hero = () => {
  return (
    <section
      id="top"
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: 120,
        paddingBottom: 80,
      }}
      className="grain"
    >
      <div className="orb" style={{ top: '-12%', left: '-8%' }}></div>

      <div className="wrap" style={{ position: 'relative', zIndex: 2 }}>
        {/* index strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 80,
          }}
        >
          <span className="label">Portfolio · MMXXVI</span>
          <span className="label">
            No. 01 / Calgary, AB · 51.04°N, 114.07°W
          </span>
        </div>

        {/* Headline row: eyebrow + name on left, marginalia note on right */}
        <div className="hero-headline-row">
          <div>
            {/* Eyebrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 36,
              }}
            >
              <span className="divider-dot"></span>
              <span className="label">Full Stack Software Engineer</span>
            </div>

            {/* Headline */}
            <h1
              className="h-display"
              id="heroHeadline"
              style={{ fontSize: 'clamp(48px, 9vw, 148px)', marginBottom: 0 }}
            >
              <span className="line">
                {heroChars.map((c, i) => (
                  <span className="rc" key={`a-${i}`}>
                    {c.ch}
                  </span>
                ))}
              </span>
              <br />
              <span
                className="line"
                style={{ fontStyle: 'italic', color: 'var(--gold)' }}
              >
                {heroChars2.map((c, i) => (
                  <span className="rc" key={`b-${i}`}>
                    {c.ch}
                  </span>
                ))}
              </span>
            </h1>
          </div>

          <aside className="hero-note enter">
            <div className="hero-note-head">
              <span className="label" style={{ color: 'var(--gold)' }}>
                §.0
              </span>
              <span className="label">A short note</span>
            </div>
            <p className="hero-note-body">
              A full-stack engineer drawn to the{' '}
              <em>edges where things overlap</em> — frontend meets
              infrastructure, data meets product, AI meets the things that
              actually ship. Daily stack is TypeScript and Nuxt on Node, with
              Postgres beneath. What I love is the whole arc — planning the
              architecture, building the thing, the small wins when it clicks
              — and right now AI is what excites me most: leverage on the
              hardest problems.
            </p>
            <div className="hero-note-foot">
              <span className="hero-note-rule" aria-hidden></span>
              <span className="label">On the work · 2026</span>
            </div>
          </aside>
        </div>

        {/* Actions + meta */}
        <div
          className="enter"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
            alignItems: 'flex-start',
            marginTop: 56,
          }}
        >
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a
              href="#work"
              className="btn btn-gold magnet"
              data-cursor="hover"
              data-magnet
            >
              Selected work →
            </a>
            <a
              href="mailto:davidsankim02@gmail.com"
              className="btn magnet"
              data-cursor="hover"
              data-magnet
            >
              Get in touch
            </a>
          </div>

          <div
            className="label"
            style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}
          >
            <span>EN · PT · KO · ES</span>
            <span>Calgary, AB</span>
            <span>Available · Q3 '26</span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="wrap"
        style={{
          position: 'absolute',
          bottom: 36,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span className="label">Scroll</span>
        <span className="label">↓ §.01 — §.06</span>
      </div>
    </section>
  );
};

export default Hero;
