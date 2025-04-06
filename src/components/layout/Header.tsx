import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NavigationMenu from '../ui/NavigationMenu';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLoginClick = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser || !currentUser.email) return 'U';
    return currentUser.email.substring(0, 1).toUpperCase();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMenuOpen ? 'bg-background/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto pr-6 md:pr-12 pl-0 md:pl-0 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="relative z-50 flex items-center pl-2"
        >
          <div className="flex items-center">
            <img 
              src="/images/gion-logo.png" 
              alt="Gion" 
              className="h-12 md:h-14 mr-1 object-contain" 
            />
            <span className="text-xl md:text-2xl text-foreground font-serif italic font-bold">Gallery</span>
          </div>
        </Link>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}>
            Home
          </Link>
          <Link to="/leaks" className={`nav-link ${location.pathname === '/leaks' ? 'nav-link-active' : ''}`}>
            Leaks
          </Link>
          <Link to="/artwork" className={`nav-link ${location.pathname === '/artwork' ? 'nav-link-active' : ''}`}>
            Artwork
          </Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'nav-link-active' : ''}`}>
            About
          </Link>
          
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="nav-link flex items-center gap-1">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden lg:inline-block">
                  {currentUser.email?.split('@')[0]}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild className="cursor-pointer">
                  <button 
                    onClick={handleLogout}
                    className="flex w-full items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link 
              to="/login"
              className="nav-link flex items-center gap-1"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Link>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="relative z-50 md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 transition-all duration-300" />
          ) : (
            <Menu className="w-6 h-6 transition-all duration-300" />
          )}
        </button>
      </div>
      
      {/* Mobile Navigation Menu */}
      <NavigationMenu isOpen={isMenuOpen} onLoginClick={handleLoginClick} currentUser={currentUser} onLogout={handleLogout} />
    </header>
  );
};

export default Header;
