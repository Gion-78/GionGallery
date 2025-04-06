import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  Image, 
  Info, 
  LogIn,
  LogOut,
  User,
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube 
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface NavigationMenuProps {
  isOpen: boolean;
  onLoginClick?: () => void;
  currentUser?: FirebaseUser | null;
  onLogout?: () => Promise<void>;
}

const NavigationMenu = ({ isOpen, onLoginClick, currentUser, onLogout }: NavigationMenuProps) => {
  return (
    <div
      className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-lg transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full justify-center items-center">
        <nav className="flex flex-col items-center justify-center space-y-8 my-auto">
          <Link 
            to="/" 
            className="group flex items-center text-2xl font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            <Home className="w-5 h-5 mr-3 text-primary" />
            <span className="link-hover">Home</span>
          </Link>
          
          <Link 
            to="/leaks" 
            className="group flex items-center text-2xl font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            <FileText className="w-5 h-5 mr-3 text-primary" />
            <span className="link-hover">Leaks</span>
          </Link>
          
          <Link 
            to="/artwork" 
            className="group flex items-center text-2xl font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            <Image className="w-5 h-5 mr-3 text-primary" />
            <span className="link-hover">Artwork</span>
          </Link>
          
          <Link 
            to="/about" 
            className="group flex items-center text-2xl font-medium text-foreground hover:text-primary transition-colors duration-300"
          >
            <Info className="w-5 h-5 mr-3 text-primary" />
            <span className="link-hover">About</span>
          </Link>
          
          {currentUser ? (
            <>
              <div className="flex items-center text-2xl font-medium text-foreground">
                <User className="w-5 h-5 mr-3 text-primary" />
                <span className="text-primary">{currentUser.email?.split('@')[0]}</span>
              </div>
              
              <button
                onClick={onLogout}
                className="group flex items-center text-2xl font-medium text-foreground hover:text-primary transition-colors duration-300"
              >
                <LogOut className="w-5 h-5 mr-3 text-primary" />
                <span className="link-hover">Logout</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="group flex items-center text-2xl font-medium text-foreground hover:text-primary transition-colors duration-300"
            >
              <LogIn className="w-5 h-5 mr-3 text-primary" />
              <span className="link-hover">Login</span>
            </Link>
          )}
        </nav>
        
        <div className="mt-auto mb-12 flex items-center space-x-6">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-300"
            aria-label="Facebook"
          >
            <Facebook className="w-5 h-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-300"
            aria-label="Twitter"
          >
            <Twitter className="w-5 h-5" />
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-300"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NavigationMenu;
