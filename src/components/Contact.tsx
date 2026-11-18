import LayerField from './LayerField';

const Contact = () => {
  return (
    <section id="contact" className="section">
      <div className="wrap">
        <div className="stage closing" data-scrub>
          <LayerField top={0.66} />
          <h2 className="t-display-lg grad-title" data-reveal="title" data-i="2">
            Let's build something durable.
          </h2>
          <a
            href="mailto:davidsankim02@gmail.com"
            className="btn btn-primary"
            data-reveal
            data-i="5"
          >
            davidsankim02@gmail.com
          </a>
          <div className="closing-links" data-reveal data-i="6">
            <a className="text-link" href="https://linkedin.com/in/davidskim11">
              LinkedIn
            </a>
            <a className="text-link" href="https://github.com/sankim11">
              GitHub
            </a>
            <a className="text-link" href="tel:+18254547093">
              +1 (825) 454-7093
            </a>
          </div>
        </div>
        <footer className="footer">
          <span>© 2026 David San Kim</span>
          <span>Set in Geist. Designed and engineered by hand.</span>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
