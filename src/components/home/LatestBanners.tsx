import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';

interface Banner {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
}

// Get banners from localStorage
const getBanners = (): Banner[] => {
  try {
    const storedBanners = localStorage.getItem('banners');
    if (storedBanners) {
      return JSON.parse(storedBanners);
    }
  } catch (error) {
    console.error('Error loading banners:', error);
  }
  return [];
};

const LatestBanners = () => {
  const [banners, setBanners] = useState<Banner[]>(getBanners());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Update banners when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setBanners(getBanners());
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom storage update event
    window.addEventListener('storageUpdate', handleStorageChange);
    
    // Initial load
    setBanners(getBanners());
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, []);

  // Reset currentIndex when banners change
  useEffect(() => {
    if (banners.length > 0 && currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners, currentIndex]);

  const startAutoPlay = () => {
    // Allow autoplay even with a single banner
    if (intervalRef.current) return;
    
    intervalRef.current = window.setInterval(() => {
      if (!isPaused && banners.length > 0) {
        nextSlide();
      }
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Start autoplay whenever isPaused changes or when banners are loaded
  useEffect(() => {
    if (banners.length > 0) {
      startAutoPlay();
    }
    
    return () => stopAutoPlay();
  }, [isPaused, banners]);

  const nextSlide = () => {
    if (isAnimating || banners.length === 0) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    
    // Reset animation flag after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isAnimating || banners.length === 0) return;
    
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length);
    
    // Reset animation flag after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <section className="section-padding bg-background">
      <div className="container container-padding mx-auto">
        <div className="flex flex-col items-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Latest Banners</h2>
        </div>
        
        {banners.length > 0 ? (
          <div 
            className={`relative overflow-hidden rounded-xl transition-transform duration-300 ${isPaused ? 'scale-[1.02] shadow-2xl' : ''}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {isPaused && (
              <div className="absolute top-4 right-4 bg-black/70 rounded-full p-2 z-10 transition-opacity duration-300 backdrop-blur-sm">
                <Pause className="w-5 h-5 text-white" />
              </div>
            )}
            <div 
              className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-xl shadow-xl"
            >
              {banners.map((banner, index) => (
                <div 
                  key={banner.id}
                  className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out ${
                    index === currentIndex 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentIndex 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  <img 
                    src={banner.imageUrl} 
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{banner.title}</h3>
                    <p className="text-sm md:text-base text-white/80">{banner.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {banners.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-white rounded-full p-2 backdrop-blur-sm transition-all duration-300"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentIndex ? 'bg-primary scale-125' : 'bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-xl bg-gray-700 flex items-center justify-center">
            <p className="text-white text-lg md:text-xl font-medium text-center px-4">There are no banners currently released</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestBanners;
