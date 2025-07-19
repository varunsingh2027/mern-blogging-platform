import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold">BlogPlatform</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              A modern blogging platform where writers share their thoughts and readers discover amazing content. 
              Join our community of passionate writers and engaged readers.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiGithub size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiTwitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiLinkedin size={20} />
              </a>
              <a
                href="mailto:hello@blogplatform.com"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiMail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/?category=Technology" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link 
                  to="/?category=Lifestyle" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link 
                  to="/?category=Travel" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Travel
                </Link>
              </li>
              <li>
                <Link 
                  to="/?category=Business" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link 
                  to="/?category=Health" 
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Health
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BlogPlatform. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link 
              to="/privacy" 
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms
            </Link>
            <Link 
              to="/cookies" 
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
