'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  atendimentos: number
  receita: number
}

interface AtendimentosChartProps {
  data: ChartData[]
}

export default function AtendimentosChart({ data }: AtendimentosChartProps) {
  return (
    <div className="bg-secondary border border-border rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Atendimentos nos últimos 7 dias</h3>
        <p className="text-sm text-white/50">Acompanhe o volume de solicitações</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAtendimentos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4FF3A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D4FF3A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis 
            dataKey="date" 
            stroke="#ffffff30"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#ffffff30"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
              borderRadius: '12px',
              padding: '12px'
            }}
            labelStyle={{ color: '#fff', marginBottom: '8px' }}
          />
          <Area
            type="monotone"
            dataKey="atendimentos"
            stroke="#D4FF3A"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorAtendimentos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
