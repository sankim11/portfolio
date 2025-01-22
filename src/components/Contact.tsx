import { Mail, Linkedin, Github } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Get in Touch
        </h2>
        <div className="max-w-xl mx-auto text-center mb-12">
          <p className="text-gray-600">
            I’m always excited to connect and collaborate on innovative
            projects, creative ideas, or opportunities to bring your vision to
            life.
          </p>
        </div>
        <div className="flex justify-center space-x-8">
          <a
            href="mailto:davidsankim02@gmail.com"
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Mail size={24} className="mr-2" />
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/davidskim11/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Linkedin size={24} className="mr-2" />
            LinkedIn
          </a>
          <a
            href="https://github.com/sankim11"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <Github size={24} className="mr-2" />
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
};

export default Contact;
