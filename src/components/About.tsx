const About = () => {
  return (
    <>
      <section id="about" style={{ padding: '140px 0' }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 3fr',
              gap: 80,
            }}
            className="about-grid"
          >
            <div>
              <span className="label">§.01 — About</span>
            </div>
            <div className="enter">
              <p
                className="font-display"
                style={{
                  fontSize: 'clamp(28px, 3.6vw, 48px)',
                  lineHeight: 1.18,
                  color: 'var(--fg)',
                  fontWeight: 300,
                  maxWidth: '24ch',
                  marginBottom: 56,
                  letterSpacing: '-0.01em',
                }}
              >
                A through-line in my work —{' '}
                <em style={{ color: 'var(--gold)' }}>
                  matching people to opportunity.
                </em>
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 56,
                  maxWidth: '78ch',
                }}
                className="about-paras"
              >
                <p style={{ fontSize: 16, color: 'var(--body)' }}>
                  Full-stack engineer with production experience across PHP,
                  TypeScript, and C# in fintech and multi-client SaaS. Built
                  real-time data pipelines at{' '}
                  <span style={{ color: 'var(--fg)' }}>BTG Pactual</span> —
                  Latin America's largest investment bank — and engineered data
                  warehouses integrating four external APIs. Currently shipping
                  across twelve concurrent client platforms at Motiv, where I
                  own the Stripe integration powering three production apps.
                </p>
                <p style={{ fontSize: 16, color: 'var(--body)' }}>
                  Co-founded{' '}
                  <span style={{ color: 'var(--fg)' }}>Munitora</span> and led a
                  team of five engineers; won $50K at the U of Calgary × TC
                  Energy Ingenuity Pitch Competition. At Motiv I built an
                  AI-powered hiring platform for youth, and I'm now extending
                  that work into{' '}
                  <em
                    style={{
                      fontFamily: "'Fraunces',serif",
                      color: 'var(--fg)',
                    }}
                  >
                    Ponte
                  </em>{' '}
                  — connecting Brazilian favela youth to first-job employers.
                  CS grad from Schulich. Speaks English, Portuguese, Korean,
                  and Spanish. Currently learning French.
                </p>
              </div>

              <div
                style={{
                  marginTop: 64,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 32,
                  borderTop: '1px solid var(--line)',
                  paddingTop: 28,
                  maxWidth: '78ch',
                }}
              >
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>
                    Years
                  </div>
                  <div
                    className="font-display"
                    style={{ fontSize: 34, color: 'var(--fg)' }}
                  >
                    3+
                  </div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>
                    Platforms
                  </div>
                  <div
                    className="font-display"
                    style={{ fontSize: 34, color: 'var(--fg)' }}
                  >
                    12
                  </div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>
                    Languages
                  </div>
                  <div
                    className="font-display"
                    style={{ fontSize: 34, color: 'var(--fg)' }}
                  >
                    04
                  </div>
                </div>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>
                    Pitch prize
                  </div>
                  <div
                    className="font-display"
                    style={{ fontSize: 34, color: 'var(--gold)' }}
                  >
                    $50K
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="hairline"></div>
      </div>
    </>
  );
};

export default About;
