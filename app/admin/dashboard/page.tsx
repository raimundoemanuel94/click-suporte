'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import type { Agendamento } from '@/types'

// Components
import StatsCards from '@/components/admin/StatsCards'
import AtendimentosChart from '@/components/admin/AtendimentosChart'
import AtendimentosTable from '@/components/admin/AtendimentosTable'
import DetailsModal from '@/components/admin/DetailsModal'

export default function AdminDashboard() {
  const router = useRouter()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin')
      return
    }
    fetchAgendamentos()
  }, [])

  const fetchAgendamentos = async () => {
    try {
      const res = await fetch('/api/agendamentos')
      const data = await res.json()
      
      if (data.success) {
        setAgendamentos(data.data || [])
      }
    } catch (error) {
      toast.error('Erro ao carregar atendimentos')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      
      const res = await fetch(`/api/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (res.ok) {
        toast.success(`Atendimento ${status === 'confirmado' ? 'confirmado' : 'rejeitado'}!`)
        fetchAgendamentos()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Erro ao atualizar')
      }
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin')
  }

  const stats = {
    totalPendentes: agendamentos.filter(a => a.status === 'pendente').length,
    totalConfirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    receitaPrevista: agendamentos
      .filter(a => a.status !== 'cancelado')
      .reduce((sum, a) => sum + (a.valor_estimado || 0), 0),
    ticketMedio: agendamentos.length > 0
      ? agendamentos.reduce((sum, a) => sum + (a.valor_estimado || 0), 0) / agendamentos.length
      : 0
  }

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    
    const dayAgendamentos = agendamentos.filter(a => {
      const agDate = new Date(a.created_at)
      return agDate.toDateString() === date.toDateString()
    })

    return {
      date: dateStr,
      atendimentos: dayAgendamentos.length,
      receita: dayAgendamentos.reduce((sum, a) => sum + (a.valor_estimado || 0), 0)
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
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
              <p className="text-xs text-white/50">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/relatorios')}
              className="px-4 py-2 bg-accent hover:bg-accent/90 text-black text-sm font-medium rounded-xl transition"
            >
              📊 Relatórios
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <StatsCards
          totalPendentes={stats.totalPendentes}
          totalConfirmados={stats.totalConfirmados}
          receitaPrevista={stats.receitaPrevista}
          ticketMedio={stats.ticketMedio}
        />

        <div className="mb-8">
          <AtendimentosChart data={chartData} />
        </div>

        <AtendimentosTable
          agendamentos={agendamentos}
          onUpdateStatus={handleUpdateStatus}
          onViewDetails={setSelectedAgendamento}
        />
      </div>

      <DetailsModal
        agendamento={selectedAgendamento}
        onClose={() => setSelectedAgendamento(null)}
        onUpdate={fetchAgendamentos}
      />
    </div>
  )
}
