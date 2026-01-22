import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-secondary">
      <div className="max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h3 className="font-heading text-2xl uppercase text-foreground mb-4">
              SkillSwap
            </h3>
            <p className="font-paragraph text-sm text-secondary-foreground">
              Exchange skills, expand knowledge. Build a community of learners and teachers.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-heading text-lg uppercase text-foreground mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/profiles" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  Browse Profiles
                </Link>
              </li>
              <li>
                <Link 
                  to="/my-profile" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <a 
                  href="/#how-it-works" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading text-lg uppercase text-foreground mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/#how-it-works" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  Getting Started
                </a>
              </li>
              <li>
                <Link 
                  to="/profiles" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  Find Teachers
                </Link>
              </li>
              <li>
                <Link 
                  to="/profiles" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  Find Learners
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-heading text-lg uppercase text-foreground mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutralborder">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-paragraph text-sm text-secondary-foreground">
              © {new Date().getFullYear()} SkillSwap. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link 
                to="/" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/" 
                className="font-paragraph text-sm text-secondary-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
