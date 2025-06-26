
import { User, Session } from '@supabase/supabase-js';

export type AccessLevel = 'user' | 'admin' | 'ai';

export interface AuthContextType {
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
