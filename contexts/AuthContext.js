import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  // Verificar se o usuário está logado ao iniciar o app
  useEffect(() => {
    checkUser();
    
    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await saveUserSession(session);
          await fetchUserInfo(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserInfo(null);
          await clearUserSession();
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Verificar se há uma sessão salva
  const checkUser = async () => {
    try {
      setLoading(true);
      
      // Verificar se há uma sessão salva
      const session = await supabase.auth.getSession();
      
      if (session.data.session?.user) {
        setUser(session.data.session.user);
        await fetchUserInfo(session.data.session.user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar informações do usuário no banco
  const fetchUserInfo = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_id', userId)
        .single();

      if (error) throw error;
      setUserInfo(data);
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
    }
  };

  // Salvar sessão no AsyncStorage
  const saveUserSession = async (session) => {
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  // Limpar sessão do AsyncStorage
  const clearUserSession = async () => {
    try {
      await AsyncStorage.removeItem('user_session');
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  };

  // Fazer login
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Fazer logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    userInfo,
    loading,
    signIn,
    signOut,
    checkUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

