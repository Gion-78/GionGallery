import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { isDevelopment } from './environment';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_efvD6Ygz3PTGNYef-V0eqnZd1ySBEBg",
  authDomain: "gion-gallery.firebaseapp.com",
  projectId: "gion-gallery",
  storageBucket: "gion-gallery.firebasestorage.app",
  messagingSenderId: "821809758559",
  appId: "1:821809758559:web:f03a2aa7c69020bbbfb6ea",
  measurementId: "G-KV0QWYSF5M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);
const googleProvider = new GoogleAuthProvider();

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Generate a random verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store verification codes and pending registrations temporarily 
// (in a real app, this would be in a database)
const verificationCodes = new Map<string, string>();
const pendingRegistrations = new Map<string, { password: string, username?: string }>();

// Send verification code to user's email using Firebase Cloud Functions
const sendVerificationCodeEmail = async (email: string, code: string): Promise<boolean> => {
  // Immediately check if we're in development mode
  if (isDevelopment()) {
    console.log(`[DEV MODE] Email verification code for ${email}: ${code}`);
    console.log('[DEV MODE] In production, this would be sent via email');
    return true; // Simulate success in development mode
  }
  
  try {
    // In production mode, try to call the Firebase function
    const sendVerificationCode = httpsCallable(functions, 'sendVerificationCode');
    
    try {
      const result = await sendVerificationCode({ email, code });
      console.log("Verification email sent successfully via callable function");
      return (result.data as any).success;
    } catch (callableError) {
      console.error('Error with callable function, attempting HTTP fallback:', callableError);
      
      // Fallback to HTTP endpoint if callable function fails
      const functionRegion = 'us-central1'; // Change if your functions are deployed to a different region
      const functionUrl = `https://${functionRegion}-${firebaseConfig.projectId}.cloudfunctions.net/sendVerificationCodeHttp`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Verification email sent successfully via HTTP endpoint");
      return data.success;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    
    // If everything failed but we're in development, still return success
    if (isDevelopment()) {
      console.log(`[DEV FALLBACK] Verification code for ${email}: ${code}`);
      console.log('[DEV FALLBACK] Simulating successful email send for development');
      return true;
    }
    
    throw error;
  }
};

// Prepare user registration (but don't create the Firebase user yet)
export const prepareRegistration = async (email: string, password: string, username?: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      const error: any = new Error('Please enter a valid email address');
      error.code = 'auth/invalid-email';
      throw error;
    }
    
    // Firebase requires password to be at least 6 characters
    if (password.length < 6) {
      const error: any = new Error('Password should be at least 6 characters');
      error.code = 'auth/weak-password';
      throw error;
    }
    
    // Store the registration data for later
    pendingRegistrations.set(email, { password, username });
    
    // Generate verification code and store it
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, verificationCode);
    
    // Send the verification code to the user's email
    await sendVerificationCodeEmail(email, verificationCode);
    
    return { email };
  } catch (error: any) {
    console.error('Error preparing registration:', error);
    throw error;
  }
};

// Complete registration after email verification
export const completeRegistration = async (email: string): Promise<User> => {
  try {
    const registrationData = pendingRegistrations.get(email);
    
    if (!registrationData) {
      throw new Error('No pending registration found for this email');
    }
    
    // Now create the actual Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      registrationData.password
    );
    
    // Set the display name if a username was provided
    if (registrationData.username) {
      await updateProfile(userCredential.user, {
        displayName: registrationData.username
      });
    }
    
    // Clean up the pending registration data
    pendingRegistrations.delete(email);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error completing registration:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      const error: any = new Error('Please enter a valid email address');
      error.code = 'auth/invalid-email';
      throw error;
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Generate a new verification code and return it
export const generateNewVerificationCode = async (email: string): Promise<string> => {
  try {
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, verificationCode);
    
    // Send the verification code to the user's email
    await sendVerificationCodeEmail(email, verificationCode);
    
    return verificationCode;
  } catch (error) {
    console.error('Error generating verification code:', error);
    throw error;
  }
};

// Verify code and proceed with registration or mark email as verified
export const verifyEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    const storedCode = verificationCodes.get(email);
    
    if (!storedCode) {
      throw new Error('No verification code found for this email');
    }
    
    if (storedCode !== code) {
      throw new Error('Invalid verification code');
    }
    
    // Clean up the verification code
    verificationCodes.delete(email);
    
    // For existing users that are verifying their email
    const user = auth.currentUser;
    if (user) {
      // Simulate email verification by setting a flag in localStorage
      localStorage.setItem(`email_verified_${email}`, 'true');
      
      // Force a reload to get the updated user data
      await user.reload();
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying email:', error);
    throw error;
  }
};

// Check if email is verified (simulated for frontend)
export const isEmailVerified = (email: string): boolean => {
  // In a real app, this would check the user's email verification status from Firebase
  // For our simulation, we use localStorage
  return localStorage.getItem(`email_verified_${email}`) === 'true';
};

// Check if an email has a pending registration
export const hasPendingRegistration = (email: string): boolean => {
  return pendingRegistrations.has(email);
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // The signed-in user info
    const user = result.user;
    // For email verification simulation
    if (user.email) {
      localStorage.setItem(`email_verified_${user.email}`, 'true');
    }
    return user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export { auth, onAuthStateChanged }; 