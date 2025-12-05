import { supabase } from '../lib/supabase';

// Buscar cupons disponíveis
// Se parceiroId for fornecido, filtra cupons daquele parceiro (para o leitor)
export const buscarCuponsDisponiveis = async (parceiroId) => {
  try {
    let query = supabase
      .from('cupons')
      .select(`
        id,
        codigo,
        descricao,
        data_validade,
        quantidade_disponivel,
        campanha_id,
        campanha:campanhas(id, nome, descricao, data_inicio, data_fim, ativa)
      `)
      .gt('quantidade_disponivel', 0);

    if (parceiroId) {
      query = query.eq('parceiro_id', parceiroId);
    }

    const { data, error } = await query;

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

// Verificar se um usuário já resgatou qualquer cupom dessa campanha
export const verificarResgatePorCampanha = async (campanhaId, usuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons_resgatados')
      .select(`
        id,
        cupom:cupons!cupons_resgatados_cupom_id_fkey(campanha_id)
      `)
      .eq('usuario_id', usuarioId)
      .eq('cupom.campanha_id', campanhaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return { success: true, jaResgatouCampanha: !!data };
  } catch (error) {
    console.error('Erro ao verificar resgate por campanha:', error);
    return { success: false, error: error.message };
  }
};

// Resgatar um cupom
export const resgatarCupom = async (cupomId, usuarioId, parceiroId) => {
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

    // Validar que este cupom pertence ao parceiro logado
    if (parceiroId && cupom.parceiro_id !== parceiroId) {
      return { success: false, error: 'Cupom não pertence a esta loja/parceiro.' };
    }

    if (cupom.quantidade_disponivel <= 0) return { success: false, error: 'Cupom não disponível' };

    // Validar campanha ativa e dentro do período, se houver campanha
    if (cupom.campanha_id) {
      const { data: campanha, error: campError } = await supabase
        .from('campanhas')
        .select('id, ativa, data_inicio, data_fim')
        .eq('id', cupom.campanha_id)
        .single();
      if (campError) throw campError;
      if (!campanha) return { success: false, error: 'Campanha não encontrada' };

      const hoje = new Date();
      const inicio = campanha.data_inicio ? new Date(campanha.data_inicio) : null;
      const fim = campanha.data_fim ? new Date(campanha.data_fim) : null;

      if (campanha.ativa === false) return { success: false, error: 'Campanha inativa' };
      if (inicio && hoje < inicio) return { success: false, error: 'Campanha ainda não começou' };
      if (fim && hoje > fim) return { success: false, error: 'Campanha encerrada' };
    }

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

// Buscar campanhas associadas a um parceiro (parceiro_id em cupons)
export const buscarCampanhasDoParceiro = async (parceiroUsuarioId) => {
  try {
    // Pegar campanhas distintas em que existam cupons do parceiro
    const { data, error } = await supabase
      .from('cupons')
      .select(`
        campanha_id,
        campanha:campanhas(
          id,
          nome,
          descricao,
          data_inicio,
          data_fim,
          ativa
        )
      `)
      .eq('parceiro_id', parceiroUsuarioId);

    if (error) throw error;

    const campanhasMap = new Map();
    (data || []).forEach((row) => {
      if (row.campanha && !campanhasMap.has(row.campanha.id)) {
        campanhasMap.set(row.campanha.id, row.campanha);
      }
    });

    return { success: true, data: Array.from(campanhasMap.values()) };
  } catch (error) {
    console.error('Erro ao buscar campanhas do parceiro:', error);
    return { success: false, error: error.message };
  }
};

// Contagem de cupons disponíveis por campanha para um parceiro
export const buscarContagemCuponsPorCampanha = async (parceiroUsuarioId) => {
  try {
    const { data, error } = await supabase
      .from('cupons')
      .select('campanha_id, quantidade_disponivel')
      .eq('parceiro_id', parceiroUsuarioId);

    if (error) throw error;

    const contagem = new Map();
    (data || []).forEach((row) => {
      const atual = contagem.get(row.campanha_id) || 0;
      contagem.set(row.campanha_id, atual + (row.quantidade_disponivel || 0));
    });

    return { success: true, data: Object.fromEntries(contagem) };
  } catch (error) {
    console.error('Erro ao contar cupons por campanha:', error);
    return { success: false, error: error.message };
  }
};
