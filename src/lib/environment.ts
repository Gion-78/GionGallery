/**
 * Environment detection utilities
 */

// Check if we're in development or production
export const isDevelopment = (): boolean => {
  // Check if running on localhost
  const isLocalhost = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.') ||
    window.location.hostname.startsWith('10.0.') ||
    window.location.hostname.includes('.local');
  
  // Additional check for development port (common ports used for local dev)
  const isDevelopmentPort = 
    window.location.port === '3000' || // React
    window.location.port === '8080' || // Webpack
    window.location.port === '5173' || // Vite
    window.location.port === '4200' || // Angular
    window.location.port === '8000' || // Django
    window.location.port === '5000';   // Flask

  return isLocalhost || isDevelopmentPort;
};

// Check if we're in production
export const isProduction = (): boolean => {
  return !isDevelopment();
};

// Get current environment name
export const getEnvironment = (): 'development' | 'production' => {
  return isDevelopment() ? 'development' : 'production';
}; 