import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: number;
  xp: number;
  vybecoin_balance: number;
  streak_count: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: { username: string; display_name: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const createDefaultProfile = async (userId: string, userData: { username: string; display_name: string }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: userId,
          username: userData.username,
          display_name: userData.display_name,
          level: 1,
          xp: 0,
          vybecoin_balance: 100, // Starting bonus
          streak_count: 0,
          total_points: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      // Also create user preferences
      await supabase
        .from('user_preferences')
        .insert([{ user_id: userId }]);

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up any existing auth state
      await supabase.auth.signOut({ scope: 'global' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        if (!profileData) {
          // If no profile exists, create one with basic defaults
          const newProfile = await createDefaultProfile(data.user.id, {
            username: email.split('@')[0],
            display_name: email.split('@')[0]
          });
          setProfile(newProfile);
        } else {
          setProfile(profileData);
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: { username: string; display_name: string }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: userData.username,
            display_name: userData.display_name
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user) {
        // Create profile immediately
        const newProfile = await createDefaultProfile(data.user.id, userData);
        setProfile(newProfile);
        
        toast({
          title: "Welcome to Vyral!",
          description: "Your account has been created successfully.",
        });
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      await supabase.auth.signOut({ scope: 'global' });
      
      // Force page reload for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force reload even if signOut fails
      window.location.href = '/';
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          // Use Promise.resolve() to defer without setTimeout
          Promise.resolve().then(async () => {
            let profileData = await fetchProfile(session.user.id);
            if (!profileData && session.user.user_metadata) {
              // Create profile from user metadata if it doesn't exist
              profileData = await createDefaultProfile(session.user.id, {
                username: session.user.user_metadata.username || session.user.email?.split('@')[0] || 'user',
                display_name: session.user.user_metadata.display_name || session.user.email?.split('@')[0] || 'User'
              });
            }
            setProfile(profileData);
            setLoading(false);
          });
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profileData => {
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};