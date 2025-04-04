
// Intersection Observer options
export const defaultObserverOptions = {
  root: null,
  threshold: 0.1,
  rootMargin: '0px 0px -10% 0px'
};

// Enhanced animation classes
export const fadeInUp = "animate-fade-in";
export const fadeInDown = "animate-fade-in-down";
export const fadeInLeft = "animate-fade-in-left";
export const fadeInRight = "animate-fade-in-right";
export const scaleIn = "animate-scale-in";
export const slideIn = "animate-slide-in";
export const pulseAnimation = "animate-pulse-custom";

// Animation variants for different sections
export const heroAnimation = "animate-hero-reveal";
export const cardAnimation = "animate-card-reveal";
export const listAnimation = "animate-list-reveal";

// Function to observe elements and add animation classes
export const observeElements = (
  selector: string,
  animationClass: string,
  options = defaultObserverOptions
) => {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add(...animationClass.split(' '));
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  elements.forEach((element) => {
    element.classList.add('opacity-0');
    observer.observe(element);
  });
  
  return observer;
};

// Function to animate elements with delay in sequence
export const animateElementsSequentially = (
  selector: string,
  animationClass: string,
  delayBetween = 100,
  options = defaultObserverOptions
) => {
  const elements = document.querySelectorAll(selector);
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add(...animationClass.split(' '));
        }, index * delayBetween);
        observer.unobserve(entry.target);
      }
    });
  }, options);
  
  elements.forEach((element) => {
    element.classList.add('opacity-0');
    observer.observe(element);
  });
  
  return observer;
};

// Create parallax effect on element
export const applyParallaxEffect = (element: HTMLElement, speed = 0.3) => {
  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    element.style.transform = `translateY(${scrollPosition * speed}px)`;
  };
  
  window.addEventListener('scroll', handleScroll);
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};
