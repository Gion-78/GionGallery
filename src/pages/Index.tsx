
import { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import HeroSection from '../components/home/HeroSection';
import LatestBanners from '../components/home/LatestBanners';
import Newsletter from '../components/home/Newsletter';
import { observeElements, animateElementsSequentially, fadeInUp } from '../lib/animations';

const Index = () => {
  useEffect(() => {
    // Apply animations to elements as they come into view
    const fadeObserver = observeElements('.animate-on-scroll', fadeInUp);
    
    // Apply sequential animations to elements that should animate one after another
    const sequentialObserver = animateElementsSequentially('.animate-sequential', fadeInUp, 200);
    
    return () => {
      if (fadeObserver) {
        fadeObserver.disconnect();
      }
      if (sequentialObserver) {
        sequentialObserver.disconnect();
      }
    };
  }, []);

  return (
    <Layout>
      <HeroSection />
      
      <div className="animate-on-scroll">
        <LatestBanners />
      </div>
      
      <div className="animate-on-scroll">
        <Newsletter />
      </div>
    </Layout>
  );
};

export default Index;
