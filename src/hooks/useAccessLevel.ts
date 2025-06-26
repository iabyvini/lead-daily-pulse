
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AccessLevel } from '@/types/auth';

export const useAccessLevel = () => {
  // Function to check access level with improved error handling
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
            toast({
              title: "⚠️ Erro de configuração",
              description: "Erro ao configurar perfil de administrador. Contate o suporte.",
              variant: "destructive",
            });
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
            toast({
              title: "⚠️ Erro de configuração",
              description: "Erro ao atualizar perfil de administrador. Contate o suporte.",
              variant: "destructive",
            });
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

  return { checkAccessLevel };
};
