import { useState, useEffect } from 'react';
import { LogIn, User, Mail, Lock, UserPlus, AlertCircle, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  verifyEmail, 
  generateNewVerificationCode, 
  isEmailVerified, 
  prepareRegistration,
  completeRegistration,
  hasPendingRegistration
} from '../../lib/firebase';
import { OTPInput } from '../../components/ui/otp-input';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialogComponent = ({ open, onOpenChange }: LoginDialogProps) => {
  const { login, currentUser, refreshUser } = useAuth();
  const [isSignIn, setIsSignIn] = useState(true);
  const [showVerificationStep, setShowVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [tempUserEmail, setTempUserEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });

  // Check if user is already logged in and show verification status
  useEffect(() => {
    if (currentUser && open && !showVerificationStep) {
      const isVerified = currentUser.email ? isEmailVerified(currentUser.email) : false;
      
      if (!isVerified) {
        toast.warning('Please verify your email address to fully activate your account');
      } else {
        toast.success(`Welcome back, ${currentUser.email}!`);
        onOpenChange(false);
      }
    }
  }, [currentUser, open, onOpenChange, showVerificationStep]);

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
    // Clear error on input change
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (isSignIn) {
        // Handle sign in
        const user = await login(formData.email, formData.password);
        const isVerified = user.email ? isEmailVerified(user.email) : false;
        
        if (!isVerified) {
          toast.warning('Please verify your email address to fully activate your account');
          // If user is logging in but not verified, take them to verification step
          setTempUserEmail(formData.email);
          setShowVerificationStep(true);
          // Generate a new code for verification
          await generateNewVerificationCode(formData.email);
        } else {
          toast.success('Successfully signed in!');
          onOpenChange(false);
        }
      } else {
        // Handle sign up - but don't create user yet, just prepare registration
        await prepareRegistration(formData.email, formData.password, formData.username);
        setTempUserEmail(formData.email);
        // Show verification step instead of closing
        setShowVerificationStep(true);
        toast.success('Verification code sent to your email. Please check your inbox.');
      }
    } catch (error: any) {
      // Handle authentication errors
      let message = 'An error occurred during authentication';
      
      // Log the complete error for debugging
      console.error('Auth error details:', {
        code: error.code,
        message: error.message,
        fullError: error
      });
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = 'Invalid email or password';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Network error - check your internet connection';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many attempts - please try again later';
      } else if (error.code === 'auth/operation-not-allowed') {
        message = 'Email/password sign-up is not enabled for this project';
      } else if (error.code === 'auth/internal-error') {
        message = 'Authentication service failed. Please try again in a moment.';
      } else {
        // If we get here, show the actual error message for debugging
        message = `Authentication error: ${error.message || error.code || 'unknown error'}`;
      }
      
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationCodeSubmit = async () => {
    if (verificationCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      // Try to verify with the email and code
      await verifyEmail(tempUserEmail, verificationCode);
      
      // Check if this is a pending registration
      if (hasPendingRegistration(tempUserEmail)) {
        // Complete the registration now
        await completeRegistration(tempUserEmail);
        toast.success('Email verified and account created successfully!');
      } else {
        toast.success('Email verified successfully!');
      }
      
      if (currentUser) {
        await refreshUser();
      }
      
      setShowVerificationStep(false);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Verification error:', error);
      setErrorMessage('Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!tempUserEmail) {
      setErrorMessage('Email address is missing. Please try signing up again.');
      return;
    }

    setIsSendingCode(true);
    try {
      // Generate and send a new verification code
      await generateNewVerificationCode(tempUserEmail);
      toast.success('A new verification code has been sent to your email');
      // Reset the verification code input
      setVerificationCode('');
    } catch (error) {
      console.error('Failed to send verification code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleBackFromVerification = () => {
    setShowVerificationStep(false);
    setVerificationCode('');
  };

  const toggleForm = () => {
    // Reset form data and errors when switching between forms
    setFormData({
      email: '',
      password: '',
      username: '',
    });
    setErrorMessage('');
    setIsSignIn((prev) => !prev);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && showVerificationStep) {
        setShowVerificationStep(false);
      }
      onOpenChange(isOpen);
    }}>
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
            {showVerificationStep ? (
              <>
                <CheckCircle className="h-5 w-5 text-primary" />
                Verify Email
              </>
            ) : isSignIn ? (
              <>
                <LogIn className="h-5 w-5 text-primary" />
                Log In
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-primary" />
                Create Account
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-stretch space-y-4">
          {/* Error message display */}
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Verification code step */}
          {showVerificationStep ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-1">We've sent a verification code to:</p>
                <p className="font-medium">{tempUserEmail}</p>
                <p className="text-sm text-muted-foreground mt-3">Enter the 6-digit code below</p>
              </div>
              
              <div className="py-2">
                <OTPInput
                  value={verificationCode}
                  onChange={setVerificationCode}
                  disabled={isVerifying}
                />
              </div>
              
              <div className="space-y-2">
                <Button 
                  type="button" 
                  variant="default" 
                  className="w-full hover:scale-[1.02] transition-transform"
                  disabled={isVerifying || verificationCode.length !== 6}
                  onClick={handleVerificationCodeSubmit}
                >
                  {isVerifying ? 'Verifying...' : 'Verify Email'}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full flex items-center justify-center"
                  onClick={handleBackFromVerification}
                  disabled={isVerifying}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Didn't receive the code? </span>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-primary hover:underline font-medium inline-flex items-center"
                  disabled={isVerifying || isSendingCode}
                >
                  {isSendingCode && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                  Resend code
                </button>
              </div>
            </div>
          ) : !currentUser && (
            <div className="relative overflow-hidden">
              <div className={`transition-all duration-500 ease-in-out transform ${isSignIn ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute'}`}>
                <form onSubmit={handleSubmit} className={`space-y-4 ${!isSignIn ? 'pointer-events-none' : ''}`}>
                  <div className="space-y-3">
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="default" 
                    className="w-full hover:scale-[1.02] transition-transform"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">Need an account? </span>
                  <button
                    type="button"
                    onClick={toggleForm}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <div className={`transition-all duration-500 ease-in-out transform ${!isSignIn ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute'}`}>
                <form onSubmit={handleSubmit} className={`space-y-4 ${isSignIn ? 'pointer-events-none' : ''}`}>
                  <div className="space-y-3">
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
                        disabled={isLoading}
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="default" 
                    className="w-full hover:scale-[1.02] transition-transform"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" /> Create Account
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-4 text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <button
                    type="button"
                    onClick={toggleForm}
                    className="text-primary hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialogComponent; 