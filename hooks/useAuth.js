import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
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

  const upsertUserProfile = async (userObj) => {
    try {
      const payload = {
        auth_id: userObj.id,
        email: userObj.email,
        nome: userObj.user_metadata?.full_name || userObj.user_metadata?.name || "",
        avatar: userObj.user_metadata?.avatar_url || userObj.user_metadata?.picture || "",
        provider: userObj.app_metadata?.provider || "google",
      };
      await supabase.from("usuarios").upsert(payload, { onConflict: "auth_id" });
    } catch (e) {}
  };

  const signInWithGoogle = async () => {
    try {
      WebBrowser.maybeCompleteAuthSession();
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          queryParams: { access_type: "offline", prompt: "consent" },
        },
      });
      if (error || !data?.url) {
        return { success: false, error: error?.message || "Falha ao iniciar OAuth." };
      }
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
      if (res.type === "success" && res.url) {
        try {
          const urlObj = new URL(res.url);
          const code = urlObj.searchParams.get("code");
          if (code) {
            const { data: sessData, error: exchError } = await supabase.auth.exchangeCodeForSession({ code });
            if (exchError) return { success: false, error: exchError.message };
            const authed = sessData?.session?.user || sessData?.user;
            if (authed?.id) {
              await upsertUserProfile(authed);
              await loadSupabaseUser(authed.id);
              return { success: true, user: authed };
            }
          }
        } catch (e) {
          return { success: false, error: e.message };
        }
      }
      return { success: false, error: "Login cancelado" };
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
    signInWithGoogle,
    signOut,
  };
};
