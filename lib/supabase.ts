import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
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
  conversa_ia?: any
}
