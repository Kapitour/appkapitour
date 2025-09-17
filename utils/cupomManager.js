import { supabase } from '../lib/supabase';

// Buscar cupons disponíveis para um usuário
export const buscarCuponsDisponiveis = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons')
      .select(`
        id,
        codigo,
        descricao,
        data_validade,
        quantidade_disponivel,
        campanha:campanhas(nome)
      `)
      .gt('quantidade_disponivel', 0);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar cupons disponíveis:', error);
    return { success: false, error: error.message };
  }
};

// Buscar cupons resgatados por um usuário
export const buscarCuponsResgatados = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons_resgatados')
      .select(`
        id,
        data_resgate,
        cupom:cupons!cupons_resgatados_cupom_id_fkey(
          id,
          codigo,
          descricao,
          data_validade,
          campanha:campanhas(nome)
        )
      `)
      .eq('usuario_id', usuarioId);

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar cupons resgatados:', error);
    return { success: false, error: error.message };
  }
};

// Buscar histórico de resgates (para parceiros)
export const buscarHistoricoResgates = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons_resgatados')
      .select(`
        id,
        data_resgate,
        usuario:usuarios!cupons_resgatados_usuario_id_fkey(
          id,
          nome,
          email
        ),
        cupom:cupons!cupons_resgatados_cupom_id_fkey(
          id,
          codigo,
          descricao,
          data_validade,
          campanha:campanhas(nome)
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('data_resgate', { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Erro ao buscar histórico de resgates:', err);
    return { success: false, error: err.message };
  }
};

// Verificar se um usuário já resgatou um cupom específico
export const verificarCupomResgatado = async (cupomId, usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons_resgatados')
      .select('*')
      .eq('cupom_id', cupomId)
      .eq('usuario_id', usuarioId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, jaResgatado: !!data, data };
  } catch (error) {
    console.error('Erro ao verificar cupom resgatado:', error);
    return { success: false, error: error.message };
  }
};

// Resgatar um cupom
export const resgatarCupom = async (cupomId, usuarioId) => {
  try {
    const verificacao = await verificarCupomResgatado(cupomId, usuarioId);
    if (!verificacao.success) throw new Error(verificacao.error);
    if (verificacao.jaResgatado) return { success: false, error: 'Cupom já resgatado' };

    const { data: cupom, error: cupomError } = await supabase
      .from('cupons')
      .select('*')
      .eq('id', cupomId)
      .single();
    if (cupomError) throw cupomError;

    if (cupom.quantidade_disponivel <= 0) return { success: false, error: 'Cupom não disponível' };

    const hoje = new Date();
    if (hoje > new Date(cupom.data_validade)) return { success: false, error: 'Cupom expirado' };

    const { error: resgateError } = await supabase
      .from('cupons_resgatados')
      .insert([{ cupom_id: cupomId, usuario_id: usuarioId, data_resgate: new Date().toISOString() }]);
    if (resgateError) throw resgateError;

    const { error: updateError } = await supabase
      .from('cupons')
      .update({ quantidade_disponivel: cupom.quantidade_disponivel - 1 })
      .eq('id', cupomId);
    if (updateError) throw updateError;

    return { success: true, message: 'Cupom resgatado com sucesso!' };
  } catch (error) {
    console.error('Erro ao resgatar cupom:', error);
    return { success: false, error: error.message };
  }
};
