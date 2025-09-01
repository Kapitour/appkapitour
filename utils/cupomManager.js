import { supabase } from '../lib/supabase';

// Buscar cupons disponíveis para um parceiro
export const buscarCuponsDisponiveis = async (parceiroId) => {
  try {
    const { data, error } = await supabase
      .from('cupons')
      .select(`
        *,
        campanha:campanhas(*)
      `)
      .eq('parceiro_id', parceiroId)
      .eq('quantidade_disponivel', 'gt', 0)
      .eq('ativa', true);

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
        *,
        cupom:cupons(*),
        usuario:usuarios(nome, email)
      `)
      .eq('usuario_id', usuarioId);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar cupons resgatados:', error);
    return { success: false, error: error.message };
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

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { success: true, jaResgatado: !!data, data };
  } catch (error) {
    console.error('Erro ao verificar cupom resgatado:', error);
    return { success: false, error: error.message };
  }
};

// Resgatar um cupom
export const resgatarCupom = async (cupomId, usuarioId) => {
  try {
    // Primeiro verificar se já foi resgatado
    const verificacao = await verificarCupomResgatado(cupomId, usuarioId);
    if (!verificacao.success) {
      throw new Error(verificacao.error);
    }

    if (verificacao.jaResgatado) {
      return { success: false, error: 'Este cupom já foi resgatado por este usuário' };
    }

    // Buscar informações do cupom para verificar disponibilidade
    const { data: cupom, error: cupomError } = await supabase
      .from('cupons')
      .select('*')
      .eq('id', cupomId)
      .single();

    if (cupomError) throw cupomError;

    if (cupom.quantidade_disponivel <= 0) {
      return { success: false, error: 'Este cupom não está mais disponível' };
    }

    // Verificar se a data de validade não expirou
    const hoje = new Date();
    const dataValidade = new Date(cupom.data_validade);
    if (hoje > dataValidade) {
      return { success: false, error: 'Este cupom expirou' };
    }

    // Inserir o resgate
    const { error: resgateError } = await supabase
      .from('cupons_resgatados')
      .insert([{
        cupom_id: cupomId,
        usuario_id: usuarioId,
        data_resgate: new Date().toISOString()
      }]);

    if (resgateError) throw resgateError;

    // Atualizar quantidade disponível
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

// Buscar estatísticas de cupons para um parceiro
export const buscarEstatisticasCupons = async (parceiroId) => {
  try {
    const [cuponsResult, resgatesResult] = await Promise.all([
      supabase.from('cupons').select('*').eq('parceiro_id', parceiroId),
      supabase.from('cupons_resgatados').select(`
        *,
        cupom:cupons(parceiro_id)
      `).eq('cupom.parceiro_id', parceiroId)
    ]);

    if (cuponsResult.error) throw cuponsResult.error;
    if (resgatesResult.error) throw resgatesResult.error;

    const totalCupons = cuponsResult.data?.length || 0;
    const cuponsAtivos = cuponsResult.data?.filter(c => c.ativa && c.quantidade_disponivel > 0).length || 0;
    const totalResgates = resgatesResult.data?.length || 0;

    return {
      success: true,
      data: {
        totalCupons,
        cuponsAtivos,
        totalResgates
      }
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de cupons:', error);
    return { success: false, error: error.message };
  }
};

// Buscar histórico de resgates para um usuário
export const buscarHistoricoResgates = async (usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons_resgatados')
      .select(`
        *,
        cupom:cupons(
          *,
          campanha:campanhas(*),
          parceiro:usuarios(nome)
        )
      `)
      .eq('usuario_id', usuarioId)
      .order('data_resgate', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar histórico de resgates:', error);
    return { success: false, error: error.message };
  }
};
