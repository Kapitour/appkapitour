import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PontosTuristicos from './pages/PontosTuristicos';
import './App.css';

// Componente para proteger rotas
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-500 to-orange-500 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">
            Apenas administradores podem acessar este painel.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// Componente principal da aplicação
const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pontos-turisticos" element={<PontosTuristicos />} />
          <Route path="rotas" element={<div className="p-6"><h1 className="text-2xl font-bold">Rotas - Em desenvolvimento</h1></div>} />
          <Route path="fotos" element={<div className="p-6"><h1 className="text-2xl font-bold">Gerenciar Fotos - Em desenvolvimento</h1></div>} />
          <Route path="usuarios" element={<div className="p-6"><h1 className="text-2xl font-bold">Usuários - Em desenvolvimento</h1></div>} />
          <Route path="configuracoes" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações - Em desenvolvimento</h1></div>} />
        </Route>
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
