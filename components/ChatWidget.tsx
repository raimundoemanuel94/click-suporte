'use client'

import { useState } from 'react'

export default function ChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Olá! Sou o assistente do Click Suporte. Qual problema você está enfrentando com seu PC?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      })

      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        
        try {
          const jsonMatch = data.message.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const dados = JSON.parse(jsonMatch[0])
            if (dados.dados_coletados) {
              await fetch('/api/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
              })
              
              setMessages(prev => [...prev, {
                role: 'assistant',
                content: '✅ Perfeito! Seu agendamento foi enviado. Raimundo vai confirmar em até 1 hora e entrar em contato pelo WhatsApp!'
              }])
            }
          }
        } catch (e) {
          // continua
        }
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="bg-[#D4FF3A] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <span className="text-xl font-black text-[#D4FF3A]">C</span>
          </div>
          <div>
            <div className="font-bold text-black">Click Suporte</div>
            <div className="text-xs text-black/70">Assistente IA</div>
          </div>
        </div>
        <button onClick={onClose} className="text-black hover:text-black/70 transition text-2xl">×</button>
      </div>

      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-[#0A0A0A]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-xl ${
              msg.role === 'user' ? 'bg-[#D4FF3A] text-black' : 'bg-[#111111] border border-white/10 text-white'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#111111] border border-white/10 px-4 py-2 rounded-xl text-white">Digitando...</div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-[#0A0A0A]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 bg-[#111111] border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-[#D4FF3A] text-black font-semibold rounded-lg hover:bg-[#D4FF3A]/90 transition disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
