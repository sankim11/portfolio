import { ExternalLink, Github } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const projects = [
  {
    title: "Library Management Website",
    description:
      "An intuitive library management platform designed to streamline the process of managing books, members, and loans for efficient library operations.",
    image:
      "https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    technologies: [
      "React",
      "Tailwing CSS",
      "TypeScript",
      "Vite",
    ],
    // github: "https://github.com/sankim11/library-management",
    // live: "https://munitora.com.br/",
  },
  {
    title: "Library Management System",
    description:
      "A comprehensive library management system built with Symfony, featuring functionalities for managing books, members, loans, and reservations, with robust validation, modular design, and API-first development.",
    image:
      "https://plus.unsplash.com/premium_photo-1677567996070-68fa4181775a?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    technologies: [
      "Symfony",
      "PHP",
      "PostgreSQL",
      "ORM",
      "JSON-based RESTful API",
    ],
    github: "https://github.com/sankim11/library-management",
    // live: "https://munitora.com.br/",
  },
  {
    title: "Munitora Promotional Website",
    description:
      "A promotional website designed to introduce Munitora's innovative livestock management solutions, featuring a responsive design and seamless navigation to showcase the company's vision and offerings.",
    image:
      "https://image.pitchbook.com/zImyuRx6jpUoQJ6Jo4c7LYWy8QO1723800342929_200x200",
    technologies: ["React", "JavaScript", "AWS"],
    // github: "https://github.com",
    live: "https://munitora.com.br/",
  },
  {
    title: "Deforestation Monitoring System",
    description:
      "A platform to monitor, analyze, and report deforestation in the Amazon and other regions of Brazil. Development will begin soon. Stay tuned for updates!",
    image:
      "https://plus.unsplash.com/premium_photo-1719955783013-218981c48c89?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    technologies: ["Django", "React", "TypeScript", "MongoDB", "AWS", "GCP"],
    // github: "https://github.com",
    //live: "https://munitora.com.br/",
  },
];

const Projects = () => {
  return (
    <section id="projects" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          Featured Projects
        </h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="pb-12"
        >
          {projects.map((project, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow h-full">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-4">
                    {project.github && ( // Render only if GitHub link exists
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <Github size={20} className="mr-1" />
                        Code
                      </a>
                    )}
                    {project.live && ( // Render only if Live Demo link exists
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <ExternalLink size={20} className="mr-1" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Projects;
