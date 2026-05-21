'use client'

import { useState } from 'react'

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <span className="text-xl font-bold">Click<span className="text-accent">Suporte</span></span>
          </div>
          <button
            onClick={() => setShowChat(true)}
            className="px-6 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition"
          >
            Começar agora
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-sm text-accent mb-8">
            v2.0 · Sorriso · MT · Desde 2020
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-none mb-8">
            Suporte técnico<br/>
            <span className="italic text-accent">sem</span> <span className="text-white/30">enrolação</span><br/>
            sem espera.
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
            Resolvemos problemas reais de PC em até 2 horas. Remoto, presencial, ou enquanto você toma um café.
          </p>
          <button
            onClick={() => setShowChat(true)}
            className="px-8 py-4 bg-accent text-black font-bold rounded-xl hover:bg-accent/90 transition text-lg"
          >
            Começar agora →
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-secondary border border-border rounded-2xl p-8">
            <div className="text-4xl font-bold text-accent mb-2">5.000+</div>
            <div className="text-sm text-white/50">PCs atendidos</div>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">15 min</div>
            <div className="text-sm text-white/50">Tempo de resposta</div>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-sm text-white/50">Satisfação</div>
          </div>
          <div className="bg-secondary border border-border rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">30 dias</div>
            <div className="text-sm text-white/50">Garantia</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-accent rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Seu PC <span className="italic">merece mais</span> que improviso.
          </h2>
          <button
            onClick={() => setShowChat(true)}
            className="px-8 py-4 bg-black text-accent font-bold rounded-xl hover:bg-black/90 transition text-lg"
          >
            Começar atendimento →
          </button>
        </div>
      </section>

      {/* Chat Widget */}
      {showChat && (
        <ChatWidget onClose={() => setShowChat(false)} />
      )}

      {/* Floating Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-accent text-black rounded-full shadow-lg hover:scale-110 transition flex items-center justify-center text-2xl z-50"
        >
          💬
        </button>
      )}
    </div>
  )
}

// Chat Widget Component
function ChatWidget({ onClose }: { onClose: () => void }) {
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
        
        // Tentar extrair JSON dos dados coletados
        try {
          const jsonMatch = data.message.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const dados = JSON.parse(jsonMatch[0])
            if (dados.dados_coletados) {
              // Enviar para backend
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
          // Não é JSON, continua conversando
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md bg-secondary border border-border rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-accent p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <span className="text-xl font-black text-accent">C</span>
          </div>
          <div>
            <div className="font-bold text-black">Click Suporte</div>
            <div className="text-xs text-black/70">Assistente IA</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-black hover:text-black/70 transition text-2xl"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl ${
                msg.role === 'user'
                  ? 'bg-accent text-black'
                  : 'bg-background border border-border text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-background border border-border px-4 py-2 rounded-xl text-white">
              Digitando...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-border-hover"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  )
}
