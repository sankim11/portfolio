import { lazy, Suspense, useEffect } from 'react';

import DriftBand from './components/DriftBand';
import { ErrorBoundary } from './components/ErrorBoundary';
import Intro from './components/Intro';
import Nav from './components/Nav';
import { PageRail } from './components/PageRail';
import { initReveal, initScrollEngine } from './lib/motion';
import About from './sections/About';
import Contact from './sections/Contact';
import Experience from './sections/Experience';
import Hero from './sections/Hero';
import OffHours from './sections/OffHours';
import Projects from './sections/Projects';
import Skills from './sections/Skills';

// The chat is not needed for first paint, so it loads as its own chunk.
const Chat = lazy(() => import('./features/chat/Chat'));

function App() {
  // Page-wide motion: scroll reveals, smooth scrolling, scrubbed scenes.
  useEffect(() => {
    const stopReveal = initReveal();
    const stopEngine = initScrollEngine();
    return () => {
      stopReveal();
      stopEngine();
    };
  }, []);

  return (
    <>
      <Intro />
      <div className="grain" aria-hidden />
      <div className="pointer-light" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <About />
        <DriftBand />
        <Experience />
        <Projects />
        <Skills />
        <ErrorBoundary name="off-hours">
          <OffHours />
        </ErrorBoundary>
        <Contact />
      </main>
      <PageRail />
      <ErrorBoundary name="chat">
        <Suspense fallback={null}>
          <Chat />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

export default App;
