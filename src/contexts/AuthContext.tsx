
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, AccessLevel } from '@/types/auth';
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

  const { signIn, signOut: authSignOut, resetPassword } = useAuthMethods();

  const signOut = async () => {
    await authSignOut();
    setAccessLevel(null);
    setAccessLevelLoading(false);
  };

  // Function to check access level - moved inside component to avoid dependency issues
  const checkAccessLevel = async (userId: string, userEmail: string): Promise<AccessLevel> => {
    try {
      console.log('AccessLevel: Checking access level for user', userId, userEmail);
      
      // Special handling for known admin emails
      const adminEmails = ['viniciusrodrigues@liguelead.com.br', 'patricia@liguelead.com.br'];
      if (adminEmails.includes(userEmail)) {
        console.log('AccessLevel: User is in admin emails list, should be admin');
        
        // Check if profile exists and update if necessary
        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('access_level')
          .eq('id', userId)
          .single();
        
        if (selectError && selectError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('AccessLevel: Creating admin profile for', userEmail);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: userEmail,
              access_level: 'admin'
            });
          
          if (insertError) {
            console.error('AccessLevel: Error creating admin profile', insertError);
            return 'user';
          }
          return 'admin';
        } else if (profile && profile.access_level !== 'admin') {
          // Profile exists but is not admin, update it
          console.log('AccessLevel: Updating profile to admin for', userEmail);
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ access_level: 'admin' })
            .eq('id', userId);
          
          if (updateError) {
            console.error('AccessLevel: Error updating profile to admin', updateError);
            return 'user';
          }
          return 'admin';
        } else if (profile) {
          return profile.access_level || 'user';
        }
      }
      
      // For non-admin emails, check normally with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Access level check timeout')), 5000);
      });
      
      const queryPromise = supabase
        .from('profiles')
        .select('access_level')
        .eq('id', userId)
        .single();
      
      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      if (error) {
        console.error('AccessLevel: Error checking access level', error);
        return 'user';
      }
      
      console.log('AccessLevel: Profile data', profile);
      const level = profile?.access_level || 'user';
      console.log('AccessLevel: Access level determined:', level);
      return level;
    } catch (error) {
      console.error('AccessLevel: Access level check failed', error);
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
  }, []); // Empty dependency array to avoid infinite loops

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
