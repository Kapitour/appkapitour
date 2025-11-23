import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
// Supabase-only auth

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub;
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await loadSupabaseUser(session.user.id);
        } else {
          setUser(null);
          setUserInfo(null);
        }
      } finally {
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadSupabaseUser(session.user.id);
      } else {
        setUser(null);
        setUserInfo(null);
      }
    });
    unsub = listener.subscription;
    return () => {
      try { unsub?.unsubscribe(); } catch (_) {}
    };
  }, []);

  // Sync via Supabase apenas

  // ============================================================
  // LOGIN EMAIL + SENHA (SUPABASE)
  // ============================================================
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      await loadSupabaseUser(data.user.id);

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // CARREGA USUÁRIO DO SUPABASE
  // ============================================================
  const loadSupabaseUser = async (authId) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", authId)
        .single();

      if (error) {
        console.log("Erro ao buscar usuário Supabase:", error);
        return;
      }

      setUserInfo(data);
    } catch (err) {
      console.log("Erro loadSupabaseUser:", err);
    }
  };

  // ============================================================
  // LOGOUT (SUPABASE)
  // ============================================================
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserInfo(null);
      return { success: true };
    } catch (err) {
      console.log("Erro supabase signOut:", err);
      return { success: false, error: err.message };
    }
  };

  // ============================================================
  // STATUS ÚNICO DE LOGIN
  // ============================================================
  const isLogged = userInfo !== null;

  return {
    user,
    userInfo,
    isLogged,
    loading,
    signIn,
    signOut,
  };
};
