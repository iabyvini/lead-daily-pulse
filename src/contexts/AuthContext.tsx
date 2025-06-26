
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AccessLevel = 'user' | 'admin' | 'ai';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isAI: boolean;
  accessLevel: AccessLevel | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  loading: boolean;
  accessLevelLoading: boolean;
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
  const [accessLevel, setAccessLevel] = useState<AccessLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessLevelLoading, setAccessLevelLoading] = useState(false);

  // Function to check access level with timeout and better error handling
  const checkAccessLevel = async (userId: string): Promise<AccessLevel> => {
    try {
      console.log('AuthProvider: Checking access level for user', userId);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Access level check timeout')), 5000);
      });
      
      // Race between the query and timeout
      const queryPromise = supabase
        .from('profiles')
        .select('access_level')
        .eq('id', userId)
        .single();
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('AuthProvider: Error checking access level', error);
        // If profile doesn't exist, assume user level
        return 'user';
      }
      
      console.log('AuthProvider: Profile data', profile);
      const level = profile?.access_level || 'user';
      console.log('AuthProvider: Access level determined:', level);
      return level;
    } catch (error) {
      console.error('AuthProvider: Access level check failed', error);
      return 'user';
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    let mounted = true;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('AuthProvider: Auth state changed', { event, session: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: User authenticated, checking access level');
          setAccessLevelLoading(true);
          
          try {
            const userAccessLevel = await checkAccessLevel(session.user.id);
            if (mounted) {
              setAccessLevel(userAccessLevel);
              console.log('AuthProvider: Access level set to:', userAccessLevel);
            }
          } catch (error) {
            console.error('AuthProvider: Failed to check access level', error);
            if (mounted) {
              setAccessLevel('user');
            }
          } finally {
            if (mounted) {
              setAccessLevelLoading(false);
            }
          }
        } else {
          console.log('AuthProvider: No user, setting access level to null');
          setAccessLevel(null);
          setAccessLevelLoading(false);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session
    console.log('AuthProvider: Getting initial session');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('AuthProvider: Initial session', { session: !!session });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setAccessLevelLoading(true);
        checkAccessLevel(session.user.id).then((userAccessLevel) => {
          if (mounted) {
            setAccessLevel(userAccessLevel);
            console.log('AuthProvider: Initial access level set to:', userAccessLevel);
            setAccessLevelLoading(false);
          }
        }).catch((error) => {
          console.error('AuthProvider: Failed to check initial access level', error);
          if (mounted) {
            setAccessLevel('user');
            setAccessLevelLoading(false);
          }
        });
      } else {
        setAccessLevelLoading(false);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('AuthProvider: Error getting initial session', error);
      if (mounted) {
        setLoading(false);
        setAccessLevelLoading(false);
      }
    });

    return () => {
      mounted = false;
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
    setAccessLevel(null);
    setAccessLevelLoading(false);
  };

  const resetPassword = async (email: string) => {
    console.log('AuthProvider: Sending password reset email to', email);
    try {
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/reset-password`;
      
      console.log('AuthProvider: Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
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
    isAdmin: accessLevel === 'admin',
    isAI: accessLevel === 'ai',
    accessLevel,
    signIn,
    signOut,
    resetPassword,
    loading,
    accessLevelLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
