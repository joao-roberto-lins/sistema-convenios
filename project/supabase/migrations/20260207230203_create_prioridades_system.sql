/*
  # Sistema de Controle de Convênios e Prioridades

  1. Novas Tabelas
    - `prioridades`
      - `id` (uuid, primary key)
      - `protocolo` (text, número do protocolo)
      - `numero_prioridade` (text, número da prioridade)
      - `descricao` (text, descrição da prioridade)
      - `data_liberacao` (date, data de liberação)
      - `prazo_maximo` (date, prazo máximo para execução)
      - `user_id` (uuid, referência ao usuário)
      - `created_at` (timestamptz, data de criação)
      - `updated_at` (timestamptz, data de atualização)
    
    - `documentos`
      - `id` (uuid, primary key)
      - `prioridade_id` (uuid, referência à prioridade)
      - `nome_documento` (text, nome do documento)
      - `status` (text, status: 'sem_documento', 'em_elaboracao', 'cadastrado')
      - `created_at` (timestamptz, data de criação)
      - `updated_at` (timestamptz, data de atualização)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados acessarem apenas seus próprios dados
*/

-- Criar tabela de prioridades
CREATE TABLE IF NOT EXISTS prioridades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo text NOT NULL,
  numero_prioridade text NOT NULL,
  descricao text NOT NULL,
  data_liberacao date NOT NULL,
  prazo_maximo date NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prioridade_id uuid NOT NULL REFERENCES prioridades(id) ON DELETE CASCADE,
  nome_documento text NOT NULL,
  status text NOT NULL DEFAULT 'sem_documento',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_prioridades_user_id ON prioridades(user_id);
CREATE INDEX IF NOT EXISTS idx_documentos_prioridade_id ON documentos(prioridade_id);

-- Habilitar RLS
ALTER TABLE prioridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Políticas para prioridades
CREATE POLICY "Usuários podem ver suas próprias prioridades"
  ON prioridades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias prioridades"
  ON prioridades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias prioridades"
  ON prioridades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias prioridades"
  ON prioridades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para documentos
CREATE POLICY "Usuários podem ver documentos de suas prioridades"
  ON documentos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prioridades
      WHERE prioridades.id = documentos.prioridade_id
      AND prioridades.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar documentos em suas prioridades"
  ON documentos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prioridades
      WHERE prioridades.id = documentos.prioridade_id
      AND prioridades.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar documentos de suas prioridades"
  ON documentos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prioridades
      WHERE prioridades.id = documentos.prioridade_id
      AND prioridades.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prioridades
      WHERE prioridades.id = documentos.prioridade_id
      AND prioridades.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem deletar documentos de suas prioridades"
  ON documentos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prioridades
      WHERE prioridades.id = documentos.prioridade_id
      AND prioridades.user_id = auth.uid()
    )
  );