'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Download, FileSpreadsheet, FileText, Calendar, TrendingUp, DollarSign, Users } from 'lucide-react'
import type { Agendamento } from '@/types'

export default function RelatoriosPage() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    fetchAgendamentos()
  }, [dateRange])

  const fetchAgendamentos = async () => {
    try {
      const res = await fetch('/api/agendamentos')
      const data = await res.json()
      
      if (data.success) {
        const filtered = (data.data || []).filter((ag: Agendamento) => {
          const date = new Date(ag.created_at)
          const start = new Date(dateRange.start)
          const end = new Date(dateRange.end)
          end.setHours(23, 59, 59)
          return date >= start && date <= end
        })
        setAgendamentos(filtered)
      }
    } catch (error) {
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  // Estatísticas
  const stats = {
    total: agendamentos.length,
    pendentes: agendamentos.filter(a => a.status === 'pendente').length,
    confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    concluidos: agendamentos.filter(a => a.status === 'concluido').length,
    cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
    taxaConversao: agendamentos.length > 0 
      ? ((agendamentos.filter(a => a.status === 'confirmado' || a.status === 'concluido').length / agendamentos.length) * 100).toFixed(1)
      : 0,
    receitaTotal: agendamentos
      .filter(a => a.status === 'concluido')
      .reduce((sum, a) => sum + (a.valor_final || a.valor_estimado || 0), 0),
    ticketMedio: agendamentos.length > 0
      ? agendamentos.reduce((sum, a) => sum + (a.valor_estimado || 0), 0) / agendamentos.length
      : 0
  }

  // Serviços mais solicitados
  const servicosMaisSolicitados = agendamentos.reduce((acc: any, ag) => {
    const cat = ag.problema_categoria || 'outro'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const topServicos = Object.entries(servicosMaisSolicitados)
    .sort(([,a]: any, [,b]: any) => b - a)
    .slice(0, 5)

  // Export para Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      agendamentos.map(ag => ({
        'Protocolo': ag.protocolo || 'N/A',
        'Data': new Date(ag.created_at).toLocaleDateString('pt-BR'),
        'Cliente': ag.cliente_nome,
        'Telefone': ag.cliente_telefone,
        'Email': ag.cliente_email || '',
        'Problema': ag.problema_descricao,
        'Categoria': ag.problema_categoria || '',
        'Sistema': ag.sistema_operacional || '',
        'Prioridade': ag.prioridade || 'Normal',
        'Tipo': ag.tipo_atendimento,
        'Status': ag.status,
        'Valor Estimado': ag.valor_estimado || 0,
        'Valor Final': ag.valor_final || 0,
        'Duração (min)': ag.duracao_estimada || 0
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Atendimentos')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    saveAs(blob, `relatorio-clicksuporte-${dateRange.start}-${dateRange.end}.xlsx`)
    toast.success('Relatório Excel baixado!')
  }

  // Export para CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      agendamentos.map(ag => ({
        'Protocolo': ag.protocolo || 'N/A',
        'Data': new Date(ag.created_at).toLocaleDateString('pt-BR'),
        'Cliente': ag.cliente_nome,
        'Telefone': ag.cliente_telefone,
        'Email': ag.cliente_email || '',
        'Problema': ag.problema_descricao,
        'Status': ag.status,
        'Valor': ag.valor_estimado || 0
      }))
    )

    const csv = XLSX.utils.sheet_to_csv(worksheet)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    
    saveAs(blob, `relatorio-clicksuporte-${dateRange.start}-${dateRange.end}.csv`)
    toast.success('Relatório CSV baixado!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="border-b border-border bg-secondary/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">
                Click<span className="text-accent">Suporte</span>
              </h1>
              <p className="text-xs text-white/50">Relatórios</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-background hover:bg-border text-white/70 hover:text-white text-sm font-medium rounded-xl transition"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-background hover:bg-border text-white/70 hover:text-white text-sm font-medium rounded-xl transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtro de período */}
        <div className="bg-secondary border border-border rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Período do Relatório</h2>
              <p className="text-sm text-white/50">Selecione o intervalo de datas</p>
            </div>
            
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/50" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="px-3 py-2 bg-background border border-border rounded-xl text-white text-sm focus:outline-none focus:border-border-hover"
                />
              </div>
              
              <span className="text-white/30">até</span>
              
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 bg-background border border-border rounded-xl text-white text-sm focus:outline-none focus:border-border-hover"
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-xl">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-white/50">Total de Atendimentos</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
            <div className="text-xs text-white/40 space-y-1">
              <p>Pendentes: {stats.pendentes}</p>
              <p>Confirmados: {stats.confirmados}</p>
              <p>Concluídos: {stats.concluidos}</p>
            </div>
          </div>

          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-400/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-white">{stats.taxaConversao}%</p>
              </div>
            </div>
            <p className="text-xs text-white/40">
              {stats.confirmados + stats.concluidos} de {stats.total} convertidos
            </p>
          </div>

          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-400/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Receita Total</p>
                <p className="text-3xl font-bold text-white">
                  R$ {stats.receitaTotal.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/40">
              De {stats.concluidos} atendimentos concluídos
            </p>
          </div>

          <div className="bg-secondary border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-400/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-white/50">Ticket Médio</p>
                <p className="text-3xl font-bold text-white">
                  R$ {stats.ticketMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
            <p className="text-xs text-white/40">
              Média por atendimento
            </p>
          </div>
        </div>

        {/* Top Serviços */}
        <div className="bg-secondary border border-border rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Serviços Mais Solicitados</h3>
          <div className="space-y-3">
            {topServicos.map(([servico, count]: any) => (
              <div key={servico} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span className="text-white capitalize">{servico.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-background rounded-full h-2">
                    <div 
                      className="bg-accent h-2 rounded-full"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-white/70 text-sm font-medium min-w-[3rem] text-right">
                    {count} ({((count / stats.total) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="bg-secondary border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Exportar Dados</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>Exportar para Excel (.xlsx)</span>
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition"
            >
              <FileText className="w-5 h-5" />
              <span>Exportar para CSV (.csv)</span>
              <Download className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-white/40 mt-4 text-center">
            Os arquivos incluem: Protocolo, Data, Cliente, Telefone, Email, Problema, Status e Valores
          </p>
        </div>
      </div>
    </div>
  )
}
