import { useState, useEffect } from 'react';
import { LogIn, User, Mail, Lock, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog = ({ open, onOpenChange }: LoginDialogProps) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });

  // Subtle background animation effect
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setBackgroundPosition({
        x: Math.sin(Date.now() / 3000) * 10,
        y: Math.cos(Date.now() / 4000) * 10,
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle authentication logic
    console.log('Form submitted:', formData);
    // For demonstration purposes, we'll just close the dialog
    onOpenChange(false);
  };

  const toggleForm = () => {
    // Reset form data when switching between forms
    setFormData({
      email: '',
      password: '',
      username: '',
    });
    setIsSignIn((prev) => !prev);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-md border-primary/20 shadow-xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/80 to-background/90 z-[-1]" 
          style={{ 
            transform: `translate(${backgroundPosition.x}px, ${backgroundPosition.y}px)`,
            transition: 'transform 1s ease-out'
          }}
        />
        <div className="absolute inset-0 bg-[url('/images/brush-texture.png')] opacity-5 z-[-1]" />
        
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {isSignIn ? (
              <>
                <LogIn className="h-5 w-5 text-primary" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-primary" />
                Create Account
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={`mt-4 transition-all duration-500 ease-in-out transform ${isSignIn ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute'}`}>
          <form onSubmit={handleSubmit} className={`space-y-4 ${!isSignIn ? 'pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="pl-10 border-muted focus:border-primary transition-all"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="pl-10 border-muted focus:border-primary transition-all"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="default" 
              className="w-full hover:scale-[1.02] transition-transform"
            >
              <LogIn className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Need an account? </span>
            <button
              type="button"
              onClick={toggleForm}
              className="text-primary hover:underline font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className={`mt-4 transition-all duration-500 ease-in-out transform ${!isSignIn ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute'}`}>
          <form onSubmit={handleSubmit} className={`space-y-4 ${isSignIn ? 'pointer-events-none' : ''}`}>
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="pl-10 border-muted focus:border-primary transition-all"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="pl-10 border-muted focus:border-primary transition-all"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="pl-10 border-muted focus:border-primary transition-all"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="default" 
              className="w-full hover:scale-[1.02] transition-transform"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Create Account
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              onClick={toggleForm}
              className="text-primary hover:underline font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog; 