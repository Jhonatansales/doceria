/*
  # Criar tabela de configurações

  1. Nova Tabela
    - `configuracoes`
      - `id` (uuid, primary key)
      - `nome_confeitaria` (text, nome da confeitaria)
      - `contato_whatsapp` (text, WhatsApp de contato)
      - `chave_pix` (text, chave PIX)
      - `margem_lucro_padrao` (numeric, margem de lucro padrão em %)
      - `custo_embalagem_padrao` (numeric, custo de embalagem padrão)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `configuracoes`
    - Adicionar política para usuários autenticados
*/

CREATE TABLE IF NOT EXISTS configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_confeitaria text DEFAULT 'Minha Confeitaria',
  contato_whatsapp text,
  chave_pix text,
  margem_lucro_padrao numeric DEFAULT 35,
  custo_embalagem_padrao numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own configuracoes"
  ON configuracoes
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = auth.uid()::text);

-- Inserir configuração padrão
INSERT INTO configuracoes (nome_confeitaria, margem_lucro_padrao, custo_embalagem_padrao)
VALUES ('Doce Sabor', 35, 0)
ON CONFLICT DO NOTHING;