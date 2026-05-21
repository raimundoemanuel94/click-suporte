-- ========================================
-- CLICK SUPORTE - DATABASE SCHEMA
-- ========================================

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados do Cliente
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(20) NOT NULL,
  cliente_email VARCHAR(255),
  cliente_endereco TEXT,
  
  -- Dados do Problema
  problema_descricao TEXT NOT NULL,
  problema_categoria VARCHAR(100),
  diagnostico_ia TEXT,
  
  -- Agendamento
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  duracao_estimada INTEGER DEFAULT 60, -- em minutos
  tipo_atendimento VARCHAR(50) DEFAULT 'presencial', -- presencial ou remoto
  
  -- Valores
  valor_estimado DECIMAL(10,2),
  valor_final DECIMAL(10,2),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, confirmado, rejeitado, concluido, cancelado
  
  -- Notas
  notas_admin TEXT,
  conversa_ia JSONB, -- histórico completo da conversa com IA
  
  -- Índices
  CONSTRAINT valid_status CHECK (status IN ('pendente', 'confirmado', 'rejeitado', 'concluido', 'cancelado'))
);

-- Índices para performance
CREATE INDEX idx_agendamentos_status ON agendamentos(status);
CREATE INDEX idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX idx_agendamentos_created ON agendamentos(created_at DESC);

-- Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave VARCHAR(100) UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor) VALUES
('horarios_disponiveis', '{
  "segunda": {"inicio": "17:30", "fim": "21:00"},
  "terca": {"inicio": "17:30", "fim": "21:00"},
  "quarta": {"inicio": "17:30", "fim": "21:00"},
  "quinta": {"inicio": "17:30", "fim": "21:00"},
  "sexta": {"inicio": "17:30", "fim": "21:00"},
  "sabado": {"inicio": "08:00", "fim": "20:00"},
  "domingo": {"inicio": "08:00", "fim": "20:00"}
}'::jsonb),
('servicos', '{
  "formatacao": {"nome": "Formatação Completa", "duracao": 120, "preco": 150},
  "virus": {"nome": "Remoção de Vírus", "duracao": 60, "preco": 100},
  "backup": {"nome": "Backup & Recuperação", "duracao": 90, "preco": 120},
  "wifi": {"nome": "Configuração Wi-Fi", "duracao": 60, "preco": 100},
  "hardware": {"nome": "Reparo Hardware", "duracao": 90, "preco": 150},
  "consultoria": {"nome": "Consultoria Técnica", "duracao": 30, "preco": 80}
}'::jsonb),
('admin_credentials', '{
  "email": "admin@clicksuporte.com",
  "password_hash": "$2a$10$placeholder"
}'::jsonb)
ON CONFLICT (chave) DO NOTHING;

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agendamentos_updated_at 
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON configuracoes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View para dashboard (agendamentos resumidos)
CREATE OR REPLACE VIEW dashboard_agendamentos AS
SELECT 
  id,
  cliente_nome,
  cliente_telefone,
  problema_descricao,
  problema_categoria,
  data_agendamento,
  duracao_estimada,
  tipo_atendimento,
  valor_estimado,
  status,
  created_at
FROM agendamentos
ORDER BY 
  CASE status
    WHEN 'pendente' THEN 1
    WHEN 'confirmado' THEN 2
    WHEN 'concluido' THEN 3
    WHEN 'rejeitado' THEN 4
    WHEN 'cancelado' THEN 5
  END,
  data_agendamento ASC;
