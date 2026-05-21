'use client'

import { useState } from 'react'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4FF3A] rounded-lg flex items-center justify-center">
              <span className="text-xl font-black text-black">C</span>
            </div>
            <span className="text-xl font-bold text-white">Click<span className="text-[#D4FF3A]">Suporte</span></span>
          </div>
          <button onClick={() => setShowChat(true)} className="px-6 py-2 bg-[#D4FF3A] text-black font-semibold rounded-lg hover:bg-[#D4FF3A]/90 transition">
            Começar agora
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-[#D4FF3A]/10 border border-[#D4FF3A]/20 rounded-full text-sm text-[#D4FF3A] mb-8">
            v2.0 · Sorriso · MT · Desde 2020
          </div>
          <h1 className="text-6xl md:text-8xl font-bold leading-none mb-8 text-white">
            Suporte técnico<br/>
            <span className="italic text-[#D4FF3A]">sem</span> <span className="text-white/30">enrolação</span><br/>
            sem espera.
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
            Resolvemos problemas reais de PC em até 2 horas. Remoto, presencial, ou enquanto você toma um café.
          </p>
          <button onClick={() => setShowChat(true)} className="px-8 py-4 bg-[#D4FF3A] text-black font-bold rounded-xl hover:bg-[#D4FF3A]/90 transition text-lg">
            Começar agora →
          </button>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-[#D4FF3A] mb-2">5.000+</div>
            <div className="text-sm text-white/50">PCs atendidos</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">15 min</div>
            <div className="text-sm text-white/50">Tempo de resposta</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">98%</div>
            <div className="text-sm text-white/50">Satisfação</div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-8">
            <div className="text-4xl font-bold text-white mb-2">30 dias</div>
            <div className="text-sm text-white/50">Garantia</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="bg-[#D4FF3A] rounded-3xl p-12 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-black mb-6">
            Seu PC <span className="italic">merece mais</span> que improviso.
          </h2>
          <button onClick={() => setShowChat(true)} className="px-8 py-4 bg-black text-[#D4FF3A] font-bold rounded-xl hover:bg-black/90 transition text-lg">
            Começar atendimento →
          </button>
        </div>
      </section>

      {showChat && <ChatWidget onClose={() => setShowChat(false)} />}

      {!showChat && (
        <button onClick={() => setShowChat(true)} className="fixed bottom-6 right-6 w-16 h-16 bg-[#D4FF3A] text-black rounded-full shadow-lg hover:scale-110 transition flex items-center justify-center text-2xl z-50">
          💬
        </button>
      )}
    </div>
  )
}
