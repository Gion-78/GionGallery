
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { applyParallaxEffect } from '../../lib/animations';

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Apply animations on component mount
  useEffect(() => {
    // Parallax effect for the background
    if (heroRef.current) {
      const cleanupParallax = applyParallaxEffect(heroRef.current, 0.3);
      return cleanupParallax;
    }
    
    // Animated entrance for the content
    if (contentRef.current) {
      setTimeout(() => {
        contentRef.current?.classList.add('animate-hero-reveal');
        contentRef.current?.classList.remove('opacity-0');
      }, 300);
    }
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        ref={heroRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://imgur.com/S7k74Jp.jpg')` 
        }}
      ></div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
      
      {/* Content */}
      <div className="container relative mx-auto h-full flex flex-col justify-center items-center px-6 md:px-12 text-center">
        <div ref={contentRef} className="max-w-4xl mx-auto opacity-0">
          <h1 className="font-onePiece text-4xl md:text-6xl lg:text-7xl text-foreground mb-4">
            <span className="text-primary">ONE PIECE</span> FIGHTING PATH
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your ultimate destination for official news, exclusive leaks, and stunning artwork from the One Piece Fighting Path game.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/leaks" 
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-md transition-all duration-300 hover:bg-primary/90 hover-glow"
            >
              Latest Leaks
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              to="/artwork" 
              className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-secondary-foreground rounded-md transition-all duration-300 hover:bg-secondary/80 hover-lift"
            >
              View Artwork
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator - fixed alignment issue by properly centering with flex and transform */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center animate-bounce">
        <span className="text-muted-foreground text-sm mb-2">Scroll Down</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-primary"
        >
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
