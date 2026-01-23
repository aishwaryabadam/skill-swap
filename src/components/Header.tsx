import { Link } from 'react-router-dom';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { member, isAuthenticated, isLoading, actions } = useMember();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-primary sticky top-0 z-50">
      <div className="max-w-[120rem] mx-auto px-8 md:px-16 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-heading text-2xl md:text-3xl uppercase text-primary-foreground">
            SkillSwap
          </Link>

          {/* Desktop Navigation */}
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-primary-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
            >
              Home
            </Link>
            <Link 
              to="/profiles" 
              className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
            >
              Browse Profiles
            </Link>
            <a 
              href="/#how-it-works" 
              className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
            >
              How It Works
            </a>
            
            {isLoading && <LoadingSpinner />}
            
            {!isLoading && !isAuthenticated && (
              <Button 
                onClick={actions.login}
                className="bg-background text-foreground hover:bg-secondary h-11 px-6 font-paragraph"
              >
                Sign In
              </Button>
            )}
            
            {!isLoading && isAuthenticated && (
              <>
                <Link 
                  to="/incoming-requests" 
                  className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
                >
                  Requests
                </Link>
                <Link 
                  to="/my-profile" 
                  className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
                >
                  {member?.profile?.nickname || 'My Profile'}
                </Link>
                <Button 
                  onClick={actions.logout}
                  variant="outline"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary h-11 px-6 font-paragraph"
                >
                  Sign Out
                </Button>
              </>
            )}
          </nav>

          </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-6 flex flex-col gap-4 pb-4">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
            >
              Home
            </Link>
            <Link 
              to="/profiles" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
            >
              Browse Profiles
            </Link>
            <a 
              href="/#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
            >
              How It Works
            </a>
            
            {isLoading && <LoadingSpinner />}
            
            {!isLoading && !isAuthenticated && (
              <Button 
                onClick={() => {
                  actions.login();
                  setMobileMenuOpen(false);
                }}
                className="bg-background text-foreground hover:bg-secondary h-11 px-6 font-paragraph w-full"
              >
                Sign In
              </Button>
            )}
            
            {!isLoading && isAuthenticated && (
              <>
                <Link 
                  to="/incoming-requests" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
                >
                  Requests
                </Link>
                <Link 
                  to="/my-profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-paragraph text-base text-primary-foreground hover:underline transition-all"
                >
                  {member?.profile?.nickname || 'My Profile'}
                </Link>
                <Button 
                  onClick={() => {
                    actions.logout();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary h-11 px-6 font-paragraph w-full"
                >
                  Sign Out
                </Button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
