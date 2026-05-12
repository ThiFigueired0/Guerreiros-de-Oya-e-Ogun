import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { keys, del } from 'idb-keyval';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAppData = React.useCallback(async (includeUserSpecific = false) => {
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      // Clear legacy keys (starting with templo_ but not following user/guest pattern)
      const isLegacy = key.startsWith('templo_') && !key.startsWith('templo_guest_') && !key.match(/templo_[a-f0-9-]{36}_/);
      const isGuest = key.startsWith('templo_guest_');
      const isUser = key.match(/templo_[a-f0-9-]{36}_/);

      if (isLegacy || isGuest || (includeUserSpecific && isUser)) {
        localStorage.removeItem(key);
      }
    });

    // Clear IndexedDB
    try {
      const allKeys = await keys();
      for (const key of allKeys) {
        if (typeof key === 'string') {
          const isLegacy = key.startsWith('templo_') && !key.startsWith('templo_guest_') && !key.match(/templo_[a-f0-9-]{36}_/);
          const isGuest = key.startsWith('templo_guest_');
          const isUser = key.match(/templo_[a-f0-9-]{36}_/);

          if (isLegacy || isGuest || (includeUserSpecific && isUser)) {
            await del(key);
          }
        }
      }
    } catch (err) {
      console.error('Error clearing IndexedDB data:', err);
    }
  }, []);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        clearAppData(true); // Clear everything on logout
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      } else if (event === 'INITIAL_SESSION') {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearAppData]);

  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setUser(null);
      await clearAppData(true);
    }
  }, []);

  const value = React.useMemo(() => ({
    user,
    session,
    loading,
    signOut
  }), [user, session, loading, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
