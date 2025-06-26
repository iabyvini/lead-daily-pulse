
import { supabase } from '@/integrations/supabase/client';

export const useAuthMethods = () => {
  const signIn = async (email: string, password: string) => {
    console.log('AuthMethods: Attempting sign in for', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('AuthMethods: Sign in result', { error });
      return { error };
    } catch (error) {
      console.error('AuthMethods: Sign in error', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('AuthMethods: Signing out');
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    console.log('AuthMethods: Sending password reset email to', email);
    try {
      const currentUrl = window.location.origin;
      const redirectUrl = `${currentUrl}/reset-password`;
      
      console.log('AuthMethods: Using redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      console.log('AuthMethods: Password reset result', { error });
      return { error };
    } catch (error) {
      console.error('AuthMethods: Password reset error', error);
      return { error };
    }
  };

  return { signIn, signOut, resetPassword };
};
