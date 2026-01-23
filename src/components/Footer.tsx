import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-secondary to-secondary/80 border-t-2 border-neutralborder">
      <div className="max-w-[120rem] mx-auto px-8 md:px-16 py-20">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="font-heading text-3xl uppercase text-foreground mb-4 tracking-wider">
              SkillSwap
            </h3>
            <p className="font-paragraph text-sm text-secondary-foreground leading-relaxed">
              Exchange skills, expand knowledge. Build a community of learners and teachers.
            </p>
          </motion.div>

          {/* Platform Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-heading text-lg uppercase text-foreground mb-6 tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/profiles" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link 
                  to="/my-profile" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <a 
                  href="/#how-it-works" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-heading text-lg uppercase text-foreground mb-6 tracking-wider">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="/#how-it-works" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  Getting Started
                </a>
              </li>
              <li>
                <Link 
                  to="/profiles" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  Find Teachers
                </Link>
              </li>
              <li>
                <Link 
                  to="/profiles" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  Find Learners
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-heading text-lg uppercase text-foreground mb-6 tracking-wider">
              Community
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
                >
                  Support
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-12 border-t-2 border-neutralborder"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-paragraph text-sm text-secondary-foreground font-medium">
              © {new Date().getFullYear()} SkillSwap. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link 
                to="/" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-primary transition-colors duration-300 font-medium"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
