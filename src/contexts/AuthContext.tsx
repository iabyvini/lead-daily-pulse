
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AccessLevel } from '@/types/auth';
import { useAccessLevel } from '@/hooks/useAccessLevel';
import { useAuthMethods } from '@/hooks/useAuthMethods';

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

  const { checkAccessLevel } = useAccessLevel();
  const { signIn, signOut: authSignOut, resetPassword } = useAuthMethods();

  const signOut = async () => {
    await authSignOut();
    setAccessLevel(null);
    setAccessLevelLoading(false);
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
            const userAccessLevel = await checkAccessLevel(session.user.id, session.user.email || '');
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
        checkAccessLevel(session.user.id, session.user.email || '').then((userAccessLevel) => {
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
  }, [checkAccessLevel]);

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
