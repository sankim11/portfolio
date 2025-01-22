const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          About Me
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="/profile.jpg"
              alt="Profile"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div>
            <p className="text-gray-600 mb-6">
              Results-oriented Software Engineer with expertise in full-stack
              development and a Bachelor of Science in Software Engineering from
              the University of Calgary. Passionate about delivering innovative,
              high-impact applications that drive business success.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Frontend</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>React</li>
                  <li>Vue.js</li>
                  <li>Angular</li>
                  <li>Flutter</li>
                  <li>JavaScript</li>
                  <li>HTML</li>
                  <li>SCSS</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Backend</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>Node.js</li>
                  <li>Django</li>
                  <li>TypeScript</li>
                  <li>Python</li>
                  <li>C#</li>
                  <li>PHP</li>
                  <li>PostgreSQL</li>
                  <li>MySQL</li>
                  <li>MongoDB</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">DevOps</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>AWS</li>
                  <li>Azure</li>
                  <li>Kubernetes</li>
                  <li>Rancher</li>
                  <li>Docker</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
