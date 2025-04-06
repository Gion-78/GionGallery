import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { verifyEmail } from '@/lib/firebase';
import '@/styles/login.css';

const Login = () => {
  const [isActive, setIsActive] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup, completeSignup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implement Google login functionality here
    console.log('Google login clicked');
    // This would typically integrate with Firebase or another auth provider
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!showVerification) {
        // Initial signup - prepare registration and send verification code
        if (!signupEmail || !signupPassword) {
          throw new Error("Email and password are required");
        }
        await signup(signupEmail, signupPassword, signupName);
        setShowVerification(true);
        toast({
          title: "Verification code sent",
          description: "Please check your email for the verification code",
        });
      } else {
        // Verify email with code
        if (!verificationCode) {
          throw new Error("Please enter the verification code");
        }
        
        // First verify the email with code
        await verifyEmail(signupEmail, verificationCode);
        
        // Then complete the registration
        await completeSignup(signupEmail);
        
        toast({
          title: "Account created successfully",
          description: "You can now login to your account",
        });
        
        // Reset form and switch to login
        setIsActive(false);
        setShowVerification(false);
        setSignupEmail('');
        setSignupPassword('');
        setSignupName('');
        setVerificationCode('');
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchToSignUp = () => {
    setIsActive(true);
    setShowVerification(false);
  };

  const switchToSignIn = () => {
    setIsActive(false);
  };

  return (
    <div className="login-page">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        <div className="form-container sign-up">
          <form onSubmit={handleSignup}>
            <h1>Create Account</h1>
            <div className="social-icons">
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
              </button>
            </div>
            <span>or use your email for registration</span>
            <input 
              type="text" 
              placeholder="Name" 
              value={signupName} 
              onChange={(e) => setSignupName(e.target.value)} 
              required
              disabled={showVerification || isLoading}
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              required
              disabled={showVerification || isLoading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              required
              disabled={showVerification || isLoading}
            />
            {showVerification && (
              <input 
                type="text" 
                placeholder="Verification Code" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            )}
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : showVerification ? 'Verify & Complete' : 'Sign Up'}
            </button>
          </form>
        </div>
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Log In</h1>
            <div className="social-icons">
              <button type="button" className="google-btn" onClick={handleGoogleLogin}>
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Continue with Google
              </button>
            </div>
            <span>or use your email instead</span>
            <input 
              type="email" 
              placeholder="Email" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <a href="#">Forgot Your Password?</a>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>
        </div>
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button 
                className="hidden" 
                onClick={switchToSignIn}
                type="button"
              >
                Log In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button 
                className="hidden" 
                onClick={switchToSignUp}
                type="button"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 