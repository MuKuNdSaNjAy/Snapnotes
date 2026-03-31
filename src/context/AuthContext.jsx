import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      // No backend — treat as a local guest user so logout still works
      setUser({ email: "local@snapnotes.app", id: "local" });
      setAuthLoading(false);
      return;
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    if (!supabase) return alert("Supabase is not configured. Add your keys to .env");
    await supabase.auth.signInWithOAuth({ provider: "google" });
  }

  async function signInWithGitHub() {
    if (!supabase) return alert("Supabase is not configured. Add your keys to .env");
    await supabase.auth.signInWithOAuth({ provider: "github" });
  }

  async function signInWithEmail(email, password) {
    if (!supabase) return { message: "Supabase is not configured. Add your keys to .env" };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }

  async function signUpWithEmail(email, password) {
    if (!supabase) return { message: "Supabase is not configured. Add your keys to .env" };
    const { error } = await supabase.auth.signUp({ email, password });
    return error;
  }

  async function signOut() {
    if (!supabase) {
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        signInWithGoogle,
        signInWithGitHub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
