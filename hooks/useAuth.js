import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useUser, useClerk } from "@clerk/clerk-expo";

export const useAuth = () => {
  const clerkUser = useUser();                   // dados do Clerk (Google)
  const { signOut: clerkSignOut } = useClerk();  // logout Clerk

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // SINCRONIZAÇÃO AUTOMÁTICA
  // Quando Clerk loga → sincroniza com Supabase automaticamente
  // ============================================================
  useEffect(() => {
    if (clerkUser.isLoaded) {
      if (clerkUser.isSignedIn) {
        syncWithSupabase();
      } else {
        setUserInfo(null);
        setLoading(false);
      }
    }
  }, [clerkUser.isSignedIn]);

  // ============================================================
  // SYNC COM SUPABASE (GOOGLE)
  // ============================================================
  const syncWithSupabase = async () => {
    try {
      setLoading(true);

      const email = clerkUser.user.primaryEmailAddress.emailAddress;
      const name =
        clerkUser.user.fullName ||
        clerkUser.user.firstName ||
        "Usuário Google";

      // 1 — Verifica se já existe no banco
      const { data: exists, error: existsError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (existsError) {
        console.log("Erro buscando usuário Google:", existsError);
      }

      if (exists) {
        setUserInfo(exists);
        setLoading(false);
        return;
      }

      // 2 — Se não existe → cria
      const { data: created, error: insertError } = await supabase
        .from("usuarios")
        .insert({
          email,
          nome: name,
          tipo: "usuario",
          auth_id: null, // IMPORTANTE: Google não usa auth_id do Supabase
        })
        .select()
        .single();

      if (insertError) {
        console.log("Erro criando usuário Google:", insertError);
      }

      setUserInfo(created);
      setLoading(false);
    } catch (err) {
      console.log("Erro sync Google:", err);
      setLoading(false);
    }
  };

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
  // LOGOUT GLOBAL (CLERK + SUPABASE)
  // ============================================================
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.log("Erro supabase signOut:", err);
    }

    try {
      await clerkSignOut();
    } catch (err) {
      console.log("Erro clerk signOut:", err);
    }

    setUserInfo(null);
  };

  // ============================================================
  // STATUS ÚNICO DE LOGIN
  // ============================================================
  const isLogged =
    clerkUser.isSignedIn ||      // Logado pelo Google (Clerk)
    userInfo !== null;           // Logado pelo Supabase (email/senha)

  return {
    userInfo,
    isLogged,
    loading,
    signIn,
    signOut,
  };
};
