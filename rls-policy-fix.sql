-- Ajuste da política RLS para permitir inserção de novos usuários
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, vamos verificar as políticas atuais
-- SELECT * FROM pg_policies WHERE tablename = 'usuarios';

-- Remover política existente se houver
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON usuarios;

-- Criar nova política que permite inserção para usuários não autenticados
-- (necessário para o cadastro funcionar)
CREATE POLICY "Allow insert for new users" ON usuarios
  FOR INSERT
  WITH CHECK (true);

-- Ou, se preferir manter mais restritivo, use esta versão:
-- CREATE POLICY "Allow insert for new users" ON usuarios
--   FOR INSERT
--   WITH CHECK (auth_id IS NOT NULL);

-- Verificar se a política foi criada
-- SELECT * FROM pg_policies WHERE tablename = 'usuarios';
