import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';

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

// Send verification code to user's email
// In a real app, this would use a service like SendGrid, Mailgun, or Firebase Cloud Functions
const sendVerificationCodeEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    // SIMULATION ONLY: In a real application, you would implement an actual email sending service
    // This would typically be done using a backend API or Firebase Cloud Functions
    
    // For demo purposes, we'll log what would happen in a real app
    console.log(`In a real app, an email would be sent to ${email} with code: ${code}`);
    
    // The email might look like:
    const emailSubject = 'Your verification code';
    const emailBody = `
      Hello,
      
      Your verification code is: ${code}
      
      This code will expire in 10 minutes.
      
      Thank you,
      Your App Team
    `;
    
    console.log('Email subject:', emailSubject);
    console.log('Email body:', emailBody);
    
    // Simulate a short delay as if sending an email
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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

export { auth, onAuthStateChanged }; 