import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  return { isValid: true };
};

const sanitizeUserData = (data: any) => {
  // Remove sensitive fields from logging
  const { password, ...sanitizedData } = data || {};
  return sanitizedData;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth session error:', error.message);
        toast.error('Authentication error occurred');
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Navigate to dashboard after successful login
        // (Avoid hijacking navigation when the user is already inside the app,
        // e.g. when switching browser tabs and Supabase re-emits SIGNED_IN)
        if (event === 'SIGNED_IN' && session) {
          const path = window.location.pathname;
          if (path === '/' || path.startsWith('/auth')) {
            navigate('/dashboard');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    // Input validation
    if (!validateEmail(email)) {
      const error = new Error('Please enter a valid email address');
      toast.error(error.message);
      throw error;
    }

    if (!password || password.length < 6) {
      const error = new Error('Password must be at least 6 characters long');
      toast.error(error.message);
      throw error;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        // Don't expose internal error details
        const userFriendlyMessage = error.message.includes('Invalid login credentials') 
          ? 'Invalid email or password'
          : 'Login failed. Please try again.';
        
        toast.error(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      toast.success('Signed in successfully!');
    } catch (error) {
      // Ensure we don't log sensitive information
      console.error('Sign in error occurred');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Input validation
    if (!validateEmail(email)) {
      const error = new Error('Please enter a valid email address');
      toast.error(error.message);
      throw error;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      const error = new Error(passwordValidation.message || 'Invalid password');
      toast.error(error.message);
      throw error;
    }

    if (!fullName || fullName.trim().length < 2) {
      const error = new Error('Please enter your full name');
      toast.error(error.message);
      throw error;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        // Don't expose internal error details
        const userFriendlyMessage = error.message.includes('already registered')
          ? 'An account with this email already exists'
          : 'Registration failed. Please try again.';
        
        toast.error(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/auth/login');
    } catch (error) {
      // Ensure we don't log sensitive information
      console.error('Sign up error occurred');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Sign out failed. Please try again.');
        throw error;
      }

      toast.success('Signed out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Sign out error occurred');
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
