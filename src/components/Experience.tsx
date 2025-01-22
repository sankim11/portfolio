const experiences = [
  {
    company: "Munitora Livestock Management Solutions Inc.",
    position: "Co-Founder & CTO",
    period: "November 2023 - Present",
    description:
      "Led the development of AI-powered solutions and scalable infrastructure for livestock management.",
  },
  {
    company: "BTG Pactual",
    position: "Full Stack Software Engineer",
    period: "January 2024 - June 2024",
    description:
      "Optimized backend systems and streamlined data handling for scalable banking applications.",
  },
  {
    company: "Motiv",
    position: "Full Stack Software Engineer",
    period: "September 2023 - April 2024",
    description:
      "Developed AI-powered tools and integrated scalable full-stack solutions for seamless performance.",
  },
  {
    company: "BTG Pactual",
    position: "Full Stack Software Engineer Intern",
    period: "September 2023 - April 2024",
    description:
      "Enhanced financial reporting systems and optimized backend features to meet compliance requirements.",
  },
];
const Experience = () => {
  return (
    <section id="experience" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Work Experience
        </h2>
        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {exp.position}
                  </h3>
                  <p className="text-blue-600">{exp.company}</p>
                </div>
                <span className="text-gray-500 mt-2 md:mt-0">{exp.period}</span>
              </div>
              <p className="text-gray-600">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
