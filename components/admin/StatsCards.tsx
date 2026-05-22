'use client'

import { TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react'

interface StatsCardsProps {
  totalPendentes: number
  totalConfirmados: number
  receitaPrevista: number
  ticketMedio: number
}

export default function StatsCards({ 
  totalPendentes, 
  totalConfirmados, 
  receitaPrevista,
  ticketMedio 
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Novos Pedidos',
      value: totalPendentes,
      icon: Clock,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      trend: '+12%'
    },
    {
      label: 'Confirmados',
      value: totalConfirmados,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      trend: '+8%'
    },
    {
      label: 'Receita Prevista',
      value: `R$ ${receitaPrevista.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: '+24%'
    },
    {
      label: 'Ticket Médio',
      value: `R$ ${ticketMedio.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      trend: '+5%'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-secondary border border-border rounded-2xl p-6 hover:border-border-hover transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
              {stat.trend}
            </span>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-white/50 font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-white group-hover:text-accent transition-colors">
              {stat.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
