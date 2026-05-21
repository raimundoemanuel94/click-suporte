export interface Agendamento {
  id: string
  created_at: string
  updated_at: string
  cliente_nome: string
  cliente_telefone: string
  cliente_email?: string
  cliente_endereco?: string
  problema_descricao: string
  problema_categoria?: string
  diagnostico_ia?: string
  data_agendamento: string
  duracao_estimada: number
  tipo_atendimento: 'presencial' | 'remoto'
  valor_estimado?: number
  valor_final?: number
  status: 'pendente' | 'confirmado' | 'rejeitado' | 'concluido' | 'cancelado'
  notas_admin?: string
  conversa_ia?: ConversaIA[]
}

export interface ConversaIA {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Servico {
  nome: string
  duracao: number
  preco: number
}

export interface HorarioDisponivel {
  inicio: string
  fim: string
}

export interface Configuracoes {
  horarios_disponiveis: {
    segunda: HorarioDisponivel
    terca: HorarioDisponivel
    quarta: HorarioDisponivel
    quinta: HorarioDisponivel
    sexta: HorarioDisponivel
    sabado: HorarioDisponivel
    domingo: HorarioDisponivel
  }
  servicos: {
    [key: string]: Servico
  }
}

export interface AgendamentoCreate {
  cliente_nome: string
  cliente_telefone: string
  cliente_email?: string
  cliente_endereco?: string
  problema_descricao: string
  problema_categoria?: string
  diagnostico_ia?: string
  data_agendamento: string
  duracao_estimada: number
  tipo_atendimento: 'presencial' | 'remoto'
  valor_estimado?: number
  conversa_ia?: ConversaIA[]
}
