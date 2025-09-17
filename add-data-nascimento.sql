-- Adicionar coluna data_nascimento na tabela usuarios
-- Execute este SQL no Supabase SQL Editor

-- Adicionar a coluna data_nascimento
ALTER TABLE usuarios 
ADD COLUMN data_nascimento DATE;

-- Verificar se a coluna foi adicionada
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'usuarios' 
-- ORDER BY ordinal_position;
