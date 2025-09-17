-- Função para criar usuário completo (tipo 3 - Usuário Comum)
-- Execute este SQL no Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_user_complete(
  p_auth_id UUID,
  p_nome TEXT,
  p_email TEXT,
  p_cpf TEXT,
  p_sexo TEXT,
  p_data_nascimento DATE,
  p_data_criacao TIMESTAMP
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Insere o usuário na tabela usuarios
  INSERT INTO usuarios (
    auth_id,
    nome,
    email,
    cpf,
    sexo,
    data_nascimento,
    data_criacao,
    tipo_usuario_id
  ) VALUES (
    p_auth_id,
    p_nome,
    p_email,
    p_cpf,
    p_sexo,
    p_data_nascimento,
    p_data_criacao,
    3  -- Usuário Comum por padrão
  );
  
  -- Retorna sucesso
  result := json_build_object(
    'success', true,
    'message', 'Usuário criado com sucesso'
  );
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Retorna erro
    result := json_build_object(
      'success', false,
      'error', SQLERRM
    );
    
    RETURN result;
END;
$$;

-- Conceder permissão para a função
GRANT EXECUTE ON FUNCTION create_user_complete TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_complete TO anon;
