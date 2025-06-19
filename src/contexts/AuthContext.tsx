import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check admin status with error handling and timeout
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('AuthProvider: Checking admin status for user', userId);
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const queryPromise = supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('AuthProvider: Error checking admin status', error);
        return false;
      }
      
      console.log('AuthProvider: Profile data', profile);
      return profile?.is_admin || false;
    } catch (error) {
      console.error('AuthProvider: Admin check failed', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed', { event, session: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: User authenticated, checking admin status');
          
          // Use setTimeout to defer the admin check and prevent blocking the auth flow
          setTimeout(async () => {
            try {
              const adminStatus = await checkAdminStatus(session.user.id);
              setIsAdmin(adminStatus);
            } catch (error) {
              console.error('AuthProvider: Failed to check admin status', error);
              setIsAdmin(false);
            }
          }, 0);
        } else {
          console.log('AuthProvider: No user, setting admin to false');
          setIsAdmin(false);
        }
        
        // Always set loading to false after processing auth state
        setLoading(false);
      }
    );

    // Get initial session
    console.log('AuthProvider: Getting initial session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session', { session: !!session });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check admin status for initial session
        setTimeout(async () => {
          try {
            const adminStatus = await checkAdminStatus(session.user.id);
            setIsAdmin(adminStatus);
          } catch (error) {
            console.error('AuthProvider: Failed to check initial admin status', error);
            setIsAdmin(false);
          }
        }, 0);
      }
      
      // Set loading to false even if no session
      setLoading(false);
    }).catch((error) => {
      console.error('AuthProvider: Error getting initial session', error);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('AuthProvider: Sign in result', { error });
      return { error };
    } catch (error) {
      console.error('AuthProvider: Sign in error', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    console.log('AuthProvider: Sending password reset email to', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });
      console.log('AuthProvider: Password reset result', { error });
      return { error };
    } catch (error) {
      console.error('AuthProvider: Password reset error', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    signIn,
    signOut,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
