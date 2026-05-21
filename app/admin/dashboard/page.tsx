'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Agendamento } from '@/types'

export default function AdminDashboard() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'pendente' | 'confirmado'>('pendente')

  useEffect(() => {
    // Verificar autenticação
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }

    fetchAgendamentos()
  }, [filter])

  const fetchAgendamentos = async () => {
    try {
      const url = filter === 'todos' 
        ? '/api/agendamentos'
        : `/api/agendamentos?status=${filter}`
      
      const res = await fetch(url)
      const data = await res.json()
      
      if (data.success) {
        setAgendamentos(data.data || [])
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      const data = await res.json()
      
      if (data.success) {
        fetchAgendamentos()
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const pendentes = agendamentos.filter(a => a.status === 'pendente').length
  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length
  const totalReceita = agendamentos
    .filter(a => a.status === 'confirmado' || a.status === 'concluido')
    .reduce((sum, a) => sum + (a.valor_estimado || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-secondary/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Click<span className="text-accent">Suporte</span></h1>
              <p className="text-xs text-white/50">Admin Dashboard</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="text-3xl font-bold text-accent mb-1">{pendentes}</div>
            <div className="text-sm text-white/50">Novos Pedidos</div>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">{confirmados}</div>
            <div className="text-sm text-white/50">Confirmados</div>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="text-3xl font-bold text-white mb-1">R$ {totalReceita}</div>
            <div className="text-sm text-white/50">Receita Prevista</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('pendente')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'pendente'
                ? 'bg-accent text-black'
                : 'bg-secondary text-white/70 hover:text-white'
            }`}
          >
            Pendentes ({pendentes})
          </button>
          <button
            onClick={() => setFilter('confirmado')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'confirmado'
                ? 'bg-accent text-black'
                : 'bg-secondary text-white/70 hover:text-white'
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'todos'
                ? 'bg-accent text-black'
                : 'bg-secondary text-white/70 hover:text-white'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Lista de Agendamentos */}
        {loading ? (
          <div className="text-center py-12 text-white/50">Carregando...</div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-12 bg-secondary border border-border rounded-2xl">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-white/50">Nenhum agendamento encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="bg-secondary border border-border rounded-2xl p-6 hover:border-border-hover transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agendamento.status === 'pendente'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          : agendamento.status === 'confirmado'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-white/10 text-white/50 border border-white/10'
                      }`}>
                        {agendamento.status}
                      </span>
                      <span className="text-xs text-white/30 font-mono">
                        {new Date(agendamento.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                      {agendamento.cliente_nome}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-white/70">
                      <p>📱 {agendamento.cliente_telefone}</p>
                      {agendamento.cliente_endereco && (
                        <p>📍 {agendamento.cliente_endereco}</p>
                      )}
                      <p>🛠️ {agendamento.problema_descricao}</p>
                      {agendamento.diagnostico_ia && (
                        <p className="text-accent">💡 {agendamento.diagnostico_ia}</p>
                      )}
                      <p>📅 {new Date(agendamento.data_agendamento).toLocaleString('pt-BR')}</p>
                      <p>⏱️ {agendamento.duracao_estimada} min • {agendamento.tipo_atendimento}</p>
                      {agendamento.valor_estimado && (
                        <p className="font-semibold text-white">💰 R$ {agendamento.valor_estimado}</p>
                      )}
                    </div>
                  </div>

                  {agendamento.status === 'pendente' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(agendamento.id, 'confirmado')}
                        className="px-4 py-2 bg-accent text-black font-medium rounded-lg hover:bg-accent/90 transition text-sm"
                      >
                        ✓ Confirmar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(agendamento.id, 'rejeitado')}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 font-medium rounded-lg hover:bg-red-500/20 transition text-sm"
                      >
                        ✕ Rejeitar
                      </button>
                    </div>
                  )}

                  {agendamento.status === 'confirmado' && (
                    <button
                      onClick={() => handleUpdateStatus(agendamento.id, 'concluido')}
                      className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 font-medium rounded-lg hover:bg-green-500/20 transition text-sm"
                    >
                      ✓ Marcar como Concluído
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
