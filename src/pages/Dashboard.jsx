import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Route, Users, Image, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pontosTuristicos: 0,
    rotas: 0,
    usuarios: 0,
    fotos: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const [pontosResult, rotasResult, usuariosResult] = await Promise.all([
        supabase.from('pontos_turisticos').select('id', { count: 'exact' }),
        supabase.from('rotas').select('id', { count: 'exact' }),
        supabase.from('usuarios').select('id', { count: 'exact' })
      ]);

      setStats({
        pontosTuristicos: pontosResult.count || 0,
        rotas: rotasResult.count || 0,
        usuarios: usuariosResult.count || 0,
        fotos: 0 // Placeholder - implementar contagem de fotos
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : value}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do sistema Kapitour
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={MapPin}
          title="Pontos Turísticos"
          value={stats.pontosTuristicos}
          color="bg-blue-500"
        />
        <StatCard
          icon={Route}
          title="Rotas"
          value={stats.rotas}
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          title="Usuários"
          value={stats.usuarios}
          color="bg-purple-500"
        />
        <StatCard
          icon={Image}
          title="Fotos"
          value={stats.fotos}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors">
            <MapPin className="mr-2" size={20} />
            Adicionar Ponto Turístico
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors">
            <Route className="mr-2" size={20} />
            Criar Nova Rota
          </button>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors">
            <Image className="mr-2" size={20} />
            Upload de Fotos
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Atividade Recente
        </h2>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Novo ponto turístico adicionado
              </p>
              <p className="text-xs text-gray-500">Há 2 horas</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Rota "Centro Histórico" atualizada
              </p>
              <p className="text-xs text-gray-500">Há 4 horas</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Novo usuário registrado
              </p>
              <p className="text-xs text-gray-500">Há 6 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
