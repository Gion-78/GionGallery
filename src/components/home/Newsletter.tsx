
import { useState } from 'react';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to the newsletter!');
      setEmail('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section className="section-padding bg-primary/10">
      <div className="container container-padding mx-auto">
        <div className="glass-card rounded-xl p-8 md:p-12 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/30 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/30 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter to receive the latest news, exclusive leaks, and special promotions for One Piece Fighting Path.
              </p>
            </div>
            
            <div className="md:w-1/2">
              <form onSubmit={handleSubmit} className="bg-card border border-border/10 rounded-lg p-6 shadow-lg">
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-5 py-3 bg-primary text-primary-foreground rounded-md transition-all duration-300 hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg 
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24"
                      >
                        <circle 
                          className="opacity-25" 
                          cx="12" 
                          cy="12" 
                          r="10" 
                          stroke="currentColor" 
                          strokeWidth="4"
                        ></circle>
                        <path 
                          className="opacity-75" 
                          fill="currentColor" 
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
                
                <p className="text-xs text-muted-foreground mt-4">
                  We respect your privacy and will never share your information with third parties.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
