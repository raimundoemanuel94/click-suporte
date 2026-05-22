'use client'

import { X, User, Phone, Mail, Calendar, Clock, DollarSign, MessageSquare } from 'lucide-react'
import type { Agendamento } from '@/types'

interface DetailsModalProps {
  agendamento: Agendamento | null
  onClose: () => void
}

export default function DetailsModal({ agendamento, onClose }: DetailsModalProps) {
  if (!agendamento) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-secondary border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-secondary border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Detalhes do Atendimento</h2>
            <p className="text-sm text-white/50 mt-1">Protocolo #{agendamento.protocolo}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors text-white/50 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações do Cliente */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <User className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">Nome</p>
                  <p className="text-sm font-medium text-white">{agendamento.cliente_nome}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                <div className="p-2 bg-green-400/10 rounded-lg">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">WhatsApp</p>
                  <p className="text-sm font-medium text-white">{agendamento.cliente_telefone}</p>
                </div>
              </div>

              {agendamento.cliente_email && (
                <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                  <div className="p-2 bg-blue-400/10 rounded-lg">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-1">Email</p>
                    <p className="text-sm font-medium text-white">{agendamento.cliente_email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-background rounded-xl">
                <div className="p-2 bg-purple-400/10 rounded-lg">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">Data de Criação</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(agendamento.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detalhes do Problema */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
              Detalhes do Problema
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-xl">
                <p className="text-xs text-white/50 mb-2">Descrição</p>
                <p className="text-sm text-white leading-relaxed">
                  {agendamento.problema_descricao}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-xs text-white/50 mb-2">Sistema Operacional</p>
                  <p className="text-sm font-medium text-white">
                    {agendamento.sistema_operacional || 'Não informado'}
                  </p>
                </div>

                <div className="p-4 bg-background rounded-xl">
                  <p className="text-xs text-white/50 mb-2">Categoria</p>
                  <p className="text-sm font-medium text-white capitalize">
                    {agendamento.problema_categoria?.replace('_', ' ') || 'Outro'}
                  </p>
                </div>

                <div className="p-4 bg-background rounded-xl">
                  <p className="text-xs text-white/50 mb-2">Prioridade</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                    agendamento.prioridade === 'Urgente' 
                      ? 'bg-red-500/10 text-red-400' 
                      : agendamento.prioridade === 'Critico'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {agendamento.prioridade || 'Normal'}
                  </span>
                </div>

                <div className="p-4 bg-background rounded-xl">
                  <p className="text-xs text-white/50 mb-2">Tipo de Atendimento</p>
                  <p className="text-sm font-medium text-white capitalize">
                    {agendamento.tipo_atendimento || 'Remoto'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div>
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
              Informações Financeiras
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl">
                <p className="text-xs text-white/50 mb-2">Valor Estimado</p>
                <p className="text-lg font-bold text-accent">
                  R$ {(agendamento.valor_estimado || 0).toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="p-4 bg-background rounded-xl">
                <p className="text-xs text-white/50 mb-2">Duração Estimada</p>
                <p className="text-sm font-medium text-white">
                  {agendamento.duracao_estimada || 60} minutos
                </p>
              </div>
            </div>
          </div>

          {/* Notas do Admin */}
          {agendamento.notas_admin && (
            <div>
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">
                Notas do Administrador
              </h3>
              <div className="p-4 bg-background rounded-xl">
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                  {agendamento.notas_admin}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-secondary border-t border-border p-6 flex gap-3">
          <a
            href={`https://wa.me/55${agendamento.cliente_telefone?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Abrir WhatsApp
          </a>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-background hover:bg-border text-white font-semibold rounded-xl transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
