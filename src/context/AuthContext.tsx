import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { auth, onAuthStateChanged, signIn, logOut, isEmailVerified } from '../lib/firebase';

// Define the shape of the context
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isEmailVerified: boolean;
  refreshUser: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsVerified(user?.email ? isEmailVerified(user.email) : false);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Refresh user to check if email has been verified
  const refreshUser = async () => {
    if (currentUser) {
      await currentUser.reload();
      setIsVerified(currentUser.email ? isEmailVerified(currentUser.email) : false);
    }
  };

  // Auth methods
  const login = async (email: string, password: string) => {
    const user = await signIn(email, password);
    setIsVerified(user.email ? isEmailVerified(user.email) : false);
    return user;
  };

  const logout = async () => {
    await logOut();
    setIsVerified(false);
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    isEmailVerified: isVerified,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 