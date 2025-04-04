
import { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { observeElements, fadeInUp } from '../lib/animations';

const About = () => {
  useEffect(() => {
    // Apply animations to elements as they come into view
    const fadeObserver = observeElements('.animate-on-scroll', fadeInUp);
    
    return () => {
      if (fadeObserver) {
        fadeObserver.disconnect();
      }
    };
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')` 
          }}
        ></div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
        
        <div className="container relative mx-auto h-full flex flex-col justify-center items-center px-6 md:px-12 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="font-onePiece text-4xl md:text-6xl lg:text-7xl text-foreground mb-4">
              <span className="text-primary">ABOUT</span> US
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Dedicated to bringing you the latest news, leaks, and content from One Piece Fighting Path.
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission Section */}
      <section className="container mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="animate-on-scroll">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              We are passionate fans of One Piece Fighting Path, committed to providing the community with the most accurate, up-to-date information about the game. Our goal is to be the go-to resource for players looking to stay informed about new content, strategies, and events.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-8 rounded-lg text-center hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Community First</h3>
              <p className="text-muted-foreground">
                We believe in fostering a welcoming, inclusive community where all One Piece fans can connect and share their passion.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-lg text-center hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality Content</h3>
              <p className="text-muted-foreground">
                We are committed to delivering high-quality, well-researched information that players can rely on to enhance their gaming experience.
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-lg text-center hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Passion Driven</h3>
              <p className="text-muted-foreground">
                Our team is fueled by a genuine love for One Piece and a dedication to sharing that enthusiasm with fellow fans around the world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
