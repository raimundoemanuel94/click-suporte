'use client'

import { useState } from 'react'
import { Search, Filter, Phone, MessageCircle, MoreVertical, Eye, Check, X } from 'lucide-react'
import type { Agendamento } from '@/types'

interface AtendimentosTableProps {
  agendamentos: Agendamento[]
  onUpdateStatus: (id: string, status: string) => void
  onViewDetails: (agendamento: Agendamento) => void
}

export default function AtendimentosTable({ 
  agendamentos, 
  onUpdateStatus,
  onViewDetails 
}: AtendimentosTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPrioridade, setFilterPrioridade] = useState<string>('all')

  const filtered = agendamentos.filter(ag => {
    const matchesSearch = 
      ag.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.protocolo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ag.cliente_telefone?.includes(searchTerm)
    
    const matchesPrioridade = 
      filterPrioridade === 'all' || ag.prioridade === filterPrioridade

    return matchesSearch && matchesPrioridade
  })

  const getPrioridadeBadge = (prioridade: string) => {
    const styles = {
      'Urgente': 'bg-red-500/10 text-red-400 border-red-500/20',
      'Normal': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Critico': 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    }
    return styles[prioridade as keyof typeof styles] || styles.Normal
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      'pendente': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'confirmado': 'bg-green-500/10 text-green-400 border-green-500/20',
      'concluido': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'cancelado': 'bg-red-500/10 text-red-400 border-red-500/20'
    }
    return styles[status as keyof typeof styles] || styles.pendente
  }

  return (
    <div className="bg-secondary border border-border rounded-2xl overflow-hidden">
      {/* Header com filtros */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Atendimentos</h3>
            <p className="text-sm text-white/50">{filtered.length} solicitações encontradas</p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            {/* Busca */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Buscar por nome, protocolo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-border-hover transition"
              />
            </div>

            {/* Filtro de prioridade */}
            <select
              value={filterPrioridade}
              onChange={(e) => setFilterPrioridade(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-xl text-white text-sm focus:outline-none focus:border-border-hover transition"
            >
              <option value="all">Todas prioridades</option>
              <option value="Normal">Normal</option>
              <option value="Urgente">Urgente</option>
              <option value="Critico">Crítico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Protocolo
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Cliente
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Problema
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Data
              </th>
              <th className="text-right py-4 px-6 text-xs font-medium text-white/50 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <p className="text-white/30">Nenhum atendimento encontrado</p>
                </td>
              </tr>
            ) : (
              filtered.map((agendamento) => (
                <tr 
                  key={agendamento.id}
                  className="border-b border-border hover:bg-background/50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm font-medium text-accent">
                      #{agendamento.protocolo || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-white text-sm">
                        {agendamento.cliente_nome}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {agendamento.cliente_telefone}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-white/70 max-w-xs truncate">
                      {agendamento.problema_descricao}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {agendamento.sistema_operacional || 'N/A'}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getPrioridadeBadge(agendamento.prioridade || 'Normal')}`}>
                      {agendamento.prioridade || 'Normal'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStatusBadge(agendamento.status)}`}>
                      {agendamento.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-white/70">
                      {new Date(agendamento.created_at).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {new Date(agendamento.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://wa.me/55${agendamento.cliente_telefone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-background rounded-lg transition-colors text-white/50 hover:text-green-400"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      
                      <button
                        onClick={() => onViewDetails(agendamento)}
                        className="p-2 hover:bg-background rounded-lg transition-colors text-white/50 hover:text-accent"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {agendamento.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(agendamento.id, 'confirmado')}
                            className="p-2 hover:bg-background rounded-lg transition-colors text-white/50 hover:text-green-400"
                            title="Confirmar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(agendamento.id, 'cancelado')}
                            className="p-2 hover:bg-background rounded-lg transition-colors text-white/50 hover:text-red-400"
                            title="Rejeitar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
