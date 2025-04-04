import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background border-t border-border/20">
      <div className="container mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="inline-block">
              <div className="flex items-center">
                <img 
                  src="/images/gion-logo.png" 
                  alt="Gion" 
                  className="h-20 mr-2" 
                />
                <span className="text-lg text-foreground font-serif italic font-bold">Gallery</span>
              </div>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm max-w-md">
              The ultimate source for beautiful artwork and gallery exhibits.
            </p>
          </div>
          
          <div>
            <h3 className="font-medium text-foreground mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mt-2">
              <a 
                href="https://discord.com/invite/3aRvpgKxgx" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-secondary rounded-full p-2 text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all duration-300"
                aria-label="Discord"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5" 
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-secondary rounded-full p-2 text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-all duration-300"
                aria-label="Telegram"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5" 
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.064-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest updates and exclusive content.
            </p>
          </div>
        </div>
        
        <div className="border-t border-border/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm text-center md:text-left">
            © {currentYear} Gion Gallery. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            An artistic showcase of creative works.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
