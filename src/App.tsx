import { useEffect } from 'react';
import Intro from './components/Intro';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import DriftBand from './components/DriftBand';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Skills from './components/Skills';
import OffHours from './components/OffHours';
import Contact from './components/Contact';
import Chat from './components/Chat';
import { initReveal, initScrollEngine } from './motion';

function App() {
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
        <Projects />
        <Experience />
        <Skills />
        <OffHours />
        <Contact />
      </main>
      <Chat />
    </>
  );
}

export default App;
