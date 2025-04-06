import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getAllContent } from '../../lib/supabase';

interface Banner {
  id: string;
  title: string;
  description: string;
  type?: 'Character' | 'Event';
  imageUrl: string;
}

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // Load banners from Supabase
  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true);
      try {
        // Always try to get fresh data from Supabase first
        const result = await getAllContent();
        if (result.success && result.data) {
          // Filter to get only banner slider items
          const bannerItems = result.data
            .filter(item => 
              item.section === 'Banner Slider' && 
              item.imageUrl
            )
            .map(item => ({
              id: item.id,
              title: item.title,
              description: item.description || '',
              type: 'Character' as const, // Default to Character type
              imageUrl: item.imageUrl || ''
            }));
          
          console.log('Banner items from Supabase:', bannerItems);
          setBanners(bannerItems);
          
          // Update localStorage with the latest data
          localStorage.setItem('banners', JSON.stringify(bannerItems));
        } else {
          // Only if Supabase fails completely, check localStorage
          console.log('Failed to load banners from Supabase, checking localStorage');
          const bannerData = localStorage.getItem('banners');
          if (bannerData) {
            try {
              const parsedBanners = JSON.parse(bannerData);
              setBanners(parsedBanners);
              console.log('Loaded banners from localStorage (fallback)', parsedBanners);
            } catch (parseError) {
              console.error('Error parsing banners from localStorage:', parseError);
              setBanners([]);
              // Clear invalid data
              localStorage.removeItem('banners');
            }
          } else {
            console.log('No banners found in localStorage either');
            setBanners([]);
          }
        }
      } catch (error) {
        console.error('Error loading banners:', error);
        // Try localStorage as last resort
        try {
          const bannerData = localStorage.getItem('banners');
          if (bannerData) {
            const parsedBanners = JSON.parse(bannerData);
            setBanners(parsedBanners);
            console.log('Loaded banners from localStorage after Supabase error');
          } else {
            setBanners([]);
          }
        } catch (fallbackError) {
          console.error('Fallback to localStorage also failed:', fallbackError);
          setBanners([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadBanners();
    
    // Also listen for storage update events to refresh banners
    const handleStorageUpdate = () => {
      loadBanners();
    };
    
    window.addEventListener('storageUpdate', handleStorageUpdate);
    
    return () => {
      window.removeEventListener('storageUpdate', handleStorageUpdate);
    };
  }, []);

  const startAutoPlay = () => {
    if (intervalRef.current || banners.length === 0) return;
    
    intervalRef.current = window.setInterval(() => {
      if (!isPaused) {
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

  useEffect(() => {
    startAutoPlay();
    
    return () => stopAutoPlay();
  }, [isPaused]);

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

  if (banners.length === 0) {
    return (
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-xl mb-6 bg-card flex items-center justify-center">
        <p className="text-muted-foreground">No banner data available</p>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden rounded-xl mb-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slider */}
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
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                banner.type === 'Character' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {banner.type} Banner
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{banner.title}</h3>
              <p className="text-sm md:text-base text-white/80">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
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
      
      {/* Indicator Dots */}
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
    </div>
  );
};

export default BannerSlider;
