import LayerField from '../components/LayerField';
import { profile } from '../data/profile';

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
            href={`mailto:${profile.email}`}
            className="btn btn-primary"
            data-reveal
            data-i="5"
          >
            {profile.email}
          </a>
          <div className="closing-links" data-reveal data-i="6">
            <a className="text-link" href={profile.linkedin}>
              LinkedIn
            </a>
            <a className="text-link" href={profile.github}>
              GitHub
            </a>
            <a className="text-link" href={`tel:${profile.phone.replace(/[^+\d]/g, '')}`}>
              {profile.phone}
            </a>
          </div>
        </div>
        <footer className="footer">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span>Set in Geist. Designed and engineered by hand.</span>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
