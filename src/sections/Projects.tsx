import { useRef, useState, type PointerEvent } from 'react';
import { scroller } from '../lib/motion';
import { X } from 'lucide-react';

import { projects, type Project } from '../data/projects';

type Filter = 'all' | 'live' | 'local';

const filters: { id: Filter; label: string; match: (p: Project) => boolean }[] = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'live', label: 'Live', match: (p) => p.deployed },
  { id: 'local', label: 'Local builds', match: (p) => !p.deployed },
];

const Thumb = ({ project, className }: { project: Project; className: string }) => (
  <div
    className={className}
    style={{
      background: `radial-gradient(120% 90% at 20% 0%, ${project.tone.from} 0%, ${project.tone.to} 70%)`,
    }}
    aria-hidden
  >
    <span className="card-glyph">{project.glyph}</span>
  </div>
);

const Status = ({ project }: { project: Project }) => (
  <span className="card-status">
    <span className={project.deployed ? 'dot-live' : 'dot-local'} />
    {project.deployed ? 'Live' : 'Local build'}
  </span>
);

// Tilt the card toward the pointer and move its spotlight and glyph with it.
const onCardMove = (e: PointerEvent<HTMLButtonElement>) => {
  if (e.pointerType === 'touch') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  el.style.setProperty('--ry', `${((x - 0.5) * 5).toFixed(2)}deg`);
  el.style.setProperty('--rx', `${((0.5 - y) * 5).toFixed(2)}deg`);
  el.style.setProperty('--px', (x - 0.5).toFixed(3));
  el.style.setProperty('--py', (y - 0.5).toFixed(3));
};
const onCardLeave = (e: PointerEvent<HTMLButtonElement>) => {
  for (const k of ['--rx', '--ry', '--px', '--py'])
    e.currentTarget.style.removeProperty(k);
};

const Projects = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Project | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const visible = projects.filter(filters.find((f) => f.id === filter)!.match);

  const show = (p: Project) => {
    setOpen(p);
    scroller.lenis?.stop();
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  return (
    <section id="work" className="section">
      <div className="wrap">
        <div className="section-head">
          <h2 className="t-display-lg grad-title" data-reveal="title">
            Selected work
          </h2>
          <div
            className="chips"
            role="group"
            aria-label="Filter projects"
            data-reveal
            data-i="2"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                className="chip"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="t-mono">{projects.filter(f.match).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card-grid">
          {visible.map((p, i) => (
            <button
              key={p.no}
              type="button"
              className={`card ${i === 0 && filter === 'all' ? 'card-featured' : ''}`}
              onClick={() => show(p)}
              onPointerMove={onCardMove}
              onPointerLeave={onCardLeave}
              aria-haspopup="dialog"
              data-reveal="scale"
              data-i={i % 3}
            >
              <Thumb project={p} className="card-thumb" />
              <div className="card-body">
                <span className="t-title">{p.name}</span>
                <span>{p.title}</span>
                <span className="card-meta">
                  <Status project={p} />
                  <span className="t-mono">{p.year.trim()}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby="sheet-title"
        data-lenis-prevent
        onClose={() => {
          setOpen(null);
          scroller.lenis?.start();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {open && (
          <>
            <Thumb project={open} className="sheet-thumb" />
            <button
              type="button"
              className="btn btn-icon sheet-close"
              onClick={close}
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="sheet-body">
              <div className="card-meta" style={{ marginTop: 0 }}>
                <span>{open.name}</span>
                <Status project={open} />
              </div>
              <h3 id="sheet-title" className="t-display-md grad-title">
                {open.title}
              </h3>
              <p className="t-body-lg">{open.blurb}</p>
              <dl className="sheet-stack">
                {open.stack.frontend.length > 0 && (
                  <>
                    <dt>Frontend</dt>
                    <dd>{open.stack.frontend.join(', ')}</dd>
                  </>
                )}
                {open.stack.backend.length > 0 && (
                  <>
                    <dt>Backend</dt>
                    <dd>{open.stack.backend.join(', ')}</dd>
                  </>
                )}
                {open.stack.infra.length > 0 && (
                  <>
                    <dt>Infra and tools</dt>
                    <dd>{open.stack.infra.join(', ')}</dd>
                  </>
                )}
                <dt>Role</dt>
                <dd>{open.role}</dd>
                <dt>Status</dt>
                <dd>{open.status}</dd>
                <dt>Year</dt>
                <dd>{open.year.trim()}</dd>
              </dl>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
};

export default Projects;
